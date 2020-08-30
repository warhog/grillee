/**
* Copyright (C) 2020 warhog <warhog@gmx.de>
* Copyright (C) 2019/2020  Martin Koerner
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
// type names thankfully taken from wlanthermo project
// https://github.com/WLANThermo-nano/WLANThermo_ESP32_Software/blob/master/src/temperature/TemperatureBase.cpp#L294
// https://github.com/WLANThermo-nano/WLANThermo_ESP32_Software/blob/master/src/temperature/TemperatureSensors.h
export enum SensorType {
    UNKNOWN = 0,
    MAVERICK = 1,
    FANTAST_NEW = 2,
    FANTAST = 3,
    IGRILL2 = 4,
    ET73 = 5,
    PERFEKTION = 6,
    GENERIC_50K = 7,
    INKBIRD = 8,
    NTC100K6A1B = 9,
    WEBER6743 = 10,
    SANTOS = 11,
    NTC5K3A1B = 12,
    THERMOWORKS = 13,
    PRO05 = 14
}
