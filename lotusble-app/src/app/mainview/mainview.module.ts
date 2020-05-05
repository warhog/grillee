import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainviewPageRoutingModule } from './mainview-routing.module';

import { MainviewPage } from './mainview.page';
import { SetpointPage } from '../setpoint/setpoint.page';
import { SetpointPageModule } from '../setpoint/setpoint.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainviewPageRoutingModule,
    SetpointPageModule
  ],
  declarations: [MainviewPage],
  entryComponents: [SetpointPage]
})
export class MainviewPageModule {}
