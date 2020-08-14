#pragma once
#include <Arduino.h>

namespace util {

    typedef uint8_t ledc_channel_t;

    // channels share timers! channel with same timer can't have different frequencies!
    // the following table is taken from esp32-hal-ledc.c
    // group 1 are low speed timers
    /*** ledc: 0  => Group: 0, Channel: 0, Timer: 0
    ** ledc: 1  => Group: 0, Channel: 1, Timer: 0
    ** ledc: 2  => Group: 0, Channel: 2, Timer: 1
    ** ledc: 3  => Group: 0, Channel: 3, Timer: 1
    ** ledc: 4  => Group: 0, Channel: 4, Timer: 2
    ** ledc: 5  => Group: 0, Channel: 5, Timer: 2
    ** ledc: 6  => Group: 0, Channel: 6, Timer: 3
    ** ledc: 7  => Group: 0, Channel: 7, Timer: 3
    ** ledc: 8  => Group: 1, Channel: 0, Timer: 0
    ** ledc: 9  => Group: 1, Channel: 1, Timer: 0
    ** ledc: 10 => Group: 1, Channel: 2, Timer: 1
    ** ledc: 11 => Group: 1, Channel: 3, Timer: 1
    ** ledc: 12 => Group: 1, Channel: 4, Timer: 2
    ** ledc: 13 => Group: 1, Channel: 5, Timer: 2
    ** ledc: 14 => Group: 1, Channel: 6, Timer: 3
    ** ledc: 15 => Group: 1, Channel: 7, Timer: 3
    */

    const ledc_channel_t LEDC_CHANNEL_FAN = 0;
    const ledc_channel_t LEDC_CHANNEL_LED_R = 2;
    const ledc_channel_t LEDC_CHANNEL_LED_G = 3;
    const ledc_channel_t LEDC_CHANNEL_LED_B = 4;
    const ledc_channel_t LEDC_CHANNEL_BUZZER = 5;

}