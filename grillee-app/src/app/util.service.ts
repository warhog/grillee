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
import { Injectable } from '@angular/core';
import { LoadingController, ToastController, Platform } from '@ionic/angular';
import { BleDevice } from './models/bledevice';
import { Subscription } from 'rxjs';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { MeatTemperatureService } from './meat-temperature.service';

const STORAGE_KEY_BLE_DEVICE = 'bleDevice';
const STORAGE_KEY_TEMPERATURE_AS_FAHRENHEIT = 'fahrenheit';
const STORAGE_KEY_LANGUAGE = 'language';
const STORAGE_KEY_PROBE = 'probe';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  private loadingOverlay: any = null;
  private backButtonSubscription: Subscription = null;
  private backButtonPressed: number = 0;
  private backButtonCallbackFunction: Function = null;
  private temperatureAsFahrenheit: boolean = false;
  private language: string = 'en';
  private probeData: Array<MeatTypeTemperature> = [];

  constructor(private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private storage: Storage,
    private platform: Platform,
    private translateService: TranslateService,
    private meatTemperatureService: MeatTemperatureService) { }

  /**
   * handler for the back button application exit
   */
  backButton() {
    this.backButtonCallbackFunction = null;
    if (this.backButtonSubscription == null) {
      this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(1, () => {
        if (this.backButtonPressed == 0) {
          this.translateService.get('util.pressExitAgainText').subscribe((res: string) => {
          this.showToast(res, 2000);
          });
          this.backButtonPressed++;
          setTimeout(() => {
            console.log('reverting back button exit action');
            this.backButtonPressed = 0;
          }, 2000);
        } else {
          console.log('exiting app');
          if (this.backButtonCallbackFunction != null) {
            console.log('calling exit callback');
            this.backButtonCallbackFunction();
          }
          navigator['app'].exitApp();
        }
      });
    }
  }

  backButtonCallback(callbackBeforeExit: Function = null) {
    if (this.backButtonCallbackFunction != null) {
      console.error('backButtonCallback() shall be called after backButton()');
    }
    this.backButtonCallbackFunction = callbackBeforeExit;
  }

  /**
   * loads the ble device from the storage
   */
  loadBleDeviceSetting(): Promise<BleDevice> {
    return new Promise((resolve, reject) => {
      this.storage.get(STORAGE_KEY_BLE_DEVICE).then(
        (bleDevice: BleDevice) => {
        console.log('stored ble device', bleDevice);
        if (bleDevice != null) {
          resolve(bleDevice);
        } else {
          console.error('bledevice is null');
          reject();
        }
      },
      (error: string) => {
        console.error('storage error', error)
        reject();
      });
    });
  }

  /**
   * store given ble device to storage
   * @param bleDevice 
   */
  storeBleDeviceSetting(bleDevice: BleDevice) {
    console.log('storing ble device', bleDevice);
    this.storage.set(STORAGE_KEY_BLE_DEVICE, bleDevice);
  }

  /**
   * clear stored ble device from storage
   */
  clearBleDeviceSetting() {
    this.storage.remove(STORAGE_KEY_BLE_DEVICE);
  }

  /**
   * read temperature as fahrenheit setting from chached value (to prevent rereading the database)
   */
  getTemperatureAsFahrenheitSettingFromCache(): boolean {
    return this.temperatureAsFahrenheit;
  }

  /**
   * load temperature as fahrenheit setting from storage
   */
  loadTemperatureAsFahrenheitSetting(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.get(STORAGE_KEY_TEMPERATURE_AS_FAHRENHEIT).then(
        (bool: boolean) => {
        console.log('stored temperature as fahrenheit', bool);
        if (bool != null) {
          this.temperatureAsFahrenheit = bool;
          resolve(bool);
        } else {
          console.error('bool is null');
          resolve(false);
        }
      },
      (error: string) => {
        console.error('storage error', error)
        reject();
      });
    });
  }

  /**
   * store temperature as fahrenheit setting to storage
   * @param bool 
   */
  storeTemperatureAsFahrenheitSetting(bool: boolean) {
    console.log('storing temperature as fahrenheit', bool);
    this.temperatureAsFahrenheit = bool;
    this.storage.set(STORAGE_KEY_TEMPERATURE_AS_FAHRENHEIT, bool);
  }

  /**
   * clear temperature as fahrenheit setting from storage
   */
  clearTemperatureAsFahrenheitSetting() {
    this.storage.remove(STORAGE_KEY_TEMPERATURE_AS_FAHRENHEIT);
  }

    /**
   * read language setting from chached value (to prevent rereading the database)
   */
  getLanguageSettingFromCache(): string {
    return this.language;
  }

  /**
   * load language setting from storage
   */
  loadLanguageSetting(): Promise<string> {
    const browserLanguage = this.translateService.getBrowserLang();
    return new Promise((resolve, reject) => {
      this.storage.get(STORAGE_KEY_LANGUAGE).then(
        (language: string) => {
        console.log('stored language', language);
        if (language != null) {
          this.language = language;
          resolve(language);
        } else {
          console.error('language is null');
          reject(browserLanguage);
        }
      },
      (error: string) => {
        console.error('storage error', error)
        reject(browserLanguage);
      });
    });
  }

  /**
   * store language setting to storage
   * @param language 
   */
  storeLanguageSetting(language: string) {
    console.log('storing language', language);
    this.language = language;
    this.storage.set(STORAGE_KEY_LANGUAGE, language);
  }

  /**
   * clear language setting from storage
   */
  clearLanguageSetting() {
    this.storage.remove(STORAGE_KEY_LANGUAGE);
  }

  getProbeSettingIdentifier(probeNumber: number): string {
    return STORAGE_KEY_PROBE + probeNumber;
  }

  /**
   * store given probe data to storage
   * @param bleDevice 
   */
  storeProbeSetting(meatTypeTemperature: MeatTypeTemperature, probeNumber: number) {
    console.log('storing meat type temperature ', meatTypeTemperature, ' for probe ', probeNumber);
    this.storage.set(this.getProbeSettingIdentifier(probeNumber), meatTypeTemperature);
  }

  /**
   * clear stored probe data from storage
   */
  clearProbeSetting(probeNumber: number) {
    this.storage.remove(this.getProbeSettingIdentifier(probeNumber));
  }

  /**
   * read probe setting from chached value (to prevent rereading the database)
   */
  getProbeSettingFromCache(probeNumber: number): MeatTypeTemperature {
    if(typeof this.probeData[probeNumber] !== 'undefined') {
      return this.probeData[probeNumber];
    }
    return this.meatTemperatureService.getDefaultMeatTypeTemperature();
  }

  /**
   * load probe setting from storage
   */
  loadProbeSetting(probeNumber: number): Promise<MeatTypeTemperature> {
    return new Promise((resolve, reject) => {
      this.storage.get(this.getProbeSettingIdentifier(probeNumber)).then(
        (data: MeatTypeTemperature) => {
        console.log('stored probe data for probe ', probeNumber, ': ', data);
        if (data != null) {
          this.probeData[probeNumber] = data;
          resolve(data);
        } else {
          console.error('stored probe data is null, use default value');
          resolve(this.meatTemperatureService.getDefaultMeatTypeTemperature());
        }
      },
      (error: string) => {
        console.error('storage error', error)
        reject();
      });
    });
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
