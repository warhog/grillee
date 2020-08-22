#pragma once

#include <Arduino.h>
#include <MedianFilterLib.h>
#include "adc_mcp3208.h"
#include "timeout.h"

namespace util {

//#define DEBUG

// voltage divider: 10000:1000 ohm
const float BATTERY_VOLTAGE_FACTOR = 10.35;
const float BATTERY_VOLTAGE_OFFSET = 0.4;

class Battery {
    public:
        Battery(Adc_MCP3208 *adc, MCP3208::Channel channel) : _adc(adc), _channel(channel) {
        }

        void update() {
            if (_timeout()) {
                _timeout.reset();
                _adcFiltered.AddValue((static_cast<float>(_adc->getRawVoltage(_channel)) / 1000.0 * BATTERY_VOLTAGE_FACTOR) + BATTERY_VOLTAGE_OFFSET);
#ifdef DEBUG
                Serial.printf("voltage raw: %d, volt: %f\n", _adc->getRawVoltage(_channel), ((static_cast<float>(_adc->getRawVoltage(_channel)) / 1000.0 * BATTERY_VOLTAGE_FACTOR) + BATTERY_VOLTAGE_OFFSET));
#endif
            }
        }

        float getBatteryVoltage() {
            return _adcFiltered.GetFiltered();
        }

    private:
        Adc_MCP3208 *_adc;
        MCP3208::Channel _channel;
        MedianFilter<float> _adcFiltered{10};
        TimeoutMs _timeout{1000};

};

}