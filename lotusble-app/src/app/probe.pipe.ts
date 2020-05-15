import { Pipe, PipeTransform } from '@angular/core';
import { UtilService } from './util.service';

@Pipe({
  name: 'probe'
})
export class ProbePipe implements PipeTransform {

  constructor(private utilService: UtilService) {}

  celsiusToFahrenheit(celsius: number): number {
    return celsius * 9 / 5 + 32;
  }

  transform(value: number): any {
    if (value == -100) {
      return 'Not connected';
    } else if (value == -200) {
      return 'Unknown sensor';
    } else {
      if (this.utilService.getTemperatureAsFahrenheit()) {
        return this.celsiusToFahrenheit(value).toFixed(0) + ' \xB0F';
      }
      return value.toFixed(0) + ' \xB0C';
    }
  }

}
