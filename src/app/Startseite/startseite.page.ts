import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AerodataboxService } from '../aerodatabox.service';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterPage } from '../footer/footer.page';
import { PassengerService, Passenger } from '../passenger.service';

interface Airport {
  name: string;
  iata: string;
  countryCode: string;
}

@Component({
  selector: 'app-startseite',
  templateUrl: './startseite.page.html',
  styleUrls: ['./startseite.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FooterPage]
})
export class StartseitePage implements OnInit {
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
  loading: boolean = false;
  registeredPassengers: Passenger[] = [];

  constructor(
    private aerodataboxService: AerodataboxService,
    private navCtrl: NavController,
    private router: Router,
    private passengerService: PassengerService
  ) {}

  ngOnInit() {
    // Lade die gespeicherte Passagieranzahl aus dem localStorage
    const savedPassengers = localStorage.getItem('passengers');
    if (savedPassengers) {
      this.passengers = parseInt(savedPassengers, 10);
    }
    this.registeredPassengers = this.passengerService.getPassengers();
    this.passengerService.passengers$.subscribe(passengers => {
      this.registeredPassengers = passengers;
      this.passengers = passengers.length;
    });
  }

  searchDepartureAirports(term: string): void {
    if (term.length >= 2) {
      this.isLoading = true;
      this.aerodataboxService.searchAirports(term).subscribe({
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
      this.aerodataboxService.searchAirports(term).subscribe({
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

  increasePassengers(): void {
    if (this.passengers < 9) {
      this.passengers++;
      this.savePassengers();
    }
  }

  decreasePassengers(): void {
    if (this.passengers > 1) {
      this.passengers--;
      this.savePassengers();
    }
  }

  private savePassengers(): void {
    localStorage.setItem('passengers', this.passengers.toString());
  }

  clearSearch(): void {
    this.departureQuery = '';
    this.arrivalQuery = '';
    this.departureDate = '';
    this.returnDate = '';
    this.selectedDeparture = null;
    this.selectedArrival = null;
    this.errorMessage = '';
  }

  navigateToFlightSearch(): void {
    if (!this.selectedDeparture || !this.selectedArrival) {
      this.errorMessage = 'Bitte wählen Sie Abflug- und Zielflughafen aus';
      return;
    }

    if (!this.departureDate) {
      this.errorMessage = 'Bitte wählen Sie ein Abflugdatum aus';
      return;
    }

    this.router.navigate(['/footer/flugsuche'], {
      state: {
        departure: this.selectedDeparture,
        arrival: this.selectedArrival,
        departureDate: this.departureDate,
        returnDate: this.returnDate,
        passengers: this.passengers
      }
    });
  }

  searchFlights() {
    if (!this.validateSearch()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.flights = [];

    if (!this.selectedDeparture || !this.selectedArrival) {
      this.errorMessage = 'Bitte wählen Sie Abflug- und Zielflughafen aus';
      this.loading = false;
      return;
    }

    this.aerodataboxService.getFlightsBetweenAirports(
      this.selectedDeparture.iata,
      this.selectedArrival.iata,
      this.departureDate
    ).subscribe({
      next: (result) => {
        this.flights = (result.departures || []).map((flight: any) => ({
          airline: flight.airline?.name || '-',
          flightNumber: flight.number || '-',
          departureAirport: flight.departure?.airport?.iata || '-',
          arrivalAirport: flight.arrival?.airport?.iata || '-',
          departureTime: flight.departure?.scheduledTimeLocal?.substring(11, 16) || '-',
          arrivalTime: flight.arrival?.scheduledTimeLocal?.substring(11, 16) || '-',
          duration: flight.duration || '-',
          aircraft: flight.aircraft?.model || '-',
          date: this.departureDate,
          price: Math.floor(Math.random() * 200) + 100 // Dummy-Preis
        }));
        if (this.flights.length === 0) {
          this.errorMessage = 'Keine Flüge gefunden.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Fehler bei der Flugsuche.';
        this.loading = false;
      }
    });
  }

  validateSearch(): boolean {
    if (!this.departureQuery) {
      this.errorMessage = 'Bitte geben Sie einen Abflughafen ein';
      return false;
    }
    if (!this.arrivalQuery) {
      this.errorMessage = 'Bitte geben Sie einen Zielflughafen ein';
      return false;
    }
    if (!this.departureDate) {
      this.errorMessage = 'Bitte wählen Sie ein Abflugdatum aus';
      return false;
    }
    if (this.passengers < 1 || this.passengers > 9) {
      this.errorMessage = 'Bitte wählen Sie eine gültige Anzahl an Passagieren (1-9)';
      return false;
    }
    return true;
  }

  selectFlight(flight: any) {
    // Hier würde die Logik für die Flugauswahl implementiert werden
    console.log('Ausgewählter Flug:', flight);
    this.router.navigate(['/footer/flugsuche'], {
      state: {
        flight,
        passengers: this.passengers
      }
    });
  }
}
