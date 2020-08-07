import { Injectable } from '@angular/core';
import { Alarm } from './models/alarm';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Subscription } from 'rxjs';
import { TargetService } from './target.service';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { AudioService } from './audio.service';
import { AlarmState } from './alarm-state';
import { TranslateService } from '@ngx-translate/core';

const LOTUSBLE_ALARMBIT_FAN = 0;
const LOTUSBLE_ALARMBIT_BATTERY = 1;
const LOTUSBLE_ALARMBIT_PROBE1 = 2;
const LOTUSBLE_ALARMBIT_PROBE2 = 3;

const ALARM_ID_FAN = 1;
const ALARM_ID_BATTERY = 2;
const ALARM_ID_PROBE1 = 3;
const ALARM_ID_PROBE2 = 4;
const ALARM_ID_LOST_CONNECTION = 5;

const MIN_FAN_RPM = 300;

@Injectable({
  providedIn: 'root'
})
export class AlarmService {

  private alarms: Array<Alarm> = [];
  private subscriptions: Array<Subscription> = [];
  private alarmState: AlarmState = new AlarmState();

  constructor(private localNotifications: LocalNotifications,
    private targetService: TargetService,
    private audioService: AudioService,
    private translateService: TranslateService) {

    this.subscriptions.push(IntervalObservable.create(10 * 1000).subscribe(() => {
      if (this.targetService.isConnected() && !this.targetService.isConnectionLost() && this.hasAlarm()) {
        this.audioService.play('alarm');
      }
    }));

    let sub: Subscription = IntervalObservable.create(1 * 1000).subscribe(() => {
      if (this.targetService.isConnected()) {
        console.log('alarmService: target connected now');
        this.subscriptions.push(this.targetService.getSubscriptionForAlarm().subscribe((alarm: number) => {
          console.log('alarm incoming: ', alarm);
          this.handleIncomingAlarm(alarm);
        }));
        sub.unsubscribe();
      }
    });

    // handle disconnect alarm
    this.subscriptions.push(IntervalObservable.create(10 * 1000).subscribe(() => {
      if (this.targetService.isConnected() && this.targetService.isConnectionLost()) {
        this.audioService.play('beep');
        this.translateService.get('alarm.lostConnectionText').subscribe((res: string) => {
          this.createAlarm(ALARM_ID_LOST_CONNECTION, res);
        });
      }
    }));

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

  /**
   * handles incoming alarm message
   */
  handleIncomingAlarm(alarm: number) {
    console.log('handle incoming alarm message: ', alarm);
    if (this.alarmState.hasChangedTo(LOTUSBLE_ALARMBIT_FAN, alarm, true)) {
      console.log('rpm alarm');
      this.translateService.get('alarm.minRpmText', {minFanRpm: MIN_FAN_RPM}).subscribe((res: string) => {
        this.createAlarm(ALARM_ID_FAN,  res, (alarmId: number) => {
          this.targetService.setAlarmAck();
        });
      });
    } else if (this.alarmState.hasChangedTo(LOTUSBLE_ALARMBIT_BATTERY, alarm, true)) {
      console.log('battery alarm');
      this.translateService.get('alarm.lowBatteryText').subscribe((res: string) => {
          this.createAlarm(ALARM_ID_BATTERY, res, (alarmId: number) => {
          this.targetService.setAlarmAck();
        });
      });
    } else if (this.alarmState.hasChangedTo(LOTUSBLE_ALARMBIT_PROBE1, alarm, true)) {
      console.log('probe setpoint alarm 1');
      this.translateService.get('alarm.probeReachedSetpoint', {probeNr: 1}).subscribe((res: string) => {
        this.createAlarm(ALARM_ID_PROBE1, res, (alarmId: number) => {
          this.targetService.setAlarmAck();
        });
      });
    } else if (this.alarmState.hasChangedTo(LOTUSBLE_ALARMBIT_PROBE2, alarm, true)) {
      console.log('probe setpoint alarm 2');
      this.translateService.get('alarm.probeReachedSetpoint', {probeNr: 2}).subscribe((res: string) => {
        this.createAlarm(ALARM_ID_PROBE2, res, (alarmId: number) => {
          this.targetService.setAlarmAck();
        });
      });
    }
    this.alarmState.fromUint8(alarm);
    this.alarmState.resetModified();
  }

}
