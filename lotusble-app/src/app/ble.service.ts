import { BLE } from '@ionic-native/ble/ngx';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BleService {


  constructor(private ble: BLE) { }


  private _connection: Subscription = null;
  private _connectedId: string = null;

  connect(id: string, connectedCallback, disconnectedCallback) {
    this.connectedId = id;
    this.ble.autoConnect(id, connectedCallback, disconnectedCallback);
    // this.connection = this.ble.connect(id).subscribe(
    //   peripheral => connectedCallback(peripheral),
    //   peripheral => disconnectedCallback(peripheral)
    // );
  }

  notify(notifyCallback) {
    this.ble.startNotification(this.connectedId, '', '').subscribe(
      data => notifyCallback(data)
    )
  }

  disconnect() {
    if (this.connectedId != null) {
      this.ble.disconnect(this.connectedId);
      this.connectedId = null;
    }
    if (this.connection != null) {
      this.connection.unsubscribe();
      this.connection = null;
    }
  }

  public get connection(): Subscription {
    return this._connection;
  }
  public set connection(value: Subscription) {
    this._connection = value;
  }
  public get connectedId(): string {
    return this._connectedId;
  }
  public set connectedId(value: string) {
    this._connectedId = value;
  }
}
