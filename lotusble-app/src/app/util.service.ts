import { Injectable } from '@angular/core';
import { LoadingController, ToastController, Platform } from '@ionic/angular';
import { BleDevice } from './models/bledevice';
import { Subscription } from 'rxjs';
import { Storage } from '@ionic/storage';

const STORAGE_KEY_BLE_DEVICE = 'bleDevice';
const STORAGE_KEY_TEMPERATURE_AS_FAHRENHEIT = 'fahrenheit';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  private loadingOverlay: any = null;
  private backButtonSubscription: Subscription = null;
  private backButtonPressed: number = 0;
  private temperatureAsFahrenheit: boolean = false;

  constructor(private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private storage: Storage,
    private platform: Platform) { }


  backButton() {
    if (this.backButtonSubscription == null) {
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
  }


  loadBleDevice(): Promise<BleDevice> {
    return new Promise((resolve, reject) => {
      this.storage.get(STORAGE_KEY_BLE_DEVICE).then(
        (bleDevice: BleDevice) => {
        console.log('stored ble device', bleDevice);
        if (bleDevice != null) {
          resolve(bleDevice);
        } else {
          console.log('bledevice is null');
          reject();
        }
      },
      (error: string) => {
        console.log('storage error', error)
        reject();
      });
    });
  }

  storeBleDevice(bleDevice: BleDevice) {
    console.log('storing ble device', bleDevice);
    this.storage.set(STORAGE_KEY_BLE_DEVICE, bleDevice);
  }

  clearBleDevice() {
    this.storage.remove(STORAGE_KEY_BLE_DEVICE);
  }

  getTemperatureAsFahrenheit(): boolean {
    return this.temperatureAsFahrenheit;
  }

  loadTemperatureAsFahrenheit(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.get(STORAGE_KEY_TEMPERATURE_AS_FAHRENHEIT).then(
        (bool: boolean) => {
        console.log('stored temperature as fahrenheit', bool);
        if (bool != null) {
          this.temperatureAsFahrenheit = bool;
          resolve(bool);
        } else {
          console.log('bool is null');
          reject();
        }
      },
      (error: string) => {
        console.log('storage error', error)
        reject();
      });
    });
  }

  storeTemperatureAsFahrenheit(bool: boolean) {
    console.log('storing temperature as fahrenheit', bool);
    this.temperatureAsFahrenheit = bool;
    this.storage.set(STORAGE_KEY_TEMPERATURE_AS_FAHRENHEIT, bool);
  }

  clearTemperatureAsFahrenheit() {
    this.storage.remove(STORAGE_KEY_TEMPERATURE_AS_FAHRENHEIT);
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

}
