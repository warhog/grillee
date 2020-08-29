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
import { SensorType } from '../sensor-type.enum';

export interface BleData {
    fan: number,
    rpm: number,
    alarm: boolean,
    setpoint1: number,
    setpoint2: number,
    temperature1: number,
    temperature2: number,
    battery: number,
    sensorType1: SensorType,
    sensorType2: SensorType
}
