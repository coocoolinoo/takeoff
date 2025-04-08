import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlugsuchePage } from './flugsuche.page';

describe('Tab3Page', () => {
  let component: FlugsuchePage;
  let fixture: ComponentFixture<FlugsuchePage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(FlugsuchePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
