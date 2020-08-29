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
import { Component, NgZone } from '@angular/core';
import { NavController } from '@ionic/angular';
import { BleDevice } from '../models/bledevice';
import { UtilService } from '../util.service';
import { TargetService } from '../target.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  private _devices: BleDevice[] = [];
  private _hasLoaded: boolean = false;
  private _bleNotAvailable: boolean = true;
  
  constructor(
    public navCtrl: NavController,
    private ngZone: NgZone,
    private utilService: UtilService,
    private targetService: TargetService
  ) {}
  
  ionViewWillEnter() {
    this.utilService.backButton();

    this.targetService.isBleAvailable().then(() => {
      console.log('ble available');
      this.bleNotAvailable = false;
      this.devices = [];
      this.targetService.loadOrScan((bleDevice: BleDevice) => {
        // load callback
        this.hasLoaded = true;
        this.targetService.connect(bleDevice, () => {
          console.log('connected callback firing');
          this.navCtrl.navigateRoot(['/thermometer']);
        });
      }, (bleDevice: BleDevice) => {
        // scan callback
        console.log('callback result new device', bleDevice);
        this.ngZone.run(() => {
          this.devices.push(bleDevice);
        });
      });
    }, (msg) => {
      // ble not available
      console.error('ble not available: ', msg);
    });
  }

  scan() {
    this.targetService.scan((bleDevice: BleDevice) => {
      console.log('callback result new device', bleDevice);
      this.ngZone.run(() => {
        this.devices.push(bleDevice);
      });
    });
  }

  deviceSelected(bleDevice: BleDevice) {
    this.targetService.connect(bleDevice, () => {
      console.log('connected callback firing');
      this.navCtrl.navigateRoot(['/thermometer']);
    });
  }

  public get devices(): BleDevice[] {
    return this._devices;
  }
  public set devices(value: BleDevice[]) {
    this._devices = value;
  }
  public get hasLoaded(): boolean {
    return this._hasLoaded;
  }
  public set hasLoaded(value: boolean) {
    this._hasLoaded = value;
  }
  public get bleNotAvailable(): boolean {
    return this._bleNotAvailable;
  }
  public set bleNotAvailable(value: boolean) {
    this._bleNotAvailable = value;
  }
}
