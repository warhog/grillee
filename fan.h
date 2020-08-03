#pragma once
#include <Arduino.h>
#include <FunctionalInterrupt.h>
#include <MedianFilterLib.h>

#include "timeout.h"
#include "ledc.h"

//#define DEBUG
#define LEDC_FAN_BIT 8
#define LEDC_FAN_MAX 255

namespace ventilation {

    // minimum rpm, below alarm detection is triggered
    const unsigned int MIN_RPM = 300;
    // time to wait in seconds before triggering an alarm if rpm is below MIN_RPM
    const unsigned int ALARM_WAIT_TIME = 5;
    // update rpm reading every
    const unsigned int UPDATE_RPM_EVERY_X_MILLIS = 500;
    // how many pulses per full rotation the fan is generating on the rpm pin
    const uint8_t PULSES_PER_ROTATION = 2;

    const unsigned int ALARM_WAIT_TIME_CYCLES = ALARM_WAIT_TIME * 1000 / UPDATE_RPM_EVERY_X_MILLIS;
    const unsigned int RPM_CALCULATION_TIMEFRAME = 60000 / UPDATE_RPM_EVERY_X_MILLIS;

    class Fan {
        public:
            Fan(gpio_num_t pinFanPwm, gpio_num_t pinFanRpm, void (*rpmIsr)()) : _pinFanPwm(pinFanPwm), _pinFanRpm(pinFanRpm) {
                _medianFilterRpm = new MedianFilter<uint16_t>(5);

                // setup pin for pwm fan
                pinMode(pinFanPwm, OUTPUT);
                digitalWrite(pinFanPwm, LOW);

                // set pwm generator for fan using ledcontroller
                // set to 25khz and 8bit resolution
                ledcSetup(util::LEDC_CHANNEL_FAN, 25000, LEDC_FAN_BIT);
                ledcAttachPin(pinFanPwm, util::LEDC_CHANNEL_FAN);
                // set to full speed at initialization
                ledcWrite(util::LEDC_CHANNEL_FAN, LEDC_FAN_MAX);

                // setup pin for rpm input
                pinMode(_pinFanRpm, INPUT_PULLUP);
                // attach pin change interrupt to rpm pin on falling edges
                attachInterrupt(_pinFanRpm, rpmIsr, FALLING);
            }

            void update() {
                if (_timeoutRpm()) {
                    _timeoutRpm.reset();
                    _rpmRaw = ((_ticksRpm * RPM_CALCULATION_TIMEFRAME) / PULSES_PER_ROTATION);
                    _ticksRpm = 0;
                    _rpmFiltered = _medianFilterRpm->AddValue(_rpmRaw);

                    if (!_rpmAlarm && _rpmFiltered < MIN_RPM) {
                        // no alarm yet and rpm is too low
                        _rpmAlarmCounter++;
                    } else if (_rpmAlarmCounter > 0 && _rpmFiltered >= MIN_RPM) {
                        // alarm counter started triggering and rpm is fine again
                        _rpmAlarmCounter--;
                    }
                    if (!_rpmAlarm && _rpmAlarmCounter >= ALARM_WAIT_TIME_CYCLES) {
                        // no alarm and counter above wait cycles -> trigger alarm
                        _rpmAlarm = true;
                        setFanPercent(100);
                    } else if (_rpmAlarm && _rpmAlarmCounter == 0) {
                        // alarm and counter back to zero -> disable alarm
                        _rpmAlarm = false;
                    }
#ifdef DEBUG
                    Serial.printf("rpm: %d, filtered: %d, rpmAlarm: %d, rpmAlarmCounter: %d\n", _rpmRaw, _rpmFiltered, _rpmAlarm, _rpmAlarmCounter);
#endif
                }

                if (_fanPercentChanged(_fanPercent)) {
                    uint16_t fanSpeedRaw = static_cast<unsigned int>(static_cast<float>(_fanPercent) * (LEDC_FAN_MAX / 100.0));
                    // minimum fanspeed is 10%
                    fanSpeedRaw = constrain(fanSpeedRaw, LEDC_FAN_MAX / 10.0, LEDC_FAN_MAX);
#ifdef DEBUG
                    Serial.printf("update fan, %d -> %d (raw: %d)\n", _fanPercentChanged.getOldValue(), _fanPercent, fanSpeedRaw);
#endif
                    ledcWrite(util::LEDC_CHANNEL_FAN, fanSpeedRaw);
                }
            }

            void IRAM_ATTR static tickRpm(Fan *me) {
                me->_ticksRpm++;
            }

            void setFanPercent(uint8_t percent) {
                _fanPercent = percent;
            };

            uint8_t getFanPercent() {
                return _fanPercent;
            }

            uint16_t getFanSpeedRpm() {
                return _rpmFiltered;
            }

            bool getFanAlarm() {
                return _rpmAlarm;
            }

        private:
            gpio_num_t _pinFanPwm;
            gpio_num_t _pinFanRpm;
            volatile uint16_t _ticksRpm{0};
            uint8_t _fanPercent{0};
            uint16_t _rpmRaw{0};
            uint16_t _rpmFiltered{0};
            TimeoutMs _timeoutRpm{UPDATE_RPM_EVERY_X_MILLIS};
            MedianFilter<uint16_t> *_medianFilterRpm;
            EdgeDetector<uint16_t> _fanPercentChanged{0, 5};
            bool _rpmAlarm{false};
            uint8_t _rpmAlarmCounter{0};

    };

    
}
