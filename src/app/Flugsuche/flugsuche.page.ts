import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AerodataboxService } from '../aerodatabox.service';
import { lastValueFrom } from 'rxjs';

interface Flight {
  number: string;
  airline?: { name: string };
  departure: { scheduledTime: string; airport?: { iata: string } };
  arrival?: { airport?: { iata: string; name: string } };
}

@Component({
  selector: 'app-flugsuche',
  templateUrl: './flugsuche.page.html',
  styleUrls: ['./flugsuche.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FlugsuchePage {
  selectedDeparture: any = null;
  selectedArrival: any = null;
  departureDate: string = '';
  returnDate: string = '';
  passengers: number = 1;
  flights: Flight[] = [];
  returnFlights: Flight[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private aeroService: AerodataboxService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.selectedDeparture = navigation.extras.state['selectedDeparture'];
      this.departureDate = navigation.extras.state['departureDate'];
      this.selectedArrival = navigation.extras.state['selectedArrival'];
      this.returnDate = navigation.extras.state['returnDate'];
      this.passengers = navigation.extras.state['passengers'];
      this.loadFlights();
    }
  }

  async loadFlights(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
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

      this.flights = departures?.departures || [];
      this.returnFlights = returns?.departures || [];

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
}
