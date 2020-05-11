import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThermometerPage } from './thermometer.page';

describe('ThermometerPage', () => {
  let component: ThermometerPage;
  let fixture: ComponentFixture<ThermometerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThermometerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThermometerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
