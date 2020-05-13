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
