#pragma once
#include <Arduino.h>

#include "timeout.h"
#include "ledc.h"

namespace util {

    enum led_function_t {
        STATIC,
        BLINK,
        BREATH
    };

    class Led {
        public:
            Led(gpio_num_t pinLed, ledc_channel_t channel) : _pinLed(pinLed), _channel(channel) {
                pinMode(_pinLed, OUTPUT);
                digitalWrite(_pinLed, LOW);

                // set pwm generator for ledcontroller
                // set to 5khz and 12bit resolution
                ledcSetup(_channel, 5000, 12);
                ledcAttachPin(_pinLed, _channel);
                // set to full speed at initialization
                ledcWrite(_channel, 4095);
            }

            void setBrightness16(uint16_t brightness) {
                _brightness = constrain(brightness, 0, 4095);
            }

            void setBrightness8(uint8_t brightness) {
                setBrightness16(map(brightness, 0, 255, 0, 4095));
            }

            void setBrightnessPercent(uint8_t brightness) {
                setBrightness16(map(brightness, 0, 100, 0, 4095));
            }

            uint16_t getBrightness() {
                return _brightness;
            }

            void setOff() {
                _led_function = led_function_t::STATIC;
                setBrightness16(0);
                _timeoutLed.setTimeout(100);
            }

            void setOn() {
                _led_function = led_function_t::STATIC;
                setBrightness16(4095);
                _timeoutLed.setTimeout(100);
            }

            void setBlink(uint16_t interval) {
                _led_function = led_function_t::BLINK;
                _timeoutLed.setTimeout(interval);
            }

            /**
             * @param speed the breath speed, higher = slower, medium value at 500
             **/
            void setBreath(uint16_t speed) {
                _led_function = led_function_t::BREATH;
                _breathSpeed = speed;
                _timeoutLed.setTimeout(1);
            }

            void update() {
                if (_timeoutLed()) {
                    _timeoutLed.reset();

                    if (_led_function == led_function_t::STATIC) {
                        ledcWrite(_channel, getBrightness());
                    } else if (_led_function == led_function_t::BLINK) {
                        _blinkStatus = !_blinkStatus;
                        ledcWrite(_channel, _blinkStatus ? getBrightness() : 0);
                    } else if (_led_function == led_function_t::BREATH) {
                        float it = (exp(sin(millis() / (float)_breathSpeed * PI)) - 0.36787944) * 108.0;
                        setBrightness8(static_cast<uint8_t>(it));
                        ledcWrite(_channel, getBrightness());
                    }
                }
            }

        private:
            gpio_num_t _pinLed;
            ledc_channel_t _channel;
            TimeoutMs _timeoutLed{100};
            uint16_t _brightness{0};
            uint16_t _breathSpeed{500};
            bool _blinkStatus{false};
            led_function_t _led_function{STATIC};
    };
}
