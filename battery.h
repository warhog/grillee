/**
* Copyright (C) 2020 warhog <warhog@gmx.de>
* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
* 
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
**/
#pragma once

#include <Arduino.h>
#include <MedianFilterLib2.h>
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
        MedianFilter2<float> _adcFiltered{10};
        TimeoutMs _timeout{1000};

};

}