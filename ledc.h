#pragma once
#include <Arduino.h>

namespace util {

    typedef uint8_t ledc_channel_t;

    const ledc_channel_t LEDC_CHANNEL_FAN = 0;
    const ledc_channel_t LEDC_CHANNEL_BUZZER = 1;
    const ledc_channel_t LEDC_CHANNEL_LED_R = 2;
    const ledc_channel_t LEDC_CHANNEL_LED_G = 3;
    const ledc_channel_t LEDC_CHANNEL_LED_B = 4;

}