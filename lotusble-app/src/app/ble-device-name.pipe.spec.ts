import { BleDeviceNamePipe } from './ble-device-name.pipe';

describe('BleDeviceNamePipe', () => {
  it('create an instance', () => {
    const pipe = new BleDeviceNamePipe();
    expect(pipe).toBeTruthy();
  });
});
