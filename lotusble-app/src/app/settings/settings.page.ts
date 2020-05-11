import { Component, OnInit } from '@angular/core';
import { SensorTypeModel } from '../models/sensortype';
import { SensorTypeService } from '../sensor-type.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  private _sensorTypes: Array<SensorTypeModel>;
  private _selectedSensorType1: SensorTypeModel;
  private _selectedSensorType2: SensorTypeModel;

  constructor(private sensorTypeService: SensorTypeService ) {
    this.sensorTypes = sensorTypeService.getSensorTypeModels();
    this.selectedSensorType1 = sensorTypeService.getSensorTypeModelByIndex(0);
    this.selectedSensorType2 = sensorTypeService.getSensorTypeModelByIndex(0);
  }

  ngOnInit() {
  }

  onChangeSensorType(id: number) {
    
  }

  compareSensorTypeModel(o1: SensorTypeModel, o2: SensorTypeModel): boolean {
    return o1.name === o2.name
  }

  public get sensorTypes(): Array<SensorTypeModel> {
    return this._sensorTypes;
  }
  public set sensorTypes(value: Array<SensorTypeModel>) {
    this._sensorTypes = value;
  }
  public get selectedSensorType1(): SensorTypeModel {
    return this._selectedSensorType1;
  }
  public set selectedSensorType1(value: SensorTypeModel) {
    this._selectedSensorType1 = value;
  }
  public get selectedSensorType2(): SensorTypeModel {
    return this._selectedSensorType2;
  }
  public set selectedSensorType2(value: SensorTypeModel) {
    this._selectedSensorType2 = value;
  }
}
