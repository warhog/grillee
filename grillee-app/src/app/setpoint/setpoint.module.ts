import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetpointPageRoutingModule } from './setpoint-routing.module';

import { SetpointPage } from './setpoint.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetpointPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [SetpointPage]
})
export class SetpointPageModule {}
