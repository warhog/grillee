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
#include "timeout.h"
#include "toggle.h"
#include "ledc.h"

//#define DEBUG

namespace util {

class Buzzer {
    public:
        Buzzer(gpio_num_t pin) {
            // set pwm generator for ledcontroller
            // set to 2khz and 8bit resolution
            ledcSetup(util::LEDC_CHANNEL_BUZZER, 2000, 8);
            ledcAttachPin(pin, util::LEDC_CHANNEL_BUZZER);
        }

        void setIntervalTime(uint16_t intervalMs) {
            _interval = intervalMs;
            _timeout.setTimeout(_interval);
        }

        void setFrequency(uint16_t frequency) {
            _frequency = frequency;
        }

        void enable() {
            _enabled = true;
            _state = 0;
        }

        void disable() {
            _enabled = false;
            ledcWriteTone(util::LEDC_CHANNEL_BUZZER, 0);
        }

        void update() {
            if (_enabled && _timeout()) {
                if (_state == 0 || _state == 2) {
                    _timeout.setTimeout(125);
                } else if (_state == 1) {
                    _timeout.setTimeout(250);
                } else if (_state == 3) {
                    _timeout.setTimeout(2500);
                }
                
                _timeout.reset();
#ifdef DEBUG
                Serial.println("buzzer timeout triggered");
#endif
                if (_state == 0 || _state == 2) {
                    ledcWriteNote(util::LEDC_CHANNEL_BUZZER, NOTE_A, 6);
                } else {
                    ledcWriteTone(util::LEDC_CHANNEL_BUZZER, 0);
                }
                _state++;
                if (_state > 3) {
                    _state = 0;
                }
            }
        }
    
    private:
        bool _enabled{false};
        uint16_t _frequency{0};
        uint16_t _interval{500};
        TimeoutMs _timeout{500};
        uint8_t _state{0};
};

}