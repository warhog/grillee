import { Injectable } from '@angular/core';
import { Alarm } from './models/alarm';

@Injectable({
  providedIn: 'root'
})
export class AlarmService {

  private alarms: Array<Alarm> = [];

  constructor() { }

  getAlarmTypeFromName(name: string): string {
    if (name.startsWith('alarm')) {
        return name.substring(5).toLowerCase();
    }
    return name;
  }

  hasAlarm(type: string): boolean {
    let alarms: Array<Alarm> = this.alarms.filter((entry) => {
      return entry.type == type;
    });
    return alarms.length > 0;
  }

  getAlarm(type: string): Alarm {
    if (this.hasAlarm(type)) {
      let alarms: Array<Alarm> = this.alarms.filter((entry) => {
        return entry.type == type;
      });
      if (alarms.length > 0) {
        return alarms[0];
      }
    }
    return null;
  }

  isAlarmAcked(type: string): boolean {
    if (this.hasAlarm(type)) {
      return this.getAlarm(type).acked;
    }
  }

  createAlarm(type: string, state: boolean = false, acked: boolean = false) {
    if (!this.hasAlarm(type)) {
      this.alarms.push({
        type: type,
        state: state,
        acked: acked,
        id: null
      });
    }
  }

}
