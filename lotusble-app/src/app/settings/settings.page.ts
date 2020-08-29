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
import { Component, OnInit } from '@angular/core';
import { SensorTypeModel } from '../models/sensortype';
import { SensorTypeService } from '../sensor-type.service';
import { UtilService } from '../util.service';
import { TargetService } from '../target.service';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

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
    private navCtrl: NavController,
    private translateService: TranslateService,
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

    this.fahrenheit = this.utilService.getTemperatureAsFahrenheitSettingFromCache();
    this.selectedSensorType1 = this.sensorTypeService.getSensorTypeModelByIndex(this.targetService.readSensorType1())
    this.selectedSensorType2 = this.sensorTypeService.getSensorTypeModelByIndex(this.targetService.readSensorType2())
    
  }

  onChangeTemperatureAsFahrenheit() {
    console.log('store temperature as fahrenheit', this.fahrenheit);
    this.utilService.storeTemperatureAsFahrenheitSetting(this.fahrenheit);
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
