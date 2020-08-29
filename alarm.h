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
#include <bitset>

namespace util {

const uint8_t ALARM_BIT_FAN = 0;
const uint8_t ALARM_BIT_BATTERY = 1;
const uint8_t ALARM_BIT_TEMPERATURE1 = 2;
const uint8_t ALARM_BIT_TEMPERATURE2 = 3;
const uint8_t ALARM_BIT_ACKNOWLEDGE = 7;

class Alarm {
    public:
        void set(uint8_t bit) {
            if (!_alarmState.test(bit)) {
                // only set if not set before
                _alarmState.set(bit);
                setModifiedSet();
            }
        }

        void clear(uint8_t bit) {
            if (_alarmState.test(bit)) {
                // only clear if not set before
                _alarmState.reset(bit);
                setModifiedClear();
            }
        }

        bool is(uint8_t bit) {
            return _alarmState.test(bit);
        }

        bool isAny() {
            return toUint8() != 0;
        }

        bool isNone() {
            return toUint8() == 0;
        }

        uint8_t toUint8() {
            return static_cast<uint8_t>(_alarmState.to_ulong());
        }

        void fromBool(uint8_t bit, bool value) {
            if (value) {
                set(bit);
            } else {
                clear(bit);
            }
        }

        void fromUint8(uint8_t bits) {
            if (bits != toUint8()) {
                for (int i = 0; i < 8; i++) {
                    if (bits & 0b00000001) {
                        set(i);
                    } else {
                        clear(i);
                    }
                    bits >>= 1;
                }
            }
        }

        bool isModified() {
            return _modifiedSet || _modifiedClear;
        }

        bool isModifiedSet() {
            return _modifiedSet;
        }

        bool isModifiedClear() {
            return _modifiedClear;
        }

        void resetModified() {
            _modifiedSet = false;
            _modifiedClear = false;
        }

        bool isAcked() {
            return _acked;
        }

        void ack() {
            _acked = true;
        }

    private:
        void setModifiedSet() {
            _modifiedSet = true;
            resetAcked();
        }
        void setModifiedClear() {
            _modifiedClear = true;
        }
        void resetAcked() {
            _acked = false;
        }

        std::bitset<8> _alarmState{0};
        bool _modifiedSet{false};
        bool _modifiedClear{false};
        bool _acked{false};

};

}