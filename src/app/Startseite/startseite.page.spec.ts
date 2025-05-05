import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { StartseitePage } from './startseite.page';
import { AerodataboxService } from '../aerodatabox.service';

describe('StartseitePage', () => {
  let component: StartseitePage;
  let fixture: ComponentFixture<StartseitePage>;
  let aerodataboxService: jasmine.SpyObj<AerodataboxService>;

  beforeEach(waitForAsync(() => {
    const aerodataboxSpy = jasmine.createSpyObj('AerodataboxService', ['searchAirports', 'getFlightDates']);

    TestBed.configureTestingModule({
      declarations: [StartseitePage],
      imports: [
        HttpClientTestingModule,
        FormsModule,
        IonicModule.forRoot()
      ],
      providers: [
        { provide: AerodataboxService, useValue: aerodataboxSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StartseitePage);
    component = fixture.componentInstance;
    aerodataboxService = TestBed.inject(AerodataboxService) as jasmine.SpyObj<AerodataboxService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
