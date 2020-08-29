import { Injectable } from '@angular/core';
import { NgLocaleLocalization } from '@angular/common';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

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
    { meatTypeId: 'pork', name: 'Rare', temperature: 60, id: 'porkRare' },
    { meatTypeId: 'pork', name: 'Done', temperature: 75, id: 'porkDone' },
    { meatTypeId: 'beef', name: 'Rare', temperature: 50, id: 'beefRare' },
    { meatTypeId: 'beef', name: 'Medium', temperature: 55, id: 'beefMedium' },
    { meatTypeId: 'beef', name: 'Done', temperature: 60, id: 'beefDone' },
    { meatTypeId: 'beef', name: 'Well done', temperature: 70, id: 'beefWellDone' },
    { meatTypeId: 'groundmeat', name: 'Well done', temperature: 85, id: 'groundMeatWellDone' },
    { meatTypeId: 'calf', name: 'Rare', temperature: 50, id: 'calfRare' },
    { meatTypeId: 'calf', name: 'Medium', temperature: 55, id: 'calfMedium' },
    { meatTypeId: 'calf', name: 'Done', temperature: 60, id: 'calfDone' },
    { meatTypeId: 'calf', name: 'Well done', temperature: 70, id: 'calfWellDone' },
    { meatTypeId: 'chicken', name: 'Done', temperature: 75, id: 'chickenDone' },
    { meatTypeId: 'custom', name: 'Custom', temperature: 80, id: 'customCustom' }
  ];

  constructor(private translateService: TranslateService) {
    this.translateService.onLangChange.subscribe((params: LangChangeEvent) => {
      console.log('language changed to ', params);
      this.prepopulateMeatData();
    });
  }

  prepopulateMeatData() {
    this.meatTypes.map((entry: MeatType) => {
      this.translateService.get('meatTypes.' + entry.id).subscribe((res: string) => {
        entry.name = res;
      });
    });

    this.meatTypesTemperatures.map((entry: MeatTypeTemperature) => {
      this.translateService.get('meatTemperatures.' + entry.id).subscribe((res: string) => {
        entry.name = res;
      });
    });
  }

  getMeatTypes(): Array<MeatType> {
    return this.meatTypes;
  }

  getMeatTypeString(meatTypeTemperature: MeatTypeTemperature): string {
    let meatTypes: Array<MeatType> = this.meatTypes.filter((entry) => {
      return entry.id == meatTypeTemperature.meatTypeId;
    });
    if (meatTypes.length > 0) {
      if (meatTypeTemperature.meatTypeId == 'custom') {
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

  getMeatTypeTemperatureById(meatTypeTemperatureId: string): MeatTypeTemperature {
    let meatTypeTemperatures: Array<MeatTypeTemperature> = this.meatTypesTemperatures.filter((entry) => {
      return entry.id == meatTypeTemperatureId;
    });
    if (meatTypeTemperatures.length > 0) {
      return meatTypeTemperatures[0];
    }
    return this.getDefaultMeatTypeTemperature();
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
      id: defaultMeatTypeId,
      meatTypeId: defaultMeatTypeId,
      name: maxTemp.name,
      temperature: maxTemp.temperature
    };
  }

  getMaxTemperatureEntryForMeatType(meatTypeId: string): MeatTemperature {
    let selectedMeatTemps: Array<MeatTemperature> = this.getTemperaturesForMeatType(meatTypeId);
    let maxTemperature: MeatTemperature = { id: 'custom', name: 'unknown', temperature: 0 };
    if (selectedMeatTemps.length > 0) {
      selectedMeatTemps.map((entry) => {
        if (entry.temperature > maxTemperature.temperature) {
          maxTemperature = { id: entry.id, name: entry.name, temperature: entry.temperature };
        }
      });
    }
    return maxTemperature;
  }

  getTemperaturesForMeatType(meatTypeId: string): Array<MeatTemperature> {
    let selectedMeatTemps: Array<MeatTemperature> = [];
    this.meatTypesTemperatures.map((entry) => {
      if (entry.meatTypeId == meatTypeId) {
        selectedMeatTemps.push({id: entry.id, name: entry.name, temperature: entry.temperature });
      }
    });
    return selectedMeatTemps;
  }

}
