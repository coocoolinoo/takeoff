import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
  selectedArrival: any = null;
  departureDate: string = '';
  returnDate: string = '';
  passengers: number = 1;
  flights: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private aeroService: AerodataboxService
  ) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.selectedDeparture = navigation.extras.state['selectedDeparture'];
      this.departureDate = navigation.extras.state['departureDate'];
      this.selectedArrival = navigation.extras.state['selectedArrival'];
      this.returnDate = navigation.extras.state['returnDate'];
      this.passengers = navigation.extras.state['passengers'];

      if (this.selectedDeparture && this.departureDate) {
        this.loadFlights();
      }
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
