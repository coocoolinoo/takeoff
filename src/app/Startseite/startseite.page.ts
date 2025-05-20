import { Component } from '@angular/core';
import { AerodataboxService } from '../aerodatabox.service';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterPage } from '../footer/footer.page';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-startseite',
  templateUrl: './startseite.page.html',
  styleUrls: ['./startseite.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FooterPage, RouterLink]
})
export class StartseitePage {
  departureQuery = '';
  arrivalQuery = '';
  departureDate: string = '';
  returnDate: string = '';
  passengers = 1;

  departureAirports: any[] = [];
  arrivalAirports: any[] = [];
  selectedDeparture: { name: string, iata: string } | null = null;
  selectedArrival: { name: string, iata: string } | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private airportService: AerodataboxService,
    private navCtrl: NavController,
    private router: Router
  ) {}

  searchDepartureAirports(term: string): void {
    if (term.trim().length > 1 && !this.selectedDeparture) {
      this.isLoading = true;
      this.airportService.searchAirports(term).subscribe({
        next: (airports) => {
          this.departureAirports = airports.items || [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Fehler beim Laden der Flughäfen';
        }
      });
    } else {
      this.departureAirports = [];
    }
  }

  searchArrivalAirports(term: string): void {
    if (term.trim().length > 1 && !this.selectedArrival) {
      this.isLoading = true;
      this.airportService.searchAirports(term).subscribe({
        next: (airports) => {
          this.arrivalAirports = airports.items || [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Fehler beim Laden der Flughäfen';
        }
      });
    } else {
      this.arrivalAirports = [];
    }
  }

  selectDepartureAirport(airport: any): void {
    this.selectedDeparture = airport;
    this.departureQuery = `${airport.name} (${airport.iata})`;
    this.departureAirports = [];
  }

  selectArrivalAirport(airport: any): void {
    this.selectedArrival = airport;
    this.arrivalQuery = `${airport.name} (${airport.iata})`;
    this.arrivalAirports = [];
  }

  navigateToFlightSearch(): void {
    if (!this.selectedDeparture || !this.departureDate) {
      this.errorMessage = 'Bitte geben Sie Abflughafen und Datum an';
      return;
    }

    this.router.navigate(['/footer/flugsuche'], {
      state: {
        selectedDeparture: this.selectedDeparture,
        departureDate: this.departureDate,
        selectedArrival: this.selectedArrival,
        returnDate: this.returnDate,
        passengers: this.passengers
      }
    });
  }

  swapAirports(): void {
    const temp = this.selectedDeparture;
    this.selectedDeparture = this.selectedArrival;
    this.selectedArrival = temp;

    const tempQuery = this.departureQuery;
    this.departureQuery = this.arrivalQuery;
    this.arrivalQuery = tempQuery;
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
      if (!this.selectedDeparture) {
        this.departureAirports = [];
      }
    }, 300);
  }

  clearArrivalAirportsDelayed(): void {
    setTimeout(() => {
      if (!this.selectedArrival) {
        this.arrivalAirports = [];
      }
    }, 300);
  }

  increasePassengers(): void {
    this.passengers++;
  }

  decreasePassengers(): void {
    if (this.passengers > 1) {
      this.passengers--;
    }
  }

  onDateChange(event: CustomEvent, type: 'departure' | 'return'): void {
    const value = event.detail.value as string;
    if (type === 'departure') {
      this.departureDate = value || '';
    } else {
      this.returnDate = value || '';
    }
  }
}
