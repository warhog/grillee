import { TestBed } from '@angular/core/testing';

import { MeatTemperatureService } from './meat-temperature.service';

describe('MeatTemperatureService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MeatTemperatureService = TestBed.get(MeatTemperatureService);
    expect(service).toBeTruthy();
  });
});
