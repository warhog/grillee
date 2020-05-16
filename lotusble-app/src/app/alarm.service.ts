import { Injectable } from '@angular/core';
import { Alarm } from './models/alarm';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Subscription } from 'rxjs';
import { TargetService } from './target.service';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { AudioService } from './audio.service';

@Injectable({
  providedIn: 'root'
})
export class AlarmService {

  private alarms: Array<Alarm> = [];
  private alarmSoundSubscription: Subscription = null;

  constructor(private localNotifications: LocalNotifications,
    private targetService: TargetService,
    private audioService: AudioService) {
    this.alarmSoundSubscription = IntervalObservable.create(10 * 1000).subscribe(() => {
      if (this.targetService.isConnected() && !this.targetService.isConnectionLost() && this.hasAlarm()) {
        this.audioService.play('alarm');
      }
    });
  }

  /**
   * test if alarm with given id is present, if id is null tests if any alarm is present
   * @param id alarm id or null
   * @returns true if alarm with given id is present or when id is null returns true if any alarm is present
   */
  hasAlarm(id: number = null): boolean {
    let alarms = this.alarms;
    if (id != null) {
      alarms = this.alarms.filter((entry) => {
        return entry.id == id;
      });
    }
    console.log('hasAlarm', id, alarms);
    return alarms.length > 0;
  }

  /**
   * get alarm with given id
   * @param id 
   */
  getAlarm(id: number): Alarm {
    if (this.hasAlarm(id)) {
      let alarms: Array<Alarm> = this.alarms.filter((entry) => {
        return entry.id == id;
      });
      if (alarms.length > 0) {
        return alarms[0];
      }
    }
    return null;
  }

  /**
   * ack the given alarm
   * @param id alarm id to ack
   */
  ackAlarm(id: number) {
    if (this.hasAlarm(id)) {
      console.log('ackAlarm', id);
      let alarm: Alarm = this.getAlarm(id);
      alarm.callbackAck && alarm.callbackAck(alarm.id);
      this.alarms = this.alarms.filter((entry: Alarm) => {
        return entry.id != id;
      });
      console.log('acked', this.alarms);
    }
  }

  /**
   * create an alarm
   * @param id the alarm id, has to be unique
   * @param text the alarm text to display
   * @param callbackAck the callback to call on ack
   */
  createAlarm(id: number, text: string, callbackAck: Function = null) {
    if (!this.hasAlarm(id)) {
      this.alarms.push({
        id: id,
        callbackAck: callbackAck,
        text: text
      });
      this.createLocalAlarmNotification(id, text);
    }
  }

  /**
   * create a local alarm notification
   * @param id alarm id
   * @param text alarm text
   */
  createLocalAlarmNotification(id: number, text: string) {
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
      this.ackAlarm(alarmDetails.id);
    });
  }

}
