import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThermometerPageRoutingModule } from './thermometer-routing.module';

import { ThermometerPage } from './thermometer.page';
import { SetpointPage } from '../setpoint/setpoint.page';
import { SetpointPageModule } from '../setpoint/setpoint.module';
import { ProbePipe } from '../probe.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThermometerPageRoutingModule,
    SetpointPageModule,
    TranslateModule.forChild(),
    SharedModule
  ],
  declarations: [ThermometerPage, ProbePipe],
  entryComponents: [SetpointPage]
})
export class ThermometerPageModule {}
