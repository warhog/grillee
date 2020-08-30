import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SetpointPage } from './setpoint.page';

describe('SetpointPage', () => {
  let component: SetpointPage;
  let fixture: ComponentFixture<SetpointPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetpointPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SetpointPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
