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

  constructor(
    public navCtrl: NavController,
    private ngZone: NgZone,
    private utilService: UtilService,
    private targetService: TargetService
  ) {}
  
  // TODO doc everywhere

  ionViewDidEnter() { 
  }

  ionViewWillEnter() {
    this.utilService.backButton();

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
}
