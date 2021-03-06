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
#include <SPI.h>
#include <Mcp320x.h>

extern const gpio_num_t PIN_ADC_CS;

namespace util {

// adc vref 2.5v
const uint16_t ADC_VREF = 2500;
// SPI clock 1.6mhz
const uint32_t ADC_SPI_CLK = 1600000;

class Adc_MCP3208 {
    public:
        Adc_MCP3208() : _rawValue(0), _rawVoltage(0) {
    #ifdef DEBUG
            Serial.println("initialize spi");
    #endif
            pinMode(PIN_ADC_CS, OUTPUT);
            digitalWrite(PIN_ADC_CS, HIGH);
            SPISettings settings(ADC_SPI_CLK, MSBFIRST, SPI_MODE0);
            SPI.begin();
            SPI.beginTransaction(settings);
        }

        uint16_t getRawValue(MCP3208::Channel channel) {
            _rawValue = adc.read(channel);
            return _rawValue;
        }

        uint32_t getRawVoltage(MCP3208::Channel channel) {
            _rawVoltage = adc.toAnalog(adc.read(channel));
            return _rawVoltage;
        }

    private:
        uint16_t _rawValue;
        uint16_t _rawVoltage;
        MCP3208 adc{ADC_VREF, PIN_ADC_CS};

};

}
