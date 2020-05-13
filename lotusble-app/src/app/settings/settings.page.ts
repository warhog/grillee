import { Component, OnInit } from '@angular/core';
import { SensorTypeModel } from '../models/sensortype';
import { SensorTypeService } from '../sensor-type.service';
import { UtilService } from '../util.service';
import { TargetService } from '../target.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  private _sensorTypes: Array<SensorTypeModel>;
  private _selectedSensorType1: SensorTypeModel;
  private _selectedSensorType2: SensorTypeModel;
  private _fahrenheit: boolean = false;

  constructor(private sensorTypeService: SensorTypeService,
    private utilService: UtilService,
    private targetService: TargetService,
    private navCtrl: NavController
    ) {
    this.sensorTypes = sensorTypeService.getSensorTypeModels();
    this.selectedSensorType1 = sensorTypeService.getSensorTypeModelByIndex(0);
    this.selectedSensorType2 = sensorTypeService.getSensorTypeModelByIndex(0);
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (!this.targetService.isConnected()) {
      console.log('not connected -> route home');
      this.navCtrl.navigateRoot(['/home']);
    }
    this.utilService.backButton();

    this.fahrenheit = this.utilService.getTemperatureAsFahrenheit();
    this.selectedSensorType1 = this.sensorTypeService.getSensorTypeModelByIndex(this.targetService.readSensorType1())
    this.selectedSensorType2 = this.sensorTypeService.getSensorTypeModelByIndex(this.targetService.readSensorType2())
    
  }

  onChangeTemperatureAsFahrenheit() {
    console.log('store temperature as fahrenheit', this.fahrenheit);
    this.utilService.storeTemperatureAsFahrenheit(this.fahrenheit);
  }

  onChangeSensorType(id: number) {
    if (id == 1) {
      this.targetService.setSensorType1(this.sensorTypeService.getSensorTypeIdBySensorTypeModel(this.selectedSensorType1));
    } else if (id == 2) {
      this.targetService.setSensorType2(this.sensorTypeService.getSensorTypeIdBySensorTypeModel(this.selectedSensorType2));
    }
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
  public get fahrenheit(): boolean {
    return this._fahrenheit;
  }
  public set fahrenheit(value: boolean) {
    this._fahrenheit = value;
  }
}
