import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { BleDevice } from './models/bledevice';
import { BlePeripheral } from './models/bleperipheral';
import { Subscription, BehaviorSubject } from 'rxjs';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { UtilService } from './util.service';

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

// TODO home view scan put here

interface ReadAndRegisterData {
  uuid: string,
  datatype: string,
  read: boolean,
  registered: boolean,
  readRetries: number,
  registerRetries: number,
  behaviorSubject: BehaviorSubject<number>
}

@Injectable({
  providedIn: 'root'
})
export class TargetService {

  private bleDevice: BleDevice = null;
  private connectionLost: boolean = true;
  private connected: boolean = false;
  private intervalReadAndRegisterBLE: Subscription = null;
  private timeoutBLERegistrations: number = null;
  private intervalRssi: Subscription = null;
  private datapoints: Array<ReadAndRegisterData> = [];
  private rssiBehaviorSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(private ble: BLE, private utilService: UtilService) {

  }

  /**
   * add a ble data and registration entry for ble reading and registration
   * @param uuid the ble characteristics uuid
   * @param datatype the datatype (not ionic/ts datatype but c++ datatype) for data conversion
   */
  addReadAndRegisterBLE(uuid: string, datatype: string) {
    let data: ReadAndRegisterData = {
      uuid: uuid,
      datatype: datatype,
      read: false,
      registered: false,
      readRetries: 0,
      registerRetries: 0,
      behaviorSubject: new BehaviorSubject<number>(0)
    };
    this.datapoints.push(data);
  }

  // TODO doc
  getReadAndRegisterDataForUuid(uuid: string): ReadAndRegisterData {
    let data: Array<ReadAndRegisterData> = this.datapoints.filter((entry: ReadAndRegisterData) => {
      return entry.uuid == uuid;
    });
    if (data.length > 0) {
      return data[0];
    }
    return null;
  }

  /**
   * connect to the given ble device
   * 
   * @param bleDevice
   */
  connect(bleDevice: BleDevice = null, connectedCallback: Function = null) {
    if (!this.connected) {
      this.utilService.createLoadingOverlay('Connecting... please wait...');
      this.bleDevice = bleDevice;
      this.ble.autoConnect(this.bleDevice.id,
        (peripheral: BlePeripheral) => this.onDeviceConnected(peripheral, connectedCallback),
        (disconnectData) => this.onConnectionError(disconnectData)
      );
    } else {
      console.log('already connected');
    }
  }

  /**
   * disconnect from ble device
   */
  disconnect() {
    if (this.intervalRssi != null) {
      this.intervalRssi.unsubscribe();
      this.intervalRssi = null;
    }
    this.ble.disconnect(this.bleDevice.id).then(
      () => {
        this.connected = false;
        this.connectionLost = true;
      },
      () => console.log('error during disconnecting', this.bleDevice)
    )
  }

  // TODO doc
  loadOrScan(callbackLoaded: Function, callbackScanNewDevice: Function) {
    this.utilService.loadBleDevice().then((bleDevice: BleDevice) => {
      console.log('ble device loaded');
      this.bleDevice = bleDevice;
      callbackLoaded && callbackLoaded(this.bleDevice);
    },
    (error) => {
      console.log('no ble device, start scanning');
      this.utilService.showToast('Scanning for devices...', 1000);
      this.scan(callbackScanNewDevice);
    });
  }

  scan(callbackScanNewDevice: Function) {
    this.ble.scan([LOTUSBLE_SERVICE_UUID], 3).subscribe(
      device => {
        console.log('discovered ble device', device);
        callbackScanNewDevice && callbackScanNewDevice(device);
      },
      error => this.scanError(error)
    );
}

  scanError(error: string) {
    console.log('error scanning ble', error);
  }


  /**
   * generic get the behavior subject for uuids
   * @param uuid the uuid to get the behavior subject for
   * @returns behaviorsubject for the given uuid
   */
  getSubscriptionForUuid(uuid: string): BehaviorSubject<number> {
    let entries = this.datapoints.filter((entry) => {
      return uuid == entry.uuid;
    });
    if (entries.length > 0) {
      return entries[0].behaviorSubject;
    }
    return null;
  }

  getSubscriptionForFanRpm(): BehaviorSubject<number> {
    return this.getSubscriptionForUuid(LOTUSBLE_CHARACTERISTIC_RPM_UUID);
  }

  getSubscriptionForFanSpeed(): BehaviorSubject<number> {
    return this.getSubscriptionForUuid(LOTUSBLE_CHARACTERISTIC_FAN_UUID);
  }

  getSubscriptionForBattery(): BehaviorSubject<number> {
    return this.getSubscriptionForUuid(LOTUSBLE_CHARACTERISTIC_BATTERY_UUID);
  }

  getSubscriptionForProbe1(): BehaviorSubject<number> {
    return this.getSubscriptionForUuid(LOTUSBLE_CHARACTERISTIC_TEMPERATURE1_UUID);
  }

  getSubscriptionForProbe2(): BehaviorSubject<number> {
    return this.getSubscriptionForUuid(LOTUSBLE_CHARACTERISTIC_TEMPERATURE2_UUID);
  }

  getSubscriptionForSetpoint1(): BehaviorSubject<number> {
    return this.getSubscriptionForUuid(LOTUSBLE_CHARACTERISTIC_SETPOINT1_UUID);
  }

  getSubscriptionForSetpoint2(): BehaviorSubject<number> {
    return this.getSubscriptionForUuid(LOTUSBLE_CHARACTERISTIC_SETPOINT2_UUID);
  }

  getSubscriptionForSensorType1(): BehaviorSubject<number> {
    return this.getSubscriptionForUuid(LOTUSBLE_CHARACTERISTIC_SENSORTYPE1_UUID);
  }

  getSubscriptionForSensorType2(): BehaviorSubject<number> {
    return this.getSubscriptionForUuid(LOTUSBLE_CHARACTERISTIC_SENSORTYPE2_UUID);
  }

  getSubscriptionForAlarm(): BehaviorSubject<number> {
    return this.getSubscriptionForUuid(LOTUSBLE_CHARACTERISTIC_ALARM_UUID);
  }

  getSubscriptionForRssi(): BehaviorSubject<number> {
    return this.rssiBehaviorSubject;
  }

  setFanSpeed(fanSpeed: number) {
    console.log('changed fan speed to ' + fanSpeed);
    fanSpeed = Math.max(Math.min(fanSpeed, 100), 10);
    console.log('fan speed after limiting ' + fanSpeed);
    this.sendBleDataNumber(LOTUSBLE_CHARACTERISTIC_FAN_UUID, 'uint8_t', fanSpeed);
    this.getSubscriptionForFanSpeed().next(fanSpeed);
  }

  setSetpoint1(setpoint: number) {
    console.log('changed setpoint1 ' + setpoint);
    setpoint = Math.max(Math.min(setpoint, 200), 0);
    this.sendBleDataNumber(LOTUSBLE_CHARACTERISTIC_SETPOINT1_UUID, 'uint16_t', setpoint);
    this.getSubscriptionForSetpoint1().next(setpoint);
  }

  setSetpoint2(setpoint: number) {
    console.log('changed setpoint2 ' + setpoint);
    setpoint = Math.max(Math.min(setpoint, 200), 0);
    this.sendBleDataNumber(LOTUSBLE_CHARACTERISTIC_SETPOINT2_UUID, 'uint16_t', setpoint);
    this.getSubscriptionForSetpoint2().next(setpoint);
  }

  setSensorType1(sensorType: number) {
    console.log('changed sensor type 1 ' + sensorType);
    this.sendBleDataNumber(LOTUSBLE_CHARACTERISTIC_SENSORTYPE1_UUID, 'uint8_t', sensorType);
    this.getSubscriptionForSensorType1().next(sensorType);
  }

  setSensorType2(sensorType: number) {
    console.log('changed sensor type 2 ' + sensorType);
    this.sendBleDataNumber(LOTUSBLE_CHARACTERISTIC_SENSORTYPE2_UUID, 'uint8_t', sensorType);
    this.getSubscriptionForSensorType2().next(sensorType);
  }

  /**
   * device connected successful callback
   * @param peripheral 
   */
  onDeviceConnected(peripheral: BlePeripheral, connectedCallback: Function = null) {
    this.connectionLost = false;
    this.connected = true;

    this.utilService.storeBleDevice(this.bleDevice);

    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_FAN_UUID, 'uint8_t');
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_RPM_UUID, 'uint16_t');
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_BATTERY_UUID, 'float32_t');
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_TEMPERATURE1_UUID, 'int16_t');
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_TEMPERATURE2_UUID, 'int16_t');
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_SETPOINT1_UUID, 'uint16_t');
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_SETPOINT2_UUID, 'uint16_t');
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_ALARM_UUID, 'bool');
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_SENSORTYPE1_UUID, 'uint8_t');
    this.addReadAndRegisterBLE(LOTUSBLE_CHARACTERISTIC_SENSORTYPE2_UUID, 'uint8_t');

    this.readAndRegisterAllBLE();
    this.intervalReadAndRegisterBLE = IntervalObservable.create(1000).subscribe(() => {
      this.readAndRegisterAllBLE();
    });

    this.intervalRssi = IntervalObservable.create(5000).subscribe(() => {
      this.ble.readRSSI(this.bleDevice.id).then((rssi) => {
        this.rssiBehaviorSubject.next(rssi);
      }, (msg) => {
        console.log('rssi read failed');
      })
    });

    connectedCallback && connectedCallback();
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
    let unread = this.datapoints.filter((entry) => {
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
          this.utilService.showToast('Cannot read data from device, disconnecting.', 3000);
          this.disconnect();
        }
        // read the ble data from device
        this.readBleData(entry);
      });
    } else {
      // get all unregistered entries
      let unregistered = this.datapoints.filter((entry) => {
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
            this.utilService.showToast('Cannot subscribe to device, disconnecting.', 3000);
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
        
        this.utilService.dismissLoadingOverlay();
        // start a timer here to see if one of the registrations fails later
        this.startBLERegistrationDoneTimer();
      }
    }
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
      (data: ArrayBuffer) => {
        console.log('notification for ', entry.uuid, ' with data ', data);
        this.processReadBleData(entry, data);
      },
      (msg) => {
        entry.registered = false;
        console.log('cannot subscribe to ', entry.uuid, msg);
      }
    );
  }

  /**
   * returns connection state
   * @returns true if connection is lost
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * returns connection lost state
   * @returns true if connection is lost
   */
  isConnectionLost(): boolean {
    return this.connectionLost;
  }

  /**
   * send string data to the given characteristic, displays toast on error.
   * @param characteristic the ble characteristic to send data to
   * @param data the string data to send
   */
  sendBleDataNumber(characteristic: string, datatype: string, data: number) {
    console.log('sendBleDataNumber', this.numberToBytes(data, datatype));
    this.ble.write(this.bleDevice.id, LOTUSBLE_SERVICE_UUID, characteristic, this.numberToBytes(data, datatype)).then(
      result => {
        console.log('ble write number result: ', result);
      }).catch((msg) => {
        console.log('cannot write ble number data: ', msg);
        this.utilService.showToast('Cannot write data to device (' + msg + ').', 3000);
      });
  }
  sendBleDataBoolean(characteristic: string, data: boolean) {
    this.ble.write(this.bleDevice.id, LOTUSBLE_SERVICE_UUID, characteristic, this.boolToBytes(data)).then(
      result => {
        console.log('ble write bool result: ', result);
      }).catch((msg) => {
        console.log('cannot write ble bool data: ', msg);
        this.utilService.showToast('Cannot write data to device (' + msg + ').', 3000);
      });
  }


  // TODO doc
  numberToBytes(nr: number, datatype: string): ArrayBuffer {
    let result: ArrayBuffer = new ArrayBuffer(2);
    if (datatype == 'uint8_t') {
      result = Uint8Array.of(nr).buffer;
    } else if (datatype == 'uint16_t') {
      result = Uint16Array.of(nr).buffer;
    } else if (datatype == 'uint32_t') {
      result = Uint32Array.of(nr).buffer;
    } else if (datatype == 'int8_t') {
      result = Int8Array.of(nr).buffer;
    } else if (datatype == 'int16_t') {
      result = Int16Array.of(nr).buffer;
    } else if (datatype == 'int32_t') {
      result = Int32Array.of(nr).buffer;
    } else if (datatype == 'float32_t') {
      result = Float32Array.of(nr).buffer;
    } else {
      console.log('unknown datatype: ', datatype);
    }
    return result;
  }

  // TODO doc
  boolToBytes(bool: boolean): ArrayBuffer {
    return Uint8Array.of(bool ? 1 : 0).buffer;
  }

  // TODO doc
  readBleDataFromUuid(uuid: string): number {
    let data: ReadAndRegisterData = this.getReadAndRegisterDataForUuid(uuid);
    if (data != null) {
      return data.behaviorSubject.getValue();
    }
    return null;
  }

  readSensorType1(): number {
    return this.readBleDataFromUuid(LOTUSBLE_CHARACTERISTIC_SENSORTYPE1_UUID);
  }

  readSensorType2(): number {
    return this.readBleDataFromUuid(LOTUSBLE_CHARACTERISTIC_SENSORTYPE2_UUID);
  }

  /**
   * read data from ble, calls the given function with the result, displays toast on errors
   * @param entry 
   */
  readBleData(entry: ReadAndRegisterData) {
    this.ble.read(this.bleDevice.id, LOTUSBLE_SERVICE_UUID, entry.uuid).then(
      (data: ArrayBuffer) => {
        console.log('read', entry.uuid, data, entry);
        this.processReadBleData(entry, data);
      },
      (msg) => {
        console.log('cannot read data: ', msg);
      }
    );
  }

  /**
   * process the read and register result data for a given entry
   * 
   * calls registered behaviorsubject with decoded datatype
   * 
   * @param entry the entry the data belongs to
   * @param data the received ble data
   */
  processReadBleData(entry: ReadAndRegisterData, data: ArrayBuffer) {
    entry.read = true;
    if (entry.datatype == 'uint8_t') {
      entry.behaviorSubject.next(new Uint8Array(data)[0]);
    } else if (entry.datatype == 'uint16_t') {
      entry.behaviorSubject.next(new Uint16Array(data)[0]);
    } else if (entry.datatype == 'uint32_t') {
      entry.behaviorSubject.next(new Uint32Array(data)[0]);
    } else if (entry.datatype == 'int8_t') {
      entry.behaviorSubject.next(new Int8Array(data)[0]);
    } else if (entry.datatype == 'int16_t') {
      entry.behaviorSubject.next(new Int16Array(data)[0]);
    } else if (entry.datatype == 'int32_t') {
      entry.behaviorSubject.next(new Int32Array(data)[0]);
    } else if (entry.datatype == 'float32_t') {
      entry.behaviorSubject.next(new Float32Array(data)[0]);
    } else if (entry.datatype == 'bool') {
      // TODO return bool
      entry.behaviorSubject.next(new Uint8Array(data)[0] == 1 ? 1 : 0);
    } else {
      console.log('unknown datatype: ', entry.datatype);
      return;
    }
  }

  /**
   * callback for ble connection error
   * @param disconnectData the disconnection reason
   */
  onConnectionError(disconnectData) {
    console.log('disconnected (connection error): ', disconnectData);
    this.connectionLost = true;
    this.utilService.dismissLoadingOverlay();
    if (this.connected) {
      // if we were connected before try to reconnect
      console.log('connection lost, trying to reconnect');
      this.utilService.createLoadingOverlay('Trying to reconnect...');
    }
  }

}
