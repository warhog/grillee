import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainviewPage } from './mainview.page';

const routes: Routes = [
  {
    path: '',
    component: MainviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainviewPageRoutingModule {}
