import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetpointPage } from './setpoint.page';

const routes: Routes = [
  {
    path: '',
    component: SetpointPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetpointPageRoutingModule {}
