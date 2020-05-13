import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, Platform, ModalController } from '@ionic/angular';
import { BleAlarm } from '../models/blealarm';
import { AudioService } from '../audio.service';
import { Subscription } from 'rxjs';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable'
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { AlarmService } from '../alarm.service';
import { SetpointPage } from '../setpoint/setpoint.page';
import { MeatTemperatureService } from '../meat-temperature.service';
import { SensorType } from '../sensor-type.enum';
import { SensorTypeService } from '../sensor-type.service';
import { TargetService } from '../target.service';
import { UtilService } from '../util.service';

const MIN_FAN_RPM = 300;

@Component({
  selector: 'app-thermometer',
  templateUrl: './thermometer.page.html',
  styleUrls: ['./thermometer.page.scss'],
})
export class ThermometerPage implements OnInit {

  private _bleAlarm: BleAlarm = {
    alarm: false,
    alarmFan: false,
    alarmFanAck: false,
    alarmBattery: false,
    alarmBatteryAck: false,
    alarmTemperature1: false,
    alarmTemperature1Ack: false,
    alarmTemperature2: false,
    alarmTemperature2Ack: false
  };

  private _rssi: number = 0;
  private alarmBlink: boolean = false;
  private subscriptions: Array<Subscription> = [];

  // used for modal setpoint dialog
  private meatTypeTemperature1: MeatTypeTemperature = { meatTypeId: '', name: '', temperature: 100 };
  private meatTypeTemperature2: MeatTypeTemperature = { meatTypeId: '', name: '', temperature: 100 };

  private _fanRpm: number = 0;
  private _fanSpeed: number = 0;
  private _battery: number = 0.0;
  private _setpoint1: number = 0.0;
  private _setpoint2: number = 0.0;
  private _temperatureProbe1: number = 0.0;
  private _temperatureProbe2: number = 0.0;
  private _sensorType1: SensorType = SensorType.UNKNOWN;
  private _sensorType2: SensorType = SensorType.UNKNOWN;
  private _alarm: boolean = false;

  constructor(private backgroundMode: BackgroundMode,
    private meatTemperatureService: MeatTemperatureService,
    private modalController: ModalController,
    private alarmService: AlarmService,
    private localNotifications: LocalNotifications,
    private audioService: AudioService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private sensorTypeService: SensorTypeService,
    private targetService: TargetService,
    private utilService: UtilService,
    private ngZone: NgZone) {
      this.meatTypeTemperature1 = this.meatTemperatureService.getDefaultMeatTypeTemperature();
      this.meatTypeTemperature2 = this.meatTemperatureService.getDefaultMeatTypeTemperature();
  }


  ngOnInit() {
    // this.route.queryParams.subscribe(params => {
    //   if (this.router.getCurrentNavigation().extras.state) {
    //     this.targetService.connect(this.router.getCurrentNavigation().extras.state.device, () => {
    //       this.doSubscriptions();
    //     });
    //   }
    // });


    // // TODO reset alarm on probe temperature setpoint changes


  }

  // TODO doc
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
      this.ngZone.run(() => { this.temperatureProbe1 = temperature; console.log('temperature1', temperature); });
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

    this.subscriptions.push(this.targetService.getSubscriptionForAlarm().subscribe((alarm: number) => {
      this.ngZone.run(() => { this.alarm = alarm == 1 ? true : false; });
    }));

    this.subscriptions.push(this.targetService.getSubscriptionForSensorType1().subscribe((sensorType: number) => {
      this.ngZone.run(() => { this.sensorType1 = this.sensorTypeService.getSensorTypeModelByIndex(sensorType).type; });
    }));

    this.subscriptions.push(this.targetService.getSubscriptionForSensorType2().subscribe((sensorType: number) => {
      this.ngZone.run(() => { this.sensorType2 = this.sensorTypeService.getSensorTypeModelByIndex(sensorType).type; });
    }));

  }

  // TODO doc
  getBatteryIcon() {
    if (this.battery >= 5.5) {
      return 'battery-full-outline';
    } else if (this.battery > 5.0 && this.battery < 5.5) {
      return 'battery-half-outline';
    } else {
      return 'battery-dead-outline';
    }
  }

  // TODO doc
  hasAlarmFooter() {
    return this.alarm;
  }

  // TODO doc
  getAlarmFooterColor() {
    return this.alarmBlink ? "danger" : "warning";
  }

  // TODO doc
  getSensorTypeString(which: number) {
    if (which == 1) {
      return this.sensorTypeService.getSensorTypeModelBySensorType(this.sensorType1).name;
    } else {
      return this.sensorTypeService.getSensorTypeModelBySensorType(this.sensorType2).name;
    }
  }

  // TODO doc
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
      console.log('strange data from setpoint page returned', data);
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

  /**
   * handle alarms, should only be triggered on raising or falling edges of value
   * @param value
   */
  handleAlarm(value: boolean) {
    console.log('handle alarm method');
    if (this.fanRpm < MIN_FAN_RPM) {
      console.log('rpm alarm');
      this.bleAlarm.alarm = true;
      this.bleAlarm.alarmFan = true;
      this.createLocalAlarmNotification('alarmFan', 1, 'Fan speed < ' + MIN_FAN_RPM + ' rpm')
    } else if (this.battery < 4.5) {
      console.log('battery alarm');
      this.bleAlarm.alarm = true;
      this.bleAlarm.alarmBattery = true;
      this.createLocalAlarmNotification('alarmBattery', 2, 'Low battery voltage')
    } else if (this.temperatureProbe1 >= this.setpoint1) {
      console.log('temperature1 >= setpoint1');
      this.bleAlarm.alarm = true;
      this.bleAlarm.alarmTemperature1 = true;
      this.createLocalAlarmNotification('alarmTemperature1', 3, 'Probe 1 reached set temperature')
    } else if (this.temperatureProbe2 >= this.setpoint2) {
      console.log('temperature2 >= setpoint2');
      this.bleAlarm.alarm = true;
      this.bleAlarm.alarmTemperature2 = true;
      this.createLocalAlarmNotification('alarmTemperature2', 4, 'Probe 2 reached set temperature')
    } else {
      console.log('no alarm');
      this.bleAlarm.alarm = false;
      this.bleAlarm.alarmFan = false;
      this.bleAlarm.alarmBattery = false;
      this.bleAlarm.alarmTemperature1 = false;
      this.bleAlarm.alarmTemperature2 = false;
    }
  }

  /**
   * create a local alarm notification
   * @param type alarm type
   * @param id alarm id
   * @param text alarm text
   */
  createLocalAlarmNotification(type: string, id: number, text: string) {
    this.localNotifications.schedule({
      id: id,
      text: text,
      foreground: true,
      actions: [
        {
          id: 'ack', title: 'Acknowledge'
        }
      ]
    });

    this.localNotifications.on('ack').subscribe((alarmDetails) => {
      console.log('ack', alarmDetails);
      if (alarmDetails.id == id) {
        let keyName = alarmDetails.type + 'Ack';
        if (keyName in this.bleAlarm) {
          console.log('ack ', keyName);
          this.bleAlarm[alarmDetails.type + 'Ack'] = true;
        }
      }
    });
  }

  ionViewWillEnter() {
    this.utilService.backButton();

    this.doSubscriptions();

    this.subscriptions.push(IntervalObservable.create(500).subscribe(() => {
      this.alarmBlink = !this.alarmBlink;
    }));

    this.subscriptions.push(IntervalObservable.create(10 * 1000).subscribe(() => {
      if (this.targetService.isConnected() && this.targetService.isConnectionLost()) {
        this.audioService.play('beep');
        // TODO notification
        // this.localNotifications.schedule({
        //   id: 1,
        //   text: 'Lost connection to LotusBLE'
        // });
      } else if (this.targetService.isConnected() && !this.targetService.isConnectionLost() && this.bleAlarm.alarm) {
        this.audioService.play('alarm');
      }
    }));

    this.backgroundMode.enable();
    this.backgroundMode.setDefaults({
      'title': 'LotusBLE',
      'text': 'Receive values from bluetooth device in background.'
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

  public get bleAlarm(): BleAlarm {
    return this._bleAlarm;
  }
  public set bleAlarm(value: BleAlarm) {
    this._bleAlarm = value;
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
  public get alarm(): boolean {
    return this._alarm;
  }
  public set alarm(value: boolean) {
    this._alarm = value;
  }
}
