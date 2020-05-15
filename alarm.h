#pragma once
#include <Arduino.h>
#include <bitset>

namespace util {

const uint8_t ALARM_BIT_FAN = 0;
const uint8_t ALARM_BIT_BATTERY = 2;
const uint8_t ALARM_BIT_TEMPERATURE1 = 4;
const uint8_t ALARM_BIT_TEMPERATURE2 = 6;

const uint8_t ACK_BIT_FAN = 1;
const uint8_t ACK_BIT_BATTERY = 3;
const uint8_t ACK_BIT_TEMPERATURE1 = 5;
const uint8_t ACK_BIT_TEMPERATURE2 = 7;

class Alarm {
    public:
        void set(uint8_t bit) {
            _alarmState.set(bit);
        }

        void clear(uint8_t bit) {
            _alarmState.reset(bit);
        }

        bool is(uint8_t bit) {
            return _alarmState.test(bit);
        }

        bool isAnyAlarm() {
            
        }

        uint8_t toUint8() {
            return static_cast<uint8_t>(_alarmState.to_ulong());
        }

        void fromUint8(uint8_t bits) {
            for (int i = 0; i < 8; i++) {
                if (bits & 0b00000001) {
                    _alarmState.set(i);
                } else {
                    _alarmState.reset(i);
                }
                bits >>= 1;
            }
        }

    private:
        std::bitset<8> _alarmState{0};

};

}