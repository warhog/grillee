import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainviewPageRoutingModule } from './mainview-routing.module';

import { MainviewPage } from './mainview.page';
import { SetpointPage } from '../setpoint/setpoint.page';
import { SetpointPageModule } from '../setpoint/setpoint.module';
import { ProbePipe } from '../probe.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainviewPageRoutingModule,
    SetpointPageModule
  ],
  declarations: [MainviewPage, ProbePipe],
  entryComponents: [SetpointPage]
})
export class MainviewPageModule {}
