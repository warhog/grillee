import { Component, OnInit, Input, NgZone } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MeatTemperatureService } from '../meat-temperature.service';

@Component({
  selector: 'app-setpoint',
  templateUrl: './setpoint.page.html',
  styleUrls: ['./setpoint.page.scss'],
})
export class SetpointPage implements OnInit {

  @Input() meatTypeTemperature: MeatTypeTemperature;
 
  private _meatTemperatures: Array<MeatTemperature> = [];
  private _selectedTemperature: MeatTemperature = null;
  private _selectedMeatType: MeatType = null;
  private _meatTypes: Array<MeatType> = [];
  private _customTemperature: number = 80;

  constructor(
    private modalController: ModalController,
    private ngZone: NgZone,
    private meatTemperatureService: MeatTemperatureService
  ) {
    this.meatTypes = this.meatTemperatureService.getMeatTypes();
  }

  ngOnInit() {
    if (!this.meatTypeTemperature) {
      console.log('no data given for meatTemperature, use defaults');
      this.meatTypeTemperature = this.meatTemperatureService.getDefaultMeatTypeTemperature();
    }
    console.log('input meatTemperature', this.meatTypeTemperature);
    this.selectedMeatType = this.meatTemperatureService.getMeatTypeById(this.meatTypeTemperature.meatTypeId);
    this.selectedTemperature = this.meatTemperatureService.getMeatTypeTemperatureById(this.meatTypeTemperature.id);
    this.onChangeMeatType(this.selectedMeatType);
    console.log('selected meat start', this.selectedMeatType);
    console.log('selected temp start', this.selectedTemperature);
  }

  compareMeatTemperature(o1: MeatTemperature, o2: MeatTemperature): boolean {
    return o1.name === o2.name
  }

  compareMeatType(o1: MeatType, o2: MeatType): boolean {
    return o1.id === o2.id
  }

  isCustomMeatTypeSelected(): boolean {
    return this.selectedMeatType.id == 'custom';
  }

  onChangeMeatType(selection: MeatType) {
    console.log('selected meat type', selection);
    this.meatTemperatures = [];
    let selectedMeatTemps: Array<MeatTemperature> = this.meatTemperatureService.getTemperaturesForMeatType(selection.id);
    if (selectedMeatTemps.length > 0) {
      console.log('selectedMeatTemps', selectedMeatTemps);
      this.ngZone.run(() => {
        selectedMeatTemps.map((entry) => {
          this.meatTemperatures.push({ id: entry.id, name: entry.name, temperature: entry.temperature });
        });
        console.log('meatTemperatures', this.meatTemperatures);
        console.log('current selectedtemperature:', this.selectedTemperature);
        this.selectedTemperature = this.meatTemperatureService.getMaxTemperatureEntryForMeatType(selection.id);
        console.log('selectedTemperature', this.selectedTemperature);
        this.customTemperature = this.selectedTemperature.temperature;
      });
    } else {
      console.info('no predefined temperature found for selection ', selection);
    }
  }
  
  onChangeMeatTypeTemperature(selection: MeatTypeTemperature) {
    this.customTemperature = this.selectedTemperature.temperature;
  }

  dismissModal() {
    let meatTypeTemperature: MeatTypeTemperature = {
      id: this.selectedTemperature.id,
      meatTypeId: this.selectedMeatType.id,
      name: this.selectedTemperature.name,
      temperature: this.selectedTemperature.temperature
    };
    if (this.isCustomMeatTypeSelected()) {
      meatTypeTemperature.temperature = this.customTemperature;
    }

    this.modalController.dismiss({
      'meatTypeTemperature': meatTypeTemperature,
    });
  }

  public get customTemperature(): number {
    return this._customTemperature;
  }
  public set customTemperature(value: number) {
    this._customTemperature = value;
  }
  public get meatTemperatures(): Array<MeatTemperature> {
    return this._meatTemperatures;
  }
  public set meatTemperatures(value: Array<MeatTemperature>) {
    this._meatTemperatures = value;
  }
  public get selectedTemperature(): MeatTemperature {
    return this._selectedTemperature;
  }
  public set selectedTemperature(value: MeatTemperature) {
    this._selectedTemperature = value;
  }
  public get selectedMeatType(): MeatType {
    return this._selectedMeatType;
  }
  public set selectedMeatType(value: MeatType) {
    this._selectedMeatType = value;
  }
  public get meatTypes(): Array<MeatType> {
    return this._meatTypes;
  }
  public set meatTypes(value: Array<MeatType>) {
    this._meatTypes = value;
  }
}
