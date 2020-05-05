import { Injectable } from '@angular/core';
import { NgLocaleLocalization } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class MeatTemperatureService {

  private meatTypes: Array<MeatType> = [
    { name: 'Beef', id: 'beef' },
    { name: 'Pork', id: 'pork' },
    { name: 'Chicken', id: 'chicken' },
    { name: 'Ground meat', id: 'groundmeat' },
    { name: 'Calf', id: 'calf' },
    { name: 'Custom', id: 'custom' }
  ];

  private meatTypesTemperatures: Array<MeatTypeTemperature> = [
    { meatTypeId: 'pork', name: 'Rare', temperature: 60 },
    { meatTypeId: 'pork', name: 'Done', temperature: 75 },
    { meatTypeId: 'beef', name: 'Rare', temperature: 50 },
    { meatTypeId: 'beef', name: 'Medium', temperature: 55 },
    { meatTypeId: 'beef', name: 'Done', temperature: 60 },
    { meatTypeId: 'beef', name: 'Well done', temperature: 70 },
    { meatTypeId: 'groundmeat', name: 'Well done', temperature: 85 },
    { meatTypeId: 'calf', name: 'Rare', temperature: 50 },
    { meatTypeId: 'calf', name: 'Medium', temperature: 55 },
    { meatTypeId: 'calf', name: 'Done', temperature: 60 },
    { meatTypeId: 'calf', name: 'Well done', temperature: 70 },
    { meatTypeId: 'chicken', name: 'Done', temperature: 75 },
    { meatTypeId: 'custom', name: 'Custom', temperature: 80 }
  ];

  constructor() { }

  getMeatTypes(): Array<MeatType> {
    return this.meatTypes;
  }

  getMeatTypeString(meatTypeTemperature: MeatTypeTemperature): string {
    let meatTypes: Array<MeatType> = this.meatTypes.filter((entry) => {
      return entry.id == meatTypeTemperature.meatTypeId;
    });
    if (meatTypes.length > 0) {
      if (meatTypeTemperature.name == 'custom') {
        return meatTypes[0].name;
      } else {
        return meatTypes[0].name + ' - ' + meatTypeTemperature.name;
      }
      
    }
    return '';
  }

  getMeatTypeById(meatTypeId: string): MeatType {
    let meatTypes: Array<MeatType> = this.meatTypes.filter((entry) => {
      return entry.id == meatTypeId;
    });
    if (meatTypes.length > 0) {
      return meatTypes[0];
    }
    return this.getDefaultMeatType();
  }

  getDefaultMeatType(): MeatType {
    let customMeatType: Array<MeatType> = this.meatTypes.filter((entry) => {
      return entry.id == 'custom';
    });
    return customMeatType[0];
  }

  getDefaultMeatTypeTemperature(): MeatTypeTemperature {
    let defaultMeatTypeId: string = this.getDefaultMeatType().id
    let maxTemp: MeatTemperature = this.getMaxTemperatureEntryForMeatType(defaultMeatTypeId);
    return {
      meatTypeId: defaultMeatTypeId,
      name: maxTemp.name,
      temperature: maxTemp.temperature
    };
  }

  getMaxTemperatureEntryForMeatType(meatTypeId: string): MeatTemperature {
    let selectedMeatTemps: Array<MeatTemperature> = this.getTemperaturesForMeatType(meatTypeId);
    let maxTemperature: MeatTemperature = { name: 'unknown', temperature: 0 };
    if (selectedMeatTemps.length > 0) {
      selectedMeatTemps.map((entry) => {
        if (entry.temperature > maxTemperature.temperature) {
          maxTemperature = { name: entry.name, temperature: entry.temperature };
        }
      });
    }
    return maxTemperature;
  }

  getTemperaturesForMeatType(meatTypeId: string): Array<MeatTemperature> {
    let selectedMeatTemps: Array<MeatTemperature> = [];
    this.meatTypesTemperatures.map((entry) => {
      if (entry.meatTypeId == meatTypeId) {
        selectedMeatTemps.push({ name: entry.name, temperature: entry.temperature });
      }
    });
    return selectedMeatTemps;
  }

}
