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
#include "ledc.h"

namespace util {

    enum led_function_t {
        STATIC,
        BLINK,
        BREATH
    };

    const uint16_t gammaCorrectionTable[4096] = {
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
        8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9,
        9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
        9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11,
        11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,
        11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
        12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
        13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
        14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16,
        16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17,
        17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18,
        18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19,
        19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21,
        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
        22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25,
        25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 27,
        27, 27, 27, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29,
        29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 31, 31, 31, 31, 31,
        31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35,
        35, 35, 35, 35, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 38,
        38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 40, 40, 40, 40, 40, 40, 40, 40,
        40, 40, 40, 40, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 43, 43, 43, 43,
        43, 43, 43, 43, 43, 43, 43, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 46, 46, 46,
        46, 46, 46, 46, 46, 46, 46, 46, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 49, 49, 49, 49,
        49, 49, 49, 49, 49, 49, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 51, 51, 51, 51, 51, 51, 51, 51, 51, 52, 52, 52, 52, 52, 52, 52,
        52, 52, 52, 53, 53, 53, 53, 53, 53, 53, 53, 53, 54, 54, 54, 54, 54, 54, 54, 54, 54, 55, 55, 55, 55, 55, 55, 55, 55, 55, 56, 56,
        56, 56, 56, 56, 56, 56, 56, 57, 57, 57, 57, 57, 57, 57, 57, 58, 58, 58, 58, 58, 58, 58, 58, 58, 59, 59, 59, 59, 59, 59, 59, 59,
        60, 60, 60, 60, 60, 60, 60, 60, 61, 61, 61, 61, 61, 61, 61, 61, 62, 62, 62, 62, 62, 62, 62, 62, 63, 63, 63, 63, 63, 63, 63, 63,
        64, 64, 64, 64, 64, 64, 64, 65, 65, 65, 65, 65, 65, 65, 65, 66, 66, 66, 66, 66, 66, 66, 67, 67, 67, 67, 67, 67, 67, 68, 68, 68,
        68, 68, 68, 68, 68, 69, 69, 69, 69, 69, 69, 69, 70, 70, 70, 70, 70, 70, 70, 71, 71, 71, 71, 71, 71, 71, 72, 72, 72, 72, 72, 72,
        73, 73, 73, 73, 73, 73, 73, 74, 74, 74, 74, 74, 74, 74, 75, 75, 75, 75, 75, 75, 76, 76, 76, 76, 76, 76, 76, 77, 77, 77, 77, 77,
        77, 78, 78, 78, 78, 78, 78, 79, 79, 79, 79, 79, 79, 80, 80, 80, 80, 80, 80, 80, 81, 81, 81, 81, 81, 81, 82, 82, 82, 82, 82, 82,
        83, 83, 83, 83, 83, 84, 84, 84, 84, 84, 84, 85, 85, 85, 85, 85, 85, 86, 86, 86, 86, 86, 86, 87, 87, 87, 87, 87, 88, 88, 88, 88,
        88, 88, 89, 89, 89, 89, 89, 90, 90, 90, 90, 90, 90, 91, 91, 91, 91, 91, 92, 92, 92, 92, 92, 92, 93, 93, 93, 93, 93, 94, 94, 94,
        94, 94, 95, 95, 95, 95, 95, 96, 96, 96, 96, 96, 97, 97, 97, 97, 97, 98, 98, 98, 98, 98, 99, 99, 99, 99, 99, 100, 100, 100, 100, 100,
        101, 101, 101, 101, 101, 102, 102, 102, 102, 102, 103, 103, 103, 103, 103, 104, 104, 104, 104, 105, 105, 105, 105, 105, 106, 106, 106, 106, 106, 107, 107, 107,
        107, 108, 108, 108, 108, 108, 109, 109, 109, 109, 110, 110, 110, 110, 110, 111, 111, 111, 111, 112, 112, 112, 112, 112, 113, 113, 113, 113, 114, 114, 114, 114,
        115, 115, 115, 115, 116, 116, 116, 116, 116, 117, 117, 117, 117, 118, 118, 118, 118, 119, 119, 119, 119, 120, 120, 120, 120, 121, 121, 121, 121, 122, 122, 122,
        122, 123, 123, 123, 123, 124, 124, 124, 124, 125, 125, 125, 125, 126, 126, 126, 126, 127, 127, 127, 127, 128, 128, 128, 128, 129, 129, 129, 129, 130, 130, 130,
        131, 131, 131, 131, 132, 132, 132, 132, 133, 133, 133, 134, 134, 134, 134, 135, 135, 135, 135, 136, 136, 136, 137, 137, 137, 137, 138, 138, 138, 138, 139, 139,
        139, 140, 140, 140, 140, 141, 141, 141, 142, 142, 142, 143, 143, 143, 143, 144, 144, 144, 145, 145, 145, 145, 146, 146, 146, 147, 147, 147, 148, 148, 148, 148,
        149, 149, 149, 150, 150, 150, 151, 151, 151, 151, 152, 152, 152, 153, 153, 153, 154, 154, 154, 155, 155, 155, 156, 156, 156, 157, 157, 157, 157, 158, 158, 158,
        159, 159, 159, 160, 160, 160, 161, 161, 161, 162, 162, 162, 163, 163, 163, 164, 164, 164, 165, 165, 165, 166, 166, 166, 167, 167, 167, 168, 168, 168, 169, 169,
        169, 170, 170, 170, 171, 171, 172, 172, 172, 173, 173, 173, 174, 174, 174, 175, 175, 175, 176, 176, 176, 177, 177, 178, 178, 178, 179, 179, 179, 180, 180, 180,
        181, 181, 182, 182, 182, 183, 183, 183, 184, 184, 185, 185, 185, 186, 186, 186, 187, 187, 188, 188, 188, 189, 189, 190, 190, 190, 191, 191, 191, 192, 192, 193,
        193, 193, 194, 194, 195, 195, 195, 196, 196, 197, 197, 197, 198, 198, 199, 199, 199, 200, 200, 201, 201, 201, 202, 202, 203, 203, 204, 204, 204, 205, 205, 206,
        206, 206, 207, 207, 208, 208, 209, 209, 209, 210, 210, 211, 211, 212, 212, 212, 213, 213, 214, 214, 215, 215, 215, 216, 216, 217, 217, 218, 218, 219, 219, 219,
        220, 220, 221, 221, 222, 222, 223, 223, 224, 224, 224, 225, 225, 226, 226, 227, 227, 228, 228, 229, 229, 229, 230, 230, 231, 231, 232, 232, 233, 233, 234, 234,
        235, 235, 236, 236, 237, 237, 238, 238, 239, 239, 240, 240, 240, 241, 241, 242, 242, 243, 243, 244, 244, 245, 245, 246, 246, 247, 247, 248, 248, 249, 249, 250,
        250, 251, 252, 252, 253, 253, 254, 254, 255, 255, 256, 256, 257, 257, 258, 258, 259, 259, 260, 260, 261, 261, 262, 262, 263, 264, 264, 265, 265, 266, 266, 267,
        267, 268, 268, 269, 270, 270, 271, 271, 272, 272, 273, 273, 274, 274, 275, 276, 276, 277, 277, 278, 278, 279, 280, 280, 281, 281, 282, 282, 283, 284, 284, 285,
        285, 286, 286, 287, 288, 288, 289, 289, 290, 291, 291, 292, 292, 293, 294, 294, 295, 295, 296, 297, 297, 298, 298, 299, 300, 300, 301, 301, 302, 303, 303, 304,
        305, 305, 306, 306, 307, 308, 308, 309, 309, 310, 311, 311, 312, 313, 313, 314, 315, 315, 316, 317, 317, 318, 318, 319, 320, 320, 321, 322, 322, 323, 324, 324,
        325, 326, 326, 327, 328, 328, 329, 330, 330, 331, 332, 332, 333, 334, 334, 335, 336, 336, 337, 338, 338, 339, 340, 341, 341, 342, 343, 343, 344, 345, 345, 346,
        347, 348, 348, 349, 350, 350, 351, 352, 353, 353, 354, 355, 355, 356, 357, 358, 358, 359, 360, 360, 361, 362, 363, 363, 364, 365, 366, 366, 367, 368, 369, 369,
        370, 371, 372, 372, 373, 374, 375, 375, 376, 377, 378, 379, 379, 380, 381, 382, 382, 383, 384, 385, 386, 386, 387, 388, 389, 389, 390, 391, 392, 393, 393, 394,
        395, 396, 397, 397, 398, 399, 400, 401, 402, 402, 403, 404, 405, 406, 406, 407, 408, 409, 410, 411, 411, 412, 413, 414, 415, 416, 416, 417, 418, 419, 420, 421,
        422, 422, 423, 424, 425, 426, 427, 428, 429, 429, 430, 431, 432, 433, 434, 435, 436, 436, 437, 438, 439, 440, 441, 442, 443, 444, 444, 445, 446, 447, 448, 449,
        450, 451, 452, 453, 454, 455, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 471, 472, 473, 474, 475, 476, 477, 478, 479,
        480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511,
        512, 513, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 544, 545, 546,
        547, 548, 549, 550, 551, 552, 554, 555, 556, 557, 558, 559, 560, 562, 563, 564, 565, 566, 567, 568, 570, 571, 572, 573, 574, 575, 577, 578, 579, 580, 581, 582,
        584, 585, 586, 587, 588, 590, 591, 592, 593, 594, 596, 597, 598, 599, 600, 602, 603, 604, 605, 607, 608, 609, 610, 612, 613, 614, 615, 617, 618, 619, 620, 622,
        623, 624, 625, 627, 628, 629, 630, 632, 633, 634, 636, 637, 638, 640, 641, 642, 643, 645, 646, 647, 649, 650, 651, 653, 654, 655, 657, 658, 659, 661, 662, 663,
        665, 666, 667, 669, 670, 671, 673, 674, 676, 677, 678, 680, 681, 682, 684, 685, 687, 688, 689, 691, 692, 694, 695, 697, 698, 699, 701, 702, 704, 705, 706, 708,
        709, 711, 712, 714, 715, 717, 718, 720, 721, 722, 724, 725, 727, 728, 730, 731, 733, 734, 736, 737, 739, 740, 742, 743, 745, 746, 748, 749, 751, 752, 754, 755,
        757, 759, 760, 762, 763, 765, 766, 768, 769, 771, 773, 774, 776, 777, 779, 780, 782, 784, 785, 787, 788, 790, 792, 793, 795, 796, 798, 800, 801, 803, 805, 806,
        808, 810, 811, 813, 814, 816, 818, 819, 821, 823, 824, 826, 828, 830, 831, 833, 835, 836, 838, 840, 841, 843, 845, 847, 848, 850, 852, 853, 855, 857, 859, 860,
        862, 864, 866, 867, 869, 871, 873, 875, 876, 878, 880, 882, 883, 885, 887, 889, 891, 892, 894, 896, 898, 900, 902, 903, 905, 907, 909, 911, 913, 914, 916, 918,
        920, 922, 924, 926, 928, 929, 931, 933, 935, 937, 939, 941, 943, 945, 947, 949, 950, 952, 954, 956, 958, 960, 962, 964, 966, 968, 970, 972, 974, 976, 978, 980,
        982, 984, 986, 988, 990, 992, 994, 996, 998, 1000, 1002, 1004, 1006, 1008, 1010, 1012, 1014, 1016, 1018, 1021, 1023, 1025, 1027, 1029, 1031, 1033, 1035, 1037, 1039, 1041, 1044, 1046,
        1048, 1050, 1052, 1054, 1056, 1059, 1061, 1063, 1065, 1067, 1069, 1072, 1074, 1076, 1078, 1080, 1082, 1085, 1087, 1089, 1091, 1094, 1096, 1098, 1100, 1102, 1105, 1107, 1109, 1111, 1114, 1116,
        1118, 1120, 1123, 1125, 1127, 1130, 1132, 1134, 1137, 1139, 1141, 1143, 1146, 1148, 1150, 1153, 1155, 1158, 1160, 1162, 1165, 1167, 1169, 1172, 1174, 1176, 1179, 1181, 1184, 1186, 1188, 1191,
        1193, 1196, 1198, 1201, 1203, 1206, 1208, 1210, 1213, 1215, 1218, 1220, 1223, 1225, 1228, 1230, 1233, 1235, 1238, 1240, 1243, 1245, 1248, 1250, 1253, 1255, 1258, 1261, 1263, 1266, 1268, 1271,
        1273, 1276, 1279, 1281, 1284, 1286, 1289, 1292, 1294, 1297, 1300, 1302, 1305, 1308, 1310, 1313, 1316, 1318, 1321, 1324, 1326, 1329, 1332, 1334, 1337, 1340, 1343, 1345, 1348, 1351, 1354, 1356,
        1359, 1362, 1365, 1367, 1370, 1373, 1376, 1378, 1381, 1384, 1387, 1390, 1393, 1395, 1398, 1401, 1404, 1407, 1410, 1412, 1415, 1418, 1421, 1424, 1427, 1430, 1433, 1436, 1439, 1441, 1444, 1447,
        1450, 1453, 1456, 1459, 1462, 1465, 1468, 1471, 1474, 1477, 1480, 1483, 1486, 1489, 1492, 1495, 1498, 1501, 1504, 1507, 1510, 1513, 1517, 1520, 1523, 1526, 1529, 1532, 1535, 1538, 1541, 1545,
        1548, 1551, 1554, 1557, 1560, 1563, 1567, 1570, 1573, 1576, 1579, 1583, 1586, 1589, 1592, 1596, 1599, 1602, 1605, 1609, 1612, 1615, 1618, 1622, 1625, 1628, 1632, 1635, 1638, 1642, 1645, 1648,
        1652, 1655, 1658, 1662, 1665, 1668, 1672, 1675, 1679, 1682, 1686, 1689, 1692, 1696, 1699, 1703, 1706, 1710, 1713, 1717, 1720, 1724, 1727, 1731, 1734, 1738, 1741, 1745, 1748, 1752, 1755, 1759,
        1763, 1766, 1770, 1773, 1777, 1781, 1784, 1788, 1791, 1795, 1799, 1802, 1806, 1810, 1813, 1817, 1821, 1824, 1828, 1832, 1836, 1839, 1843, 1847, 1851, 1854, 1858, 1862, 1866, 1869, 1873, 1877,
        1881, 1885, 1889, 1892, 1896, 1900, 1904, 1908, 1912, 1916, 1920, 1923, 1927, 1931, 1935, 1939, 1943, 1947, 1951, 1955, 1959, 1963, 1967, 1971, 1975, 1979, 1983, 1987, 1991, 1995, 1999, 2003,
        2007, 2011, 2015, 2020, 2024, 2028, 2032, 2036, 2040, 2044, 2048, 2053, 2057, 2061, 2065, 2069, 2074, 2078, 2082, 2086, 2090, 2095, 2099, 2103, 2108, 2112, 2116, 2120, 2125, 2129, 2133, 2138,
        2142, 2146, 2151, 2155, 2160, 2164, 2168, 2173, 2177, 2182, 2186, 2190, 2195, 2199, 2204, 2208, 2213, 2217, 2222, 2226, 2231, 2235, 2240, 2244, 2249, 2254, 2258, 2263, 2267, 2272, 2277, 2281,
        2286, 2291, 2295, 2300, 2305, 2309, 2314, 2319, 2323, 2328, 2333, 2338, 2342, 2347, 2352, 2357, 2361, 2366, 2371, 2376, 2381, 2385, 2390, 2395, 2400, 2405, 2410, 2415, 2420, 2425, 2429, 2434,
        2439, 2444, 2449, 2454, 2459, 2464, 2469, 2474, 2479, 2484, 2489, 2495, 2500, 2505, 2510, 2515, 2520, 2525, 2530, 2535, 2541, 2546, 2551, 2556, 2561, 2566, 2572, 2577, 2582, 2587, 2593, 2598,
        2603, 2608, 2614, 2619, 2624, 2630, 2635, 2640, 2646, 2651, 2657, 2662, 2667, 2673, 2678, 2684, 2689, 2695, 2700, 2706, 2711, 2717, 2722, 2728, 2733, 2739, 2744, 2750, 2756, 2761, 2767, 2772,
        2778, 2784, 2789, 2795, 2801, 2806, 2812, 2818, 2824, 2829, 2835, 2841, 2847, 2852, 2858, 2864, 2870, 2876, 2881, 2887, 2893, 2899, 2905, 2911, 2917, 2923, 2929, 2935, 2941, 2947, 2953, 2959,
        2965, 2971, 2977, 2983, 2989, 2995, 3001, 3007, 3013, 3019, 3025, 3032, 3038, 3044, 3050, 3056, 3062, 3069, 3075, 3081, 3087, 3094, 3100, 3106, 3113, 3119, 3125, 3132, 3138, 3144, 3151, 3157,
        3164, 3170, 3176, 3183, 3189, 3196, 3202, 3209, 3215, 3222, 3229, 3235, 3242, 3248, 3255, 3261, 3268, 3275, 3281, 3288, 3295, 3301, 3308, 3315, 3322, 3328, 3335, 3342, 3349, 3356, 3362, 3369,
        3376, 3383, 3390, 3397, 3404, 3411, 3417, 3424, 3431, 3438, 3445, 3452, 3459, 3466, 3473, 3480, 3488, 3495, 3502, 3509, 3516, 3523, 3530, 3537, 3545, 3552, 3559, 3566, 3574, 3581, 3588, 3595,
        3603, 3610, 3617, 3625, 3632, 3640, 3647, 3654, 3662, 3669, 3677, 3684, 3692, 3699, 3707, 3714, 3722, 3729, 3737, 3744, 3752, 3760, 3767, 3775, 3783, 3790, 3798, 3806, 3814, 3821, 3829, 3837,
        3845, 3852, 3860, 3868, 3876, 3884, 3892, 3900, 3908, 3916, 3924, 3932, 3940, 3948, 3956, 3964, 3972, 3980, 3988, 3996, 4004, 4012, 4020, 4029, 4037, 4045, 4053, 4061, 4070, 4078, 4086, 4094,
    };


    class Led {
        public:
            Led(gpio_num_t pinLed, ledc_channel_t channel, bool gammaCorrection = false) : _pinLed(pinLed), _channel(channel), _gammaCorrection(gammaCorrection) {
                pinMode(_pinLed, OUTPUT);
                digitalWrite(_pinLed, LOW);

                // set pwm generator for ledcontroller
                // set to 5khz and 12bit resolution
                ledcSetup(_channel, 5000, 12);
                ledcAttachPin(_pinLed, _channel);
                // set to full speed at initialization
                ledcWrite(_channel, 4095);
            }

            void setBrightness16(uint16_t brightness) {
                _brightness = constrain(brightness, 0, 4095);
            }

            void setBrightness8(uint8_t brightness) {
                setBrightness16(map(brightness, 0, 255, 0, 4095));
            }

            void setBrightnessPercent(uint8_t brightness) {
                setBrightness16(map(brightness, 0, 100, 0, 4095));
            }

            uint16_t getBrightness() {
                return _brightness;
            }

            void setOff() {
                _led_function = led_function_t::STATIC;
                setBrightness16(0);
                _timeoutLed.setTimeout(100);
            }

            void setOn() {
                _led_function = led_function_t::STATIC;
                setBrightness16(4095);
                _timeoutLed.setTimeout(100);
            }

            void setBlink(uint16_t interval) {
                _led_function = led_function_t::BLINK;
                _timeoutLed.setTimeout(interval);
            }

            uint16_t gammaCorrect(uint16_t value) {
                return gammaCorrectionTable[value];
            }

            /**
             * @param speed the breath speed, higher = slower, medium value at 500
             **/
            void setBreath(uint16_t speed) {
                _led_function = led_function_t::BREATH;
                _breathSpeed = speed;
                _timeoutLed.setTimeout(1);
            }

            void update() {
                if (_timeoutLed()) {
                    _timeoutLed.reset();

                    uint16_t brightness = getBrightness();
                    if (brightness > 0) {
                        // shift valuation from 0-100% to 40-100% to ensure at least 40% lightness
                        brightness = map(brightness, 0, 4095, static_cast<uint16_t>((4095.0 / 100.0) * 40.0), 4095);
                        // do gamma correction
                        brightness = gammaCorrect(brightness);
                    }
                    if (_led_function == led_function_t::STATIC) {
                        ledcWrite(_channel, brightness);
                    } else if (_led_function == led_function_t::BLINK) {
                        _blinkStatus = !_blinkStatus;
                        ledcWrite(_channel, _blinkStatus ? brightness : 0);
                    } else if (_led_function == led_function_t::BREATH) {
                        float it = (exp(sin(millis() / (float)_breathSpeed * PI)) - 0.36787944) * 108.0;
                        setBrightness8(static_cast<uint8_t>(it));
                        ledcWrite(_channel, brightness);
                    }
                }
            }

        private:
            gpio_num_t _pinLed;
            ledc_channel_t _channel;
            TimeoutMs _timeoutLed{100};
            uint16_t _brightness{0};
            uint16_t _breathSpeed{500};
            bool _blinkStatus{false};
            led_function_t _led_function{STATIC};
            bool _gammaCorrection{false};
    };
}
