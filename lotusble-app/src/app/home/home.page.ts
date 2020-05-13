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

  constructor(
    public navCtrl: NavController,
    private ngZone: NgZone,
    private utilService: UtilService,
    private targetService: TargetService
  ) {}
  
  ionViewDidEnter() { 
  }

  ionViewWillEnter() {
    this.utilService.backButton();

    this.devices = [];
    this.targetService.loadOrScan((bleDevice: BleDevice) => {
      this.targetService.connect(bleDevice, () => {
        console.log('connected callback firing');
        this.navCtrl.navigateRoot(['/thermometer']);
      });
    }, (bleDevice: BleDevice) => {
      console.log('callback result new device', bleDevice);
      this.ngZone.run(() => {
        this.devices.push(bleDevice);
      });
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

  // async scan() {
  //   let toast = await this.toastCtrl.create({
  //     message: 'Scanning for devices...',
  //     duration: 1000
  //   });
  //   toast.present();

  //   this.devices = [];

  //   // scan for devices containing our service uuid
  //   this.ble.scan([LOTUSBLE_SERVICE_UUID], 3).subscribe(
  //     device => this.onDeviceDiscovered(device), 
  //     error => this.scanError(error)
  //   );
    
  // }

  // onDeviceDiscovered(device: BleDevice) {
  //   console.log('Discovered device', device);
  //   this.ngZone.run(() => {
  //     this.devices.push(device);
  //   });
  // }

  // async scanError(error: string) {
  //   let toast = await this.toastCtrl.create({
  //     message: 'Error scanning for LotusBLE devices.',
  //     duration: 3000
  //   });
  //   toast.present();
  // }

  deviceSelected(bleDevice: BleDevice) {
    // console.log('selected', device);
    // let navigationExtras: NavigationExtras = {
    //   state: {
    //     device: device
    //   }
    // };
    //this.navCtrl.navigateRoot(['/thermometer'], navigationExtras);
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

}
