import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmFooterComponent } from '../alarm-footer/alarm-footer.component';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [ AlarmFooterComponent ],
  exports: [ AlarmFooterComponent ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule.forChild()
  ]
})
export class SharedModule { }
