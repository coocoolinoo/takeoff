import { Component, AfterViewInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AerodataboxService } from '../aerodatabox.service';
import { lastValueFrom } from 'rxjs';
import {CountryinfoService} from "../countryinfo.service";
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

interface Flight {
  number: string;
  airline?: { name: string };
  departure: { scheduledTime: string; airport?: { iata: string } };
  arrival?: { airport?: { iata: string; name: string } };
}

interface Passenger {
  firstName: string;
  lastName: string;
  email: string;
  ticketNumber?: number;
}

interface CountryInfo {
  name: string;
  capital: string;
  region: string;
  population: number;
  travelRequirements: {
    visa: {
      type: string;
      duration: string;
    };
    vaccinations: string[];
    documents: string[];
  };
}

@Component({
  selector: 'app-flugsuche',
  templateUrl: './flugsuche.page.html',
  styleUrls: ['./flugsuche.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FlugsuchePage implements AfterViewInit {
  selectedDeparture: any = null;
  selectedArrival: any = null;
  departureDate: string = '';
  returnDate: string = '';
  passengers: number = 1;
  flights: Flight[] = [];
  returnFlights: Flight[] = [];
  isLoading = false;
  errorMessage = '';
  registeredPassengers: Passenger[] = [];
  countryInfo: CountryInfo | null = null;
  flightsCount: number = 0;
  debugApiResponse: any = null;

  constructor(
    private router: Router,
    private aeroService: AerodataboxService,
    private countryInfoService: CountryinfoService,
    private sanitizer: DomSanitizer
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.selectedDeparture = navigation.extras.state['selectedDeparture'];
      this.departureDate = navigation.extras.state['departureDate'];
      this.selectedArrival = navigation.extras.state['selectedArrival'];
      this.returnDate = navigation.extras.state['returnDate'];
      this.passengers = navigation.extras.state['passengers'];
      this.loadPassengers();
      this.loadFlights();
      this.loadCountryInfo();
    }
  }

  ngAfterViewInit() {
    // Leere Methode, da keine Karte mehr initialisiert werden muss
  }

  loadPassengers() {
    const passengersData = localStorage.getItem('passengers');
    if (passengersData) {
      this.registeredPassengers = JSON.parse(passengersData);
    }
  }

  async loadCountryInfo() {
    if (this.selectedArrival?.countryCode) {
      try {
        const countryInfo = await lastValueFrom(
          this.aeroService.getCountryInfo(this.selectedArrival.countryCode)
        );
        this.countryInfo = countryInfo;
      } catch (error) {
        console.error('Error loading country info:', error);
      }
    }
  }

  async loadFlights(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('API-Call Parameter:', {
        departure: this.selectedDeparture?.iata,
        arrival: this.selectedArrival?.iata,
        departureDate: this.departureDate,
        returnDate: this.returnDate
      });

      const departurePromise = lastValueFrom(
        this.aeroService.getFlightsBetweenAirports(
          this.selectedDeparture.iata,
          this.selectedArrival.iata,
          this.departureDate
        )
      );

      const returnPromise = this.returnDate
        ? lastValueFrom(
          this.aeroService.getFlightsBetweenAirports(
            this.selectedArrival.iata,
            this.selectedDeparture.iata,
            this.returnDate
          )
        )
        : Promise.resolve({ departures: [] });

      const [departures, returns] = await Promise.all([departurePromise, returnPromise]);

      this.debugApiResponse = departures; // Debug: Rohdaten speichern
      console.log('API-Response (Hinflüge):', departures);

      this.flights = departures?.departures || [];
      this.returnFlights = returns?.departures || [];
      this.flightsCount = this.flights.length;

      if (this.flights.length === 0) {
        this.errorMessage = 'Keine Flüge für die gewählte Route gefunden';
      }
    } catch (error) {
      console.error('Error loading flights:', error);
      this.errorMessage = 'Fehler bei der Verbindung zur Flugdatenbank';
    } finally {
      this.isLoading = false;
    }
  }

  getEntryStatusForPassenger(passenger: any): { allowed: boolean, reason: string } | null {
    if (!passenger.nationality || !this.selectedArrival?.countryCode) return null;
    return this.aeroService.canEnterCountry(passenger.nationality, this.selectedArrival.countryCode);
  }

  getMapUrl(): SafeResourceUrl {
    let bbox = '10.0,50.0,11.0,51.0'; // Default: Europa-Mitte
    
    if (this.selectedDeparture?.lat && this.selectedDeparture?.lng && 
        this.selectedArrival?.lat && this.selectedArrival?.lng) {
      // Berechne Bounding Box für beide Flughäfen
      const minLng = Math.min(this.selectedDeparture.lng, this.selectedArrival.lng);
      const maxLng = Math.max(this.selectedDeparture.lng, this.selectedArrival.lng);
      const minLat = Math.min(this.selectedDeparture.lat, this.selectedArrival.lat);
      const maxLat = Math.max(this.selectedDeparture.lat, this.selectedArrival.lat);
      
      // Füge etwas Padding hinzu
      const padding = 2;
      bbox = `${minLng - padding},${minLat - padding},${maxLng + padding},${maxLat + padding}`;
    }
    
    // Erstelle die Marker-Parameter für beide Flughäfen
    const departureMarker = this.selectedDeparture?.lat && this.selectedDeparture?.lng 
      ? `&marker=${this.selectedDeparture.lat},${this.selectedDeparture.lng}`
      : '';
    const arrivalMarker = this.selectedArrival?.lat && this.selectedArrival?.lng
      ? `&marker=${this.selectedArrival.lat},${this.selectedArrival.lng}`
      : '';
    
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${departureMarker}${arrivalMarker}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
