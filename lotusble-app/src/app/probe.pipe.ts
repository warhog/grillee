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
import { Pipe, PipeTransform } from '@angular/core';
import { UtilService } from './util.service';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'probe'
})
export class ProbePipe implements PipeTransform {

  constructor(private utilService: UtilService, private translateService: TranslateService) {}

  celsiusToFahrenheit(celsius: number): number {
    return celsius * 9 / 5 + 32;
  }

  transform(value: number): any {
    if (value == -100) {
      return this.translateService.instant('thermometer.probeNotConnectedText');
    } else if (value == -200) {
      return this.translateService.instant('thermometer.probeUnknownSensor');
    } else {
      if (this.utilService.getTemperatureAsFahrenheitSettingFromCache()) {
        return this.celsiusToFahrenheit(value).toFixed(0) + ' \xB0F';
      }
      return value.toFixed(0) + ' \xB0C';
    }
  }

}
