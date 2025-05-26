import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent,
  IonCardHeader, IonCardSubtitle, IonCardTitle, IonItem, IonLabel,
  IonInput, IonButton, IonToast, IonIcon, IonButtons, IonBackButton,
  IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  airplane, personCircleOutline, peopleCircleOutline, mailOpenOutline,
  lockClosedOutline, rocketOutline, exitOutline, searchOutline,
  homeOutline, chevronBackOutline, addOutline, removeOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { CountryinfoService } from '../countryinfo.service';

interface Passenger {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  nationality?: string;
  passportNumber?: string;
  ticketNumber?: number;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent,
    IonCardHeader, IonCardSubtitle, IonCardTitle, IonItem, IonLabel,
    IonInput, IonButton, IonIcon, IonButtons, IonBackButton,
    FormsModule, CommonModule,
    IonSelect, IonSelectOption
  ]
})
export class Tab2Page {
  passengers: Passenger[] = [{
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    nationality: '',
    passportNumber: ''
  }];

  isRegistered = false;
  showError = false;
  confetti = Array(50).fill(0);
  randomTicket = Math.floor(Math.random() * 900000);
  countries: { name: string; code: string }[] = [];

  constructor(
    private router: Router,
    private countryInfoService: CountryinfoService
  ) {
    addIcons({
      airplane, personCircleOutline, peopleCircleOutline, mailOpenOutline,
      lockClosedOutline, rocketOutline, exitOutline, searchOutline,
      homeOutline, chevronBackOutline, addOutline, removeOutline
    });
    this.checkRegistration();
    this.loadCountries();
  }

  checkRegistration() {
    const passengersData = localStorage.getItem('passengers');
    if (passengersData) {
      this.passengers = JSON.parse(passengersData);
      this.isRegistered = true;
    }
  }

  addPassenger() {
    this.passengers.push({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      nationality: '',
      passportNumber: ''
    });
  }

  removePassenger(index: number) {
    if (this.passengers.length > 1) {
      this.passengers.splice(index, 1);
    }
  }

  registerUser() {
    // Validate all passengers
    const invalidPassenger = this.passengers.find(p => 
      !p.firstName || !p.lastName || !p.email || !p.password
    );

    if (invalidPassenger) {
      this.showError = true;
      return;
    }

    // Generate ticket numbers for all passengers
    this.passengers = this.passengers.map(p => ({
      ...p,
      ticketNumber: Math.floor(Math.random() * 900000) + 100000
    }));

    localStorage.setItem('passengers', JSON.stringify(this.passengers));
    this.isRegistered = true;
  }

  logout() {
    localStorage.removeItem('passengers');
    this.isRegistered = false;
    this.passengers = [{
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      nationality: '',
      passportNumber: ''
    }];
  }

  navigateToStartseite() {
    this.router.navigate(['/footer/startseite'], { replaceUrl: true });
  }

  loadCountries() {
    this.countryInfoService.searchCountry('').subscribe((countries: any[]) => {
      this.countries = countries.map(country => ({
        name: country.name.common,
        code: country.cca2
      })).sort((a, b) => a.name.localeCompare(b.name));
    });
  }
}
