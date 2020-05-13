#pragma once

#include <Arduino.h>
#include "timeout.h"
#include "toggle.h"

#define DEBUG

namespace util {

const uint8_t BUZZER_LEDC_CHANNEL = 1;

class Buzzer {
    public:
        Buzzer(gpio_num_t pin) {
            ledcSetup(BUZZER_LEDC_CHANNEL , 2000, 8);
            ledcAttachPin(pin, BUZZER_LEDC_CHANNEL);
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
        }

        void disable() {
            _enabled = false;
            ledcWriteTone(BUZZER_LEDC_CHANNEL, 0);
        }

        void update() {
            if (_enabled && _timeout()) {
                _timeout.reset();
#ifdef DEBUG
                Serial.println("buzzer timeout triggered");
#endif
                if (_toggle()) {
                    ledcWriteNote(BUZZER_LEDC_CHANNEL, NOTE_F, 4);
                } else {
                    ledcWriteTone(BUZZER_LEDC_CHANNEL, 0);
                }
            }
        }
    
    private:
        bool _enabled{false};
        uint16_t _frequency{0};
        uint16_t _interval{500};
        TimeoutMs _timeout{500};
        Toggle _toggle{false};
};

}