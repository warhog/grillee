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
