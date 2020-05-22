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
