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
