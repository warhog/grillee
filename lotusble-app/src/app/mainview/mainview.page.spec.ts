import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MainviewPage } from './mainview.page';

describe('MainviewPage', () => {
  let component: MainviewPage;
  let fixture: ComponentFixture<MainviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainviewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MainviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
