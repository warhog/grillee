#pragma once

#include <Arduino.h>
#include "adc.h"
#include "timeout.h"

// voltage divider: 10000:2200 ohm
const float FACTOR_BATTERY_VOLTAGE = 5.545454545;

class Battery {
    public:
        Battery(gpio_num_t pin) {
            _adc = new Adc(pin);
        }

        void update() {
            if (_timeout()) {
                _timeout.reset();
                _adc->update();
                _batteryVoltage = static_cast<float>(_adc->getFilteredVoltage()) / 1000.0 * FACTOR_BATTERY_VOLTAGE;
            }
        }

        float getBatteryVoltage() {
            return _batteryVoltage;
        }

    private:
        Adc *_adc;
        TimeoutMs _timeout{500};
        float _batteryVoltage;

};