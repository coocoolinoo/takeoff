import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AerodataboxService } from '../aerodatabox.service';

@Component({
  selector: 'app-flugsuche',
  templateUrl: './flugsuche.page.html',
  styleUrls: ['./flugsuche.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FlugsuchePage {
  selectedDeparture: any = null;
  departureDate: string = '';
  flights: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private route: ActivatedRoute, private aeroService: AerodataboxService) {}

  ngOnInit(): void {
    const state = history.state;
    this.selectedDeparture = state.selectedDeparture || null;
    this.departureDate = state.departureDate || '';
    if (this.selectedDeparture && this.departureDate) {
      this.loadFlights();
    }
  }

  loadFlights(): void {
    this.isLoading = true;
    this.aeroService.getFlightsFromAirport(this.selectedDeparture.iata, this.departureDate).subscribe({
      next: (response: any) => {
        this.flights = response.departures || [];
        this.isLoading = false;
        this.errorMessage = '';
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Fehler beim Laden der Flüge';
      }
    });
  }
}
