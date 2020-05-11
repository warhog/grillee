import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BleData } from '../models/bledata';
import { BleDevice } from '../models/bledevice';
import { BLE } from '@ionic-native/ble/ngx';
import { NavController, ToastController, LoadingController, Platform, ModalController } from '@ionic/angular';
import { BleAlarm } from '../models/blealarm';
import { BlePeripheral } from '../models/bleperipheral';
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
import { SensorTypeModel } from '../models/sensortype';

const LOTUSBLE_SERVICE_UUID = '32b33b05-6ac4-4137-9ca7-6dc3dbac4e41';
const LOTUSBLE_CHARACTERISTIC_ALARM_UUID = '06817906-f5db-4d66-86e4-776e74074cd6';
const LOTUSBLE_CHARACTERISTIC_ALARMACK_UUID = '16817906-f5db-4d66-86e4-776e74074cd6';
const LOTUSBLE_CHARACTERISTIC_SETPOINT1_UUID = '857f0daf-b9e1-45c9-9df3-c935f3e0f163';
const LOTUSBLE_CHARACTERISTIC_SETPOINT2_UUID = '779d932a-c52c-43a0-a38f-668e0bc76f68';
const LOTUSBLE_CHARACTERISTIC_TEMPERATURE1_UUID = 'fc24e2b1-9612-4a85-8f13-c7c0b8ed74c9';
const LOTUSBLE_CHARACTERISTIC_TEMPERATURE2_UUID = '94570d21-a9ca-45d7-a313-8238593286e5';
const LOTUSBLE_CHARACTERISTIC_FAN_UUID = '0303ed74-974e-4ae2-8cee-7296eaffadfa';
const LOTUSBLE_CHARACTERISTIC_RPM_UUID = '26552eef-1507-4e7d-8845-99b815841856';
const LOTUSBLE_CHARACTERISTIC_BATTERY_UUID = '12325d24-0357-4877-b57a-d323793b44b3';
const LOTUSBLE_CHARACTERISTIC_SENSORTYPE1_UUID = 'a4b7ca52-c743-4931-9153-ec28030a41a4';
const LOTUSBLE_CHARACTERISTIC_SENSORTYPE2_UUID = '7488eed8-6b19-4391-9a83-9c97d6f10319';
const MIN_FAN_RPM = 300;

interface ReadAndRegisterData {
  uuid: string,
  datatype: string,
  updateFn: Function,
  read: boolean,
  registered: boolean,
  readRetries: number,
  registerRetries: number
}

@Component({
  selector: 'app-thermometer',
  templateUrl: './thermometer.page.html',
  styleUrls: ['./thermometer.page.scss'],
})
export class ThermometerPage implements OnInit {

  private _bleDevice: BleDevice = null;
  private _bleData: BleData = {
    fan: 100,
    rpm: 0,
    alarm: false,
    battery: 0.0,
    setpoint1: 0,
    setpoint2: 0,
    temperature1: 0,
    temperature2: 0,
    sensorType1: SensorType.UNKNOWN,
    sensorType2: SensorType.UNKNOWN
  };
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

  private _statusMessage: string = "";
  private _rssi: number = 0;
  private _batteryIcon: number = 1.0;
  private loadingOverlay: any = null;
  private intervalAlarm: Subscription = null;
  private intervalAlarmBlink: Subscription = null;
  private alarmBlink: boolean = false;
  private connected: boolean = false;
  private connectionLost: boolean = false;
  private backButtonSubscription: Subscription = null;
  private readAndResisterEntries: ReadAndRegisterData[] = [];
  private intervalReadAndRegisterBLE: Subscription = null;
  private timeoutBLERegistrations: number = null;
  private backButtonPressed: number = 0;
  private intervalRssi: Subscription = null;

  // used for modal setpoint dialog
  private meatTypeTemperature1: MeatTypeTemperature = { meatTypeId: '', name: '', temperature: 100 };
  private meatTypeTemperature2: MeatTypeTemperature = { meatTypeId: '', name: '', temperature: 100 };

  constructor(private backgroundMode: BackgroundMode,
    private meatTemperatureService: MeatTemperatureService,
    private platform: Platform,
    private modalController: ModalController,
    private alarmService: AlarmService,
    private localNotifications: LocalNotifications,
    private audioService: AudioService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private ble: BLE,
    private router: Router,
    private sensorTypeService: SensorTypeService,
    private ngZone: NgZone) {
      this.meatTypeTemperature1 = this.meatTemperatureService.getDefaultMeatTypeTemperature();
      this.meatTypeTemperature2 = this.meatTemperatureService.getDefaultMeatTypeTemperature();
  }

  ngOnInit() {
    // this.route.queryParams.subscribe(params => {
    //   if (this.router.getCurrentNavigation().extras.state) {
    //     this.bleDevice = this.router.getCurrentNavigation().extras.state.device;
    //     this.createLoadingOverlay();
    //     this.statusMessage = 'Connecting to ' + this.bleDevice.name;
    //     this.ble.autoConnect(this.bleDevice.id,
    //       (peripheral: BlePeripheral) => this.onDeviceConnected(peripheral),
    //       (disconnectData) => this.onConnectionError(disconnectData)
    //     );
    //   }
    // });


    // // TODO reset alarm on probe temperature setpoint changes

    // this.intervalAlarmBlink = IntervalObservable.create(500).subscribe(() => {
    //   this.alarmBlink = !this.alarmBlink;
    // });

    // this.intervalAlarm = IntervalObservable.create(10 * 1000).subscribe(() => {
    //   if (this.connected && this.connectionLost) {
    //     this.audioService.play('beep');
    //     // TODO notification
    //     // this.localNotifications.schedule({
    //     //   id: 1,
    //     //   text: 'Lost connection to LotusBLE'
    //     // });
    //   } else if (this.connected && !this.connectionLost && this.bleAlarm.alarm) {
    //     this.audioService.play('alarm');
    //   }
    // });

    // this.backgroundMode.enable();
    // this.backgroundMode.setDefaults({
    //   'title': 'LotusBLE',
    //   'text': 'Receive values from bluetooth device in background.'
    // });

    // this.backgroundMode.on('activate').subscribe(() => {
    //   console.log('activated background mode');
    //   this.backgroundMode.disableWebViewOptimizations();
    //   this.backgroundMode.disableBatteryOptimizations();
    // });

    // this.backgroundMode.on('deactivate').subscribe(() => {
    //   console.log('deactivated background mode');
    // });
  }

  hasAlarmFooter() {
    return this.bleData.alarm;
  }

  getAlarmFooterColor() {
    return this.alarmBlink ? "danger" : "warning";
  }

  /**
   * create a loading overlay with given text
   * @param text loading text
   */
  async createLoadingOverlay(text = 'Please wait...') {
    if (this.loadingOverlay == null) {
      this.loadingOverlay = await this.loadingCtrl.create({
        message: text
      });
      await this.loadingOverlay.present();
    }
  }

  /**
   * dismiss the loading overlay
   */
  dismissLoadingOverlay() {
    if (this.loadingOverlay != null) {
      this.loadingOverlay.dismiss();
      this.loadingOverlay = null;
    }
  }

  // TODO doc
  getSensorTypeString(which: number) {
    if (which == 1) {
      return this.sensorTypeService.getSensorTypeModelBySensorType(this.bleData.sensorType1).name;
    } else {
      return this.sensorTypeService.getSensorTypeModelBySensorType(this.bleData.sensorType2).name;
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
    console.log('changed fan speed to ' + newFanSpeed);
    newFanSpeed = Math.max(Math.min(newFanSpeed, 100), 10);
    console.log('fan speed after limiting ' + newFanSpeed);
    this.bleData.fan = newFanSpeed;
    this.sendBLEData(LOTUSBLE_CHARACTERISTIC_FAN_UUID, this.bleData.fan.toString());
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
      this.bleData.setpoint1 = this.meatTypeTemperature1.temperature;
      this.sendBLEData(LOTUSBLE_CHARACTERISTIC_SETPOINT1_UUID, this.bleData.setpoint1.toString());
    } else {
      this.meatTypeTemperature2 = meatTypeTemperatureResponse;
      this.bleData.setpoint2 = this.meatTypeTemperature2.temperature;
      this.sendBLEData(LOTUSBLE_CHARACTERISTIC_SETPOINT2_UUID, this.bleData.setpoint2.toString());
    }
  }

  stringToBytes(str: string): ArrayBuffer {
    var array = new Uint8Array(str.length);
    for (var i = 0, l = str.length; i < l; i++) {
        array[i] = str.charCodeAt(i);
     }
     return array.buffer;
  }

  /**
   * callback for ble connection error
   * @param disconnectData the disconnection reason
   */
  onConnectionError(disconnectData) {
    this.connectionLost = true;
    if (this.connected) {
      this.createLoadingOverlay('Trying to reconnect...');
      this.setStatus('Disconnected, trying to reconnect...');
    }
    console.log('disconnected (connection error): ', disconnectData);
  }


  /**
   * add a ble data and registration entry for ble reading and registration
   * @param characteristic the ble characteristic
   * @param datatype the datatype (not ionic/ts datatype but c++ datatype) for data conversion
   * @param updateFn the callback to call on successful read / ble notifications
   */
  addReadAndRegisterBLE(characteristic: string, datatype: string, updateFn: Function) {
    this.readAndResisterEntries.push({
      uuid: characteristic,
      datatype: datatype,
      updateFn: updateFn,
      read: false,
      registered: false,
      readRetries: 0,
      registerRetries: 0
    });
  }

  /**
   * device connected successful callback
   * @param peripheral 
   */
  onDeviceConnected(peripheral: BlePeripheral) {
    this.connectionLost = false;
    this.connected = true;

    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_FAN_UUID, 'uint16_t', (value: number) => { this.ngZone.run(() => { this.bleData.fan = value; })});
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_RPM_UUID, 'uint16_t', (value: number) => { this.ngZone.run(() => { this.bleData.rpm = value; })});
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_BATTERY_UUID, 'float32_t', (value: number) => {
      let batteryIcon: number = 1.0;
      if (value > 4.9 && value < 5.2) {
        batteryIcon = 0.5;
      } else if (value < 4.9) {
        batteryIcon = 0.0;
      }
      console.log('battery icon: ' + batteryIcon + ', value: ' + value);
      this.ngZone.run(() => {
        this.batteryIcon = batteryIcon;
        this.bleData.battery = value;
      })
    });
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_TEMPERATURE1_UUID, 'int16_t', (value: number) => { this.ngZone.run(() => { this.bleData.temperature1 = value; })});
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_TEMPERATURE2_UUID, 'int16_t', (value: number) => { this.ngZone.run(() => { this.bleData.temperature2 = value; })});
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_SETPOINT1_UUID, 'uint16_t', (value: number) => { this.ngZone.run(() => { console.log('sp1', value); this.bleData.setpoint1 = value; })});
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_SETPOINT2_UUID, 'uint16_t', (value: number) => { this.ngZone.run(() => { this.bleData.setpoint2 = value; })});
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_ALARM_UUID, 'bool', (value: boolean) => { this.ngZone.run(() => { this.bleData.alarm = value; this.handleAlarm(value); })});
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_SENSORTYPE1_UUID, 'uint8_t', (value: number) => { this.ngZone.run(() => {
      // TODO test if value valid and sensorTypeModel is not undefined
      let sensorTypeModel: SensorTypeModel = this.sensorTypeService.getSensorTypeModelByIndex(value);
      this.bleData.sensorType1 = sensorTypeModel.type;
    })});
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_SENSORTYPE2_UUID, 'uint8_t', (value: number) => { this.ngZone.run(() => {
      let sensorTypeModel: SensorTypeModel = this.sensorTypeService.getSensorTypeModelByIndex(value);
      this.bleData.sensorType2 = sensorTypeModel.type;
    })});

    if (this.intervalRssi == null) {
      this.intervalRssi = IntervalObservable.create(5000).subscribe(() => {
        this.ble.readRSSI(this.bleDevice.id).then((rssi) => {
          this.rssi = rssi;
        }, (msg) => {
          console.log('rssi read failed');
        })
      });
    }

    this.readAndRegisterAllBLE();
    this.intervalReadAndRegisterBLE = IntervalObservable.create(1000).subscribe(() => {
      this.readAndRegisterAllBLE();
    });
  }

  /**
   * read and register all listed ble data points registered by addReadAndRegisterBLE
   * should be called on device connection for inital read and registration of further ble updates
   */
  readAndRegisterAllBLE() {
    // read all BLE values and register for BLE notifications
    // this is done up to 3 times. the first try is immediately and the next ones in 1s intervals
    // after the initial run a 3s timer is started. when this timer expires and no registration errors appeared
    // it is assumed that all registrations were successful, if a registrations fails it is retried (when below 3 retries)
    // and the 3s timer is restarted (see timer in readAndRegisterAllBLE). this is needed because startNotification has no
    // successfully registered callback
    
    // get all unread entries
    let unread = this.readAndResisterEntries.filter((entry) => {
      return !entry.read;
    });
    if (unread.length > 0) {
      console.log('unread entries: ' + unread.length);
      unread.forEach((entry) => {
        // read retry handling
        entry.readRetries++;
        if (entry.readRetries >= 3) {
          // too many retries, disconnecting from device
          console.log('readRetries >= 3: ', entry);
          this.showToast('Cannot read data from device, disconnecting.', 3000);
          this.disconnect();
        }
        // read the ble data from device
        this.readBLEData(entry);
      });
    } else {
      // get all unregistered entries
      let unregistered = this.readAndResisterEntries.filter((entry) => {
        return !entry.registered;
      });
      console.log('unregistered entries: ' + unregistered.length);
      if (unregistered.length > 0) {
        unregistered.forEach((entry) => {
          // registration retry handling
          console.log('registering entry', entry);
          entry.registerRetries++;
          if (entry.registerRetries >= 3) {
            // too many retries, disconnecting from device
            console.log('registerRetries >= 3: ', entry);
            this.showToast('Cannot subscribe to device, disconnecting.', 3000);
            this.disconnect();
            return;
          }
          // send the ble notificatino registrations
          this.registerForBLENotifications(entry);
          entry.registered = true;
          // if a registration done timer is running means we are the second time in the unregistered forEach loop
          // restart timer to make sure it always waits the defined time when an registration failure happens
          if (this.isBLERegistrationDoneTimerRunning()) {
            this.restartBLERegistrationDoneTimer();
          }
        });
      } else {
        console.log('no unregistered and unread entries');
        this.dismissLoadingOverlay();
        // start a timer here to see if one of the registrations fails later
        this.startBLERegistrationDoneTimer();
      }
    }
  }
  
  /**
   * show a toast message
   * @param msg the message
   * @param duration the toast message duration in ms
   */
  async showToast(msg: string, duration: number) {
    let toast = await this.toastCtrl.create({
      message: msg,
      duration: duration
    });
    toast.present();
  }

  /**
   * is a ble registration done timer running?
   * @returns true if a timer is existing and running
   */
  isBLERegistrationDoneTimerRunning() {
    return this.timeoutBLERegistrations != null;
  }

  /**
   * restarts the ble registration done timer
   */
  restartBLERegistrationDoneTimer() {
    if (this.timeoutBLERegistrations != null) {
      console.log('a registration timer is set, restart');
      clearTimeout(this.timeoutBLERegistrations);
      this.timeoutBLERegistrations = null;
    } else {
      console.log('restartBLERegistrationDoneTimer called without a timer already existing, creating new timer');
    }
    this.startBLERegistrationDoneTimer();
  }

  /**
   * start the ble registration done timer. contains also the stop handler to unsubscribe from the interval
   */
  startBLERegistrationDoneTimer() {
    if (this.timeoutBLERegistrations == null) {
      console.log('starting registrations done timer');
      this.timeoutBLERegistrations = window.setTimeout(() => {
        console.log('seems all registered, stop loop');
        if (this.intervalReadAndRegisterBLE != null) {
          this.intervalReadAndRegisterBLE.unsubscribe();
          this.intervalReadAndRegisterBLE = null;
        } else {
          console.log('intervalReadAndRegsiterBLE was already null');
        }
      }, 3000);
    }
  }

  /**
   * send a ble notification registration request
   * @param entry
   */
  registerForBLENotifications(entry: ReadAndRegisterData) {
    console.log('register ', entry.uuid);
    this.ble.startNotification(this.bleDevice.id, LOTUSBLE_SERVICE_UUID, entry.uuid).subscribe(
      (data) => {
        console.log('notification for', entry.uuid);
        this.readBLEData(entry);
      },
      (msg) => {
        entry.registered = false;
        console.log('cannot subscribe to ', entry.uuid, msg);
      }
    );
  }

  /**
   * send string data to the given characteristic, displays toast on error.
   * @param characteristic the ble characteristic to send data to
   * @param data the string data to send
   */
  sendBLEData(characteristic: string, data: string) {
    this.ble.write(this.bleDevice.id, LOTUSBLE_SERVICE_UUID, characteristic, this.stringToBytes(data)).then(
      result => {
        console.log('ble write result: ', result);
      }).catch((msg) => {
        console.log('cannot write ble data: ', msg);
        this.showToast('Cannot write data to device (' + msg + ').', 3000);
      });
  }

  /**
   * read data from ble, calls the given function with the result, displays toast on errors
   * @param entry 
   */
  readBLEData(entry: ReadAndRegisterData) {
    this.ble.read(this.bleDevice.id, LOTUSBLE_SERVICE_UUID, entry.uuid).then(
      (data) => {
        entry.read = true;
        if (entry.datatype == 'uint8_t') {
          entry.updateFn(new Uint8Array(data)[0]);
        } else if (entry.datatype == 'uint16_t') {
          entry.updateFn(new Uint16Array(data)[0]);
        } else if (entry.datatype == 'uint32_t') {
          entry.updateFn(new Uint32Array(data)[0]);
        } else if (entry.datatype == 'int8_t') {
          entry.updateFn(new Int8Array(data)[0]);
        } else if (entry.datatype == 'int16_t') {
          entry.updateFn(new Int16Array(data)[0]);
        } else if (entry.datatype == 'int32_t') {
          entry.updateFn(new Int32Array(data)[0]);
        } else if (entry.datatype == 'float32_t') {
          entry.updateFn(new Float32Array(data)[0]);
        } else if (entry.datatype == 'bool') {
          entry.updateFn(new Uint8Array(data)[0] == 1 ? true : false);
        } else {
          console.log('unknown datatype: ', entry.datatype);
          return;
        }
      },
      (msg) => {
        console.log('cannot read data: ', msg);
      }
    );
  }

  /**
   * handle alarms, should only be triggered on raising or falling edges of value
   * @param value
   */
  handleAlarm(value: boolean) {
    console.log('handle alarm method');
    if (this.bleData.rpm < MIN_FAN_RPM) {
      console.log('rpm alarm');
      this.bleAlarm.alarm = true;
      this.bleAlarm.alarmFan = true;
      this.createLocalAlarmNotification('alarmFan', 1, 'Fan speed < ' + MIN_FAN_RPM + ' rpm')
    } else if (this.bleData.battery < 4.5) {
      console.log('battery alarm');
      this.bleAlarm.alarm = true;
      this.bleAlarm.alarmBattery = true;
      this.createLocalAlarmNotification('alarmBattery', 2, 'Low battery voltage')
    } else if (this.bleData.temperature1 >= this.bleData.setpoint1) {
      console.log('temperature1 >= setpoint1');
      this.bleAlarm.alarm = true;
      this.bleAlarm.alarmTemperature1 = true;
      this.createLocalAlarmNotification('alarmTemperature1', 3, 'Probe 1 reached set temperature')
    } else if (this.bleData.temperature2 >= this.bleData.setpoint2) {
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

  /**
   * disconnect from the ble devices and return to overview
   */
  disconnect() {
    if (this.intervalReadAndRegisterBLE != null) {
      this.intervalReadAndRegisterBLE.unsubscribe();
      this.intervalReadAndRegisterBLE = null;
    }

    if (this.intervalAlarmBlink != null) {
      this.intervalAlarmBlink.unsubscribe();
      this.intervalAlarmBlink = null;
    }

    if (this.intervalRssi != null) {
      this.intervalRssi.unsubscribe();
      this.intervalRssi = null;
    }
    // ble disconnect happens in ionViewWillLeave
    this.navCtrl.navigateRoot(['/home']);
  }

  ionViewWillEnter() {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(1, () => {
      if (this.backButtonPressed == 0) {
        this.showToast('Press again to exit...', 2000);
        this.backButtonPressed++;
        setTimeout(() => {
          console.log('reverting back button exit action');
          this.backButtonPressed = 0;
        }, 2000);
      } else {
        navigator['app'].exitApp();
      }
    });
  }

  ionViewWillLeave() {
    if (this.intervalAlarm != null) {
      this.intervalAlarm.unsubscribe();
      this.intervalAlarm = null;
    }
    this.connected = false;
    this.ble.disconnect(this.bleDevice.id).then(
      () => console.log('disconnected', this.bleDevice),
      () => console.log('error during disconnecting', this.bleDevice)
    )
    this.backgroundMode.disable();
    if (this.backButtonSubscription != null) {
      this.backButtonSubscription.unsubscribe();
    }
  }


  setStatus(message: string) {
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  public get bleDevice(): any {
    return this._bleDevice;
  }
  public set bleDevice(value: any) {
    this._bleDevice = value;
  }
  public get bleData(): BleData {
    return this._bleData;
  }
  public set bleData(value: BleData) {
    this._bleData = value;
  }
  public get statusMessage(): string {
    return this._statusMessage;
  }
  public set statusMessage(value: string) {
    this._statusMessage = value;
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
  public get batteryIcon(): number {
    return this._batteryIcon;
  }
  public set batteryIcon(value: number) {
    this._batteryIcon = value;
  }
}
