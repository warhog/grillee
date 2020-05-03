import { BLE } from '@ionic-native/ble/ngx';
import { Component, NgZone } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';
import { BleDevice } from '../models/bledevice';

const LOTUSBLE_SERVICE_UUID = '32b33b05-6ac4-4137-9ca7-6dc3dbac4e41';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  private _devices: BleDevice[] = [];
  private _statusMessage: string = "";

  constructor(public navCtrl: NavController, private toastCtrl: ToastController, private ble: BLE, private ngZone: NgZone) {}
  
  ionViewDidEnter() {
    this.scan();
  }

  async scan() {
    let toast = await this.toastCtrl.create({
      message: 'Scanning for devices...',
      duration: 1000
    });
    toast.present();

    this.devices = [];

    // scan for devices containing our service uuid
    this.ble.scan([LOTUSBLE_SERVICE_UUID], 3).subscribe(
      device => this.onDeviceDiscovered(device), 
      error => this.scanError(error)
    );
    
    // setTimeout(async () => {
    //   let toast = await this.toastCtrl.create({
    //     message: 'Scan completed.',
    //     duration: 1000
    //   });
    //   toast.present();
    // }, 3000);
  }

  onDeviceDiscovered(device: BleDevice) {
    console.log('Discovered device', device);
    this.ngZone.run(() => {
      this.devices.push(device);
    });
  }

  async scanError(error: string) {
    let toast = await this.toastCtrl.create({
      message: 'Error scanning for LotusBLE devices.',
      duration: 3000
    });
    toast.present();
  }

  deviceSelected(device: BleDevice) {
    console.log('selected', device);
    let navigationExtras: NavigationExtras = {
      state: {
        device: device
      }
    };
    this.navCtrl.navigateRoot(['/mainview'], navigationExtras);
  }

  public get devices(): BleDevice[] {
    return this._devices;
  }
  public set devices(value: BleDevice[]) {
    this._devices = value;
  }

}
