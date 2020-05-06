import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'probe'
})
export class ProbePipe implements PipeTransform {

  transform(value: any): any {
    if (value == -100) {
      return 'Not connected';
    } else if (value == -200) {
      return 'Unknown sensor';
    } else {
      return value + ' °C';
    }
  }

}
