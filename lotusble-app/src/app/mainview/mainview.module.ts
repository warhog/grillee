import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainviewPageRoutingModule } from './mainview-routing.module';

import { MainviewPage } from './mainview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainviewPageRoutingModule
  ],
  declarations: [MainviewPage]
})
export class MainviewPageModule {}
