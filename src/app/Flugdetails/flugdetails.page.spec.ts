import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlugdetailsPage } from './flugdetails.page';

describe('Tab3Page', () => {
  let component: FlugdetailsPage;
  let fixture: ComponentFixture<FlugdetailsPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(FlugdetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
