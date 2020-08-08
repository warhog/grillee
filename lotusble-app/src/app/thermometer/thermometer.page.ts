import { Component, OnInit, NgZone } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { SetpointPage } from '../setpoint/setpoint.page';
import { MeatTemperatureService } from '../meat-temperature.service';
import { SensorType } from '../sensor-type.enum';
import { SensorTypeService } from '../sensor-type.service';
import { TargetService } from '../target.service';
import { UtilService } from '../util.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-thermometer',
  templateUrl: './thermometer.page.html',
  styleUrls: ['./thermometer.page.scss'],
})
export class ThermometerPage implements OnInit {

  private _rssi: number = 0;
  private subscriptions: Array<Subscription> = [];

  // used for modal setpoint dialog
  private meatTypeTemperature1: MeatTypeTemperature = { id: '', meatTypeId: '', name: '', temperature: 100 };
  private meatTypeTemperature2: MeatTypeTemperature = { id: '', meatTypeId: '', name: '', temperature: 100 };

  private _fanRpm: number = 0;
  private _fanSpeed: number = 0;
  private _battery: number = 0.0;
  private _setpoint1: number = 0.0;
  private _setpoint2: number = 0.0;
  private _temperatureProbe1: number = 0.0;
  private _temperatureProbe2: number = 0.0;
  private _sensorType1: SensorType = SensorType.UNKNOWN;
  private _sensorType2: SensorType = SensorType.UNKNOWN;

  constructor(private backgroundMode: BackgroundMode,
    private meatTemperatureService: MeatTemperatureService,
    private modalController: ModalController,
    private sensorTypeService: SensorTypeService,
    private targetService: TargetService,
    private utilService: UtilService,
    private translateService: TranslateService,
    private ngZone: NgZone) {
      this.meatTypeTemperature1 = this.meatTemperatureService.getDefaultMeatTypeTemperature();
      this.meatTypeTemperature2 = this.meatTemperatureService.getDefaultMeatTypeTemperature();
  }


  ngOnInit() {
    
  }

  /**
   * subscribe to the needed ble notifications for this view
   */
  doSubscriptions() {
    this.subscriptions.push(this.targetService.getSubscriptionForFanRpm().subscribe((fanRpm: number) => {
      this.ngZone.run(() => { this.fanRpm = fanRpm; console.log('fanRpm', fanRpm); });
    }));

    this.subscriptions.push(this.targetService.getSubscriptionForFanSpeed().subscribe((fanSpeed: number) => {
      this.ngZone.run(() => { this.fanSpeed = fanSpeed; console.log('fanSpeed', fanSpeed); });
    }));

    this.subscriptions.push(this.targetService.getSubscriptionForBattery().subscribe((battery: number) => {
      this.ngZone.run(() => { this.battery = battery; });
    }));

    this.subscriptions.push(this.targetService.getSubscriptionForRssi().subscribe((rssi: number) => {
      this.ngZone.run(() => { this.rssi = rssi; });
    }));

    this.subscriptions.push(this.targetService.getSubscriptionForProbe1().subscribe((temperature: number) => {
      this.ngZone.run(() => { this.temperatureProbe1 = temperature; });
    }));

    this.subscriptions.push(this.targetService.getSubscriptionForProbe2().subscribe((temperature: number) => {
      this.ngZone.run(() => { this.temperatureProbe2 = temperature; });
    }));

    this.subscriptions.push(this.targetService.getSubscriptionForSetpoint1().subscribe((setpoint: number) => {
      this.ngZone.run(() => { this.setpoint1 = setpoint; console.log('setpoint1', setpoint); });
    }));

    this.subscriptions.push(this.targetService.getSubscriptionForSetpoint2().subscribe((setpoint: number) => {
      this.ngZone.run(() => { this.setpoint2 = setpoint; console.log('setpoint2', setpoint); });
    }));

    this.subscriptions.push(this.targetService.getSubscriptionForSensorType1().subscribe((sensorType: number) => {
      this.ngZone.run(() => { this.sensorType1 = this.sensorTypeService.getSensorTypeModelByIndex(sensorType).type; });
    }));

    this.subscriptions.push(this.targetService.getSubscriptionForSensorType2().subscribe((sensorType: number) => {
      this.ngZone.run(() => { this.sensorType2 = this.sensorTypeService.getSensorTypeModelByIndex(sensorType).type; });
    }));

  }

  /**
   * get the battery icon name depending on battery status
   */
  getBatteryIcon(): string {
    if (this.battery >= 5.5) {
      return 'battery-full-outline';
    } else if (this.battery > 5.0 && this.battery < 5.5) {
      return 'battery-half-outline';
    } else {
      return 'battery-dead-outline';
    }
  }

  /**
   * get the type of the meat as a string for the view
   * @param which probe number (1 or 2)
   */
  getMeatTypeString(which: number) {
    if (which == 1) {
      return this.meatTemperatureService.getMeatTypeString(this.meatTypeTemperature1);
    } else {
      return this.meatTemperatureService.getMeatTypeString(this.meatTypeTemperature2);
    }
  }

  /**
   * callback for fan speed changes by the UI
   * @param newFanSpeed the new fan speed
   */
  onChangeFanSpeed(newFanSpeed: number) {
    this.fanSpeed = newFanSpeed;
    this.targetService.setFanSpeed(this.fanSpeed);
  }

  /**
   * callback for setpoint button
   */
  onSetSetpoint1() {
    this.presentSetpointModal(1, this.meatTypeTemperature1);
  }

  /**
   * callback for setpoint button
   */
  onSetSetpoint2() {
    this.presentSetpointModal(2, this.meatTypeTemperature2);
  }

  /**
   * presents the setpoint page as modal
   * @param setpoint which setpoint (0 or 1)
   * @param meatTypeTemperature the meat and temperature storage
   */
  async presentSetpointModal(setpoint: number, meatTypeTemperature: MeatTypeTemperature) {
    const modal = await this.modalController.create({
      component: SetpointPage,
      componentProps: {
        'meatTypeTemperature': meatTypeTemperature,
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log('data modal:', data);
    if (!data || !data.meatTypeTemperature) {
      console.info('strange data from setpoint page returned', data);
      return;
    }
    let meatTypeTemperatureResponse: MeatTypeTemperature = data.meatTypeTemperature as MeatTypeTemperature;
    if (setpoint == 1) {
      this.meatTypeTemperature1 = meatTypeTemperatureResponse;
      this.setpoint1 = this.meatTypeTemperature1.temperature;
      this.targetService.setSetpoint1(this.setpoint1);
    } else {
      this.meatTypeTemperature2 = meatTypeTemperatureResponse;
      this.setpoint2 = this.meatTypeTemperature2.temperature;
      this.targetService.setSetpoint2(this.setpoint2);
    }
  }

  ionViewWillEnter() {
    this.utilService.backButton();

    this.doSubscriptions();

    this.translateService.get(['general.title', 'general.backgroundServiceDescription']).subscribe((res: string) => {
      this.backgroundMode.setDefaults({
        'title': res['general.title'],
        'text': res['general.backgroundServiceDescription'],
        'icon': 'ic_launcher',
        'resume': true
      });
      this.backgroundMode.enable();
    });

    this.backgroundMode.on('activate').subscribe(() => {
      console.log('activated background mode');
      this.backgroundMode.disableWebViewOptimizations();
      this.backgroundMode.disableBatteryOptimizations();
    });

    this.backgroundMode.on('deactivate').subscribe(() => {
      console.log('deactivated background mode');
    });
  }

  ionViewWillLeave() {
    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach((entry) => {
        entry.unsubscribe();
      });
      this.subscriptions = [];
    }
    this.backgroundMode.disable();
  }

  public get rssi(): number {
    return this._rssi;
  }
  public set rssi(value: number) {
    this._rssi = value;
  }
  public get fanRpm(): number {
    return this._fanRpm;
  }
  public set fanRpm(value: number) {
    this._fanRpm = value;
  }
  public get fanSpeed(): number {
    return this._fanSpeed;
  }
  public set fanSpeed(value: number) {
    this._fanSpeed = value;
  }
  public get battery(): number {
    return this._battery;
  }
  public set battery(value: number) {
    this._battery = value;
  }
  public get temperatureProbe1(): number {
    return this._temperatureProbe1;
  }
  public set temperatureProbe1(value: number) {
    this._temperatureProbe1 = value;
  }
  public get temperatureProbe2(): number {
    return this._temperatureProbe2;
  }
  public set temperatureProbe2(value: number) {
    this._temperatureProbe2 = value;
  }
  public get setpoint1(): number {
    return this._setpoint1;
  }
  public set setpoint1(value: number) {
    this._setpoint1 = value;
  }
  public get setpoint2(): number {
    return this._setpoint2;
  }
  public set setpoint2(value: number) {
    this._setpoint2 = value;
  }
  public get sensorType1(): SensorType {
    return this._sensorType1;
  }
  public set sensorType1(value: SensorType) {
    this._sensorType1 = value;
  }
  public get sensorType2(): SensorType {
    return this._sensorType2;
  }
  public set sensorType2(value: SensorType) {
    this._sensorType2 = value;
  }
}
