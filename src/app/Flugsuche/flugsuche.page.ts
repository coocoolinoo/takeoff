import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AerodataboxService } from '../aerodatabox.service';
import { lastValueFrom } from 'rxjs';
import { CountryinfoService } from "../countryinfo.service";
import { PassengerService, Passenger } from '../passenger.service';

interface Airport {
  name: string;
  iata: string;
  countryCode: string;
}

@Component({
  selector: 'app-flugsuche',
  templateUrl: './flugsuche.page.html',
  styleUrls: ['./flugsuche.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class FlugsuchePage implements OnInit {
  departureQuery = '';
  arrivalQuery = '';
  departureDate = '';
  returnDate = '';
  passengers = 1;
  departureAirports: Airport[] = [];
  arrivalAirports: Airport[] = [];
  selectedDeparture: Airport | null = null;
  selectedArrival: Airport | null = null;
  isLoading = false;
  errorMessage = '';
  flights: any[] = [];
  returnFlights: any[] = [];
  loading: boolean = false;
  registeredPassengers: Passenger[] = [];
  countryInfo: any = null;
  flightsCount: number = 0;
  debugApiResponse: any = null;

  constructor(
    private router: Router,
    private aeroService: AerodataboxService,
    private countryInfoService: CountryinfoService,
    private passengerService: PassengerService
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

  ngOnInit() {
    this.registeredPassengers = this.passengerService.getPassengers();
    this.passengerService.passengers$.subscribe(passengers => {
      this.registeredPassengers = passengers;
      this.passengers = passengers.length;
    });
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
          this.selectedDeparture ? this.selectedDeparture.iata : '',
          this.selectedArrival ? this.selectedArrival.iata : '',
          this.departureDate
        )
      );

      const returnPromise = this.returnDate
        ? lastValueFrom(
          this.aeroService.getFlightsBetweenAirports(
            this.selectedArrival ? this.selectedArrival.iata : '',
            this.selectedDeparture ? this.selectedDeparture.iata : '',
            this.returnDate
          )
        )
        : Promise.resolve({ departures: [] });

      const [departures, returns] = await Promise.all([departurePromise, returnPromise]);

      this.debugApiResponse = departures;
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

  getCountryFlag(countryCode: string): string {
    if (!countryCode) return '';
    
    // Konvertiere den Ländercode in Unicode-Regionalindikator-Symbole
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  }

  searchDepartureAirports(term: string): void {
    if (term.length >= 2) {
      this.isLoading = true;
      this.aeroService.searchAirports(term).subscribe({
        next: (airports) => {
          this.departureAirports = airports.items || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Fehler bei der Flughafensuche:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.departureAirports = [];
    }
  }

  searchArrivalAirports(term: string): void {
    if (term.length >= 2) {
      this.isLoading = true;
      this.aeroService.searchAirports(term).subscribe({
        next: (airports) => {
          this.arrivalAirports = airports.items || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Fehler bei der Flughafensuche:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.arrivalAirports = [];
    }
  }

  selectDepartureAirport(airport: Airport): void {
    this.selectedDeparture = airport;
    this.departureQuery = airport.name;
    this.departureAirports = [];
  }

  selectArrivalAirport(airport: Airport): void {
    this.selectedArrival = airport;
    this.arrivalQuery = airport.name;
    this.arrivalAirports = [];
  }

  clearDeparture(): void {
    this.selectedDeparture = null;
    this.departureQuery = '';
  }

  clearArrival(): void {
    this.selectedArrival = null;
    this.arrivalQuery = '';
  }

  clearDepartureAirportsDelayed(): void {
    setTimeout(() => {
      this.departureAirports = [];
    }, 200);
  }

  clearArrivalAirportsDelayed(): void {
    setTimeout(() => {
      this.arrivalAirports = [];
    }, 200);
  }

  swapAirports(): void {
    const temp = this.selectedDeparture;
    this.selectedDeparture = this.selectedArrival;
    this.selectedArrival = temp;
    const tempQuery = this.departureQuery;
    this.departureQuery = this.arrivalQuery;
    this.arrivalQuery = tempQuery;
  }

  onDateChange(event: any, type: 'departure' | 'return'): void {
    if (type === 'departure') {
      this.departureDate = event.detail.value;
    } else {
      this.returnDate = event.detail.value;
    }
  }

  searchFlights() {
    if (!this.selectedDeparture || !this.selectedArrival) {
      this.errorMessage = 'Bitte wählen Sie Abflug- und Zielflughafen aus';
      return;
    }
    const departureIata = this.selectedDeparture ? this.selectedDeparture.iata : '';
    const arrivalIata = this.selectedArrival ? this.selectedArrival.iata : '';
    // ... wie gehabt ...
  }
}
