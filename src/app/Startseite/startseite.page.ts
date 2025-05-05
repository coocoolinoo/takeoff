import { Component } from '@angular/core';
import { AerodataboxService } from '../aerodatabox.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterPage } from "../footer/footer.page";

@Component({
  selector: 'app-startseite',
  templateUrl: './startseite.page.html',
  styleUrls: ['./startseite.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FooterPage]
})
export class StartseitePage {
  departureQuery: string = '';
  arrivalQuery: string = '';
  departureDate: string = '';
  returnDate: string = '';
  passengers: number = 1;

  departureAirports: any[] = [];
  arrivalAirports: any[] = [];
  selectedDeparture: { name: string, iata: string } | null = null;
  selectedArrival: { name: string, iata: string } | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private airportService: AerodataboxService) {}

  searchDepartureAirports(term: string): void {
    if (term.trim().length > 1 && !this.selectedDeparture) {
      this.isLoading = true;
      this.airportService.searchAirports(term).subscribe({
        next: (airports) => {
          this.departureAirports = airports.items || [];
          this.isLoading = false;
          this.errorMessage = '';
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Fehler beim Laden der Flughäfen';
        }
      });
    } else {
      this.departureAirports = [];
      this.errorMessage = '';
    }
  }

  searchArrivalAirports(term: string): void {
    if (term.trim().length > 1 && !this.selectedArrival) {
      this.isLoading = true;
      this.airportService.searchAirports(term).subscribe({
        next: (airports) => {
          this.arrivalAirports = airports.items || [];
          this.isLoading = false;
          this.errorMessage = '';
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Fehler beim Laden der Flughäfen';
        }
      });
    } else {
      this.arrivalAirports = [];
      this.errorMessage = '';
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

  swapAirports(): void {
    const temp = this.selectedDeparture;
    this.selectedDeparture = this.selectedArrival;
    this.selectedArrival = temp;

    // Update search queries
    if (this.selectedDeparture) {
      this.departureQuery = `${this.selectedDeparture.name} (${this.selectedDeparture.iata})`;
    }
    if (this.selectedArrival) {
      this.arrivalQuery = `${this.selectedArrival.name} (${this.selectedArrival.iata})`;
    }
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

  // Passengers Methods
  increasePassengers(): void {
    this.passengers++;
  }

  decreasePassengers(): void {
    if (this.passengers > 1) {
      this.passengers--;
    }
  }

  // Date Methods
  setDepartureDate(event: any): void {
    this.departureDate = event.target.value;
  }

  setReturnDate(event: any): void {
    this.returnDate = event.target.value;
  }
}
