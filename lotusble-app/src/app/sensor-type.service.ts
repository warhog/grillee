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
import { Injectable } from '@angular/core';
import { SensorType } from './sensor-type.enum';
import { SensorTypeModel } from './models/sensortype'

@Injectable({
  providedIn: 'root'
})
export class SensorTypeService {

  private sensorTypes: Array<SensorTypeModel> = [
    { name: 'Unknown', type: SensorType.UNKNOWN },
    { name: 'Maverick', type: SensorType.MAVERICK },
    { name: 'Fantast NEW', type: SensorType.FANTAST_NEW },
    { name: 'Fantast', type: SensorType.FANTAST },
    { name: 'iGrill2', type: SensorType.IGRILL2 },
    { name: 'ET-73', type: SensorType.ET73 },
    { name: 'Perfektion', type: SensorType.PERFEKTION },
    { name: 'Generic 50K', type: SensorType.GENERIC_50K },
    { name: 'Inkbird', type: SensorType.INKBIRD },
    { name: '100K6A1B', type: SensorType.NTC100K6A1B },
    { name: 'Weber 6743', type: SensorType.WEBER6743 },
    { name: 'Santos', type: SensorType.SANTOS },
    { name: '5K3A1B', type: SensorType.NTC5K3A1B },
    { name: 'ThermoWorks', type: SensorType.THERMOWORKS },
    { name: 'Pro05', type: SensorType.PRO05 }
  ];

  constructor() { }

  getSensorTypeModels(): Array<SensorTypeModel> {
    return this.sensorTypes;
  }

  getSensorTypeModelByIndex(sensorTypeIndex: number): SensorTypeModel {
    return this.sensorTypes[sensorTypeIndex];
  }

  getSensorTypeModelBySensorType(sensorType: SensorType): SensorTypeModel {
    let res = this.sensorTypes.filter((entry) => {
      return entry.type == sensorType;
    });
    if (res.length > 0) {
      return res[0];
    }
    return null;
  }

  getSensorTypeIdBySensorTypeModel(sensorTypeModel: SensorTypeModel): number {
    return sensorTypeModel.type;
  }

}
