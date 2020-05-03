import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bleDeviceName'
})
export class BleDeviceNamePipe implements PipeTransform {

  transform(value: any): any {
    return value.name;
  }

}
