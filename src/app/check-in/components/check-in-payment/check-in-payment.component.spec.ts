import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInPaymentComponent } from './check-in-payment.component';

describe('CheckInPaymentComponent', () => {
  let component: CheckInPaymentComponent;
  let fixture: ComponentFixture<CheckInPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckInPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckInPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
