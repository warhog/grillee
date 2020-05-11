import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThermometerPage } from './thermometer.page';

const routes: Routes = [
  {
    path: '',
    component: ThermometerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThermometerPageRoutingModule {}
