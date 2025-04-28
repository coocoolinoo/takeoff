import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { of, throwError } from 'rxjs';

import { StartseitePage } from './startseite.page';
import { AerodataboxService } from '../aerodatabox.service';

describe('StartseitePage', () => {
  let component: StartseitePage;
  let fixture: ComponentFixture<StartseitePage>;
  let aerodataboxService: jasmine.SpyObj<AerodataboxService>;

  beforeEach(waitForAsync(() => {
    const aerodataboxSpy = jasmine.createSpyObj('AerodataboxService', ['searchAirports']);

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

  it('should load departure airports', () => {
    const mockResponse = { items: [{ name: 'Vienna Airport', iata: 'VIE' }] };
    aerodataboxService.searchAirports.and.returnValue(of(mockResponse));

    component.searchDepartureAirports('Vienna');
    expect(aerodataboxService.searchAirports).toHaveBeenCalledWith('Vienna');
    expect(component.departureAirports.length).toBe(1);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle airport search error', () => {
    aerodataboxService.searchAirports.and.returnValue(throwError(() => new Error('API Error')));

    component.searchDepartureAirports('Invalid');
    expect(component.errorMessage).toBe('Error loading airports');
    expect(component.isLoading).toBeFalse();
  });

  it('should toggle trip type', () => {
    expect(component.showReturnDate).toBeFalse();
    component.tripType = 'roundtrip';
    component.toggleTripType();
    expect(component.showReturnDate).toBeTrue();
  });

  it('should select airports', () => {
    const mockAirport = { name: 'Test Airport', iata: 'TEST' };

    component.selectDepartureAirport(mockAirport);
    expect(component.selectedDeparture).toEqual(mockAirport);
    expect(component.departureAirports).toEqual([]);

    component.selectArrivalAirport(mockAirport);
    expect(component.selectedArrival).toEqual(mockAirport);
    expect(component.arrivalAirports).toEqual([]);
  });

  it('should swap airports', () => {
    component.selectedDeparture = { name: 'A', iata: 'A' };
    component.selectedArrival = { name: 'B', iata: 'B' };

    component.swapAirports();
    expect(component.selectedDeparture.iata).toBe('B');
    expect(component.selectedArrival.iata).toBe('A');
  });
});
