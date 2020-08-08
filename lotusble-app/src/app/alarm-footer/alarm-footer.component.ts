import { Component, OnInit } from '@angular/core';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { AlarmService } from '../alarm.service';

@Component({
  selector: 'app-alarm-footer',
  templateUrl: './alarm-footer.component.html',
  styleUrls: ['./alarm-footer.component.scss'],
})
export class AlarmFooterComponent implements OnInit {

  private alarmBlink: boolean = false;

  constructor(private alarmService: AlarmService) {
    IntervalObservable.create(500).subscribe(() => {
      this.alarmBlink = !this.alarmBlink;
    });
  }

  ngOnInit() {
  }

  /**
   * tests if any alarm is existing, hides alarm footer in the view
   */
  hasAlarmFooter(): boolean {
    return this.alarmService.hasAlarm();
  }

  /**
   * get the color name for the alarm footer in the view
   */
  getAlarmFooterColor(): string {
    return this.alarmBlink ? "danger" : "warning";
  }


}
