import { TestBed } from '@angular/core/testing';

import { SensorTypeService } from './sensor-type.service';

describe('SensorTypeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SensorTypeService = TestBed.get(SensorTypeService);
    expect(service).toBeTruthy();
  });
});
