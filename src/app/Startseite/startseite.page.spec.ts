import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartseitePage } from './startseite.page';

describe('Tab1Page', () => {
  let component: StartseitePage;
  let fixture: ComponentFixture<StartseitePage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(StartseitePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
