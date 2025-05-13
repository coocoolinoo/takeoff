import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent,
  IonCardHeader, IonCardSubtitle, IonCardTitle, IonItem, IonLabel,
  IonInput, IonButton, IonToast, IonIcon, IonButtons, IonBackButton
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  airplane, personCircleOutline, peopleCircleOutline, mailOpenOutline,
  lockClosedOutline, rocketOutline, exitOutline, searchOutline,
  homeOutline, chevronBackOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent,
    IonCardHeader, IonCardSubtitle, IonCardTitle, IonItem, IonLabel,
    IonInput, IonButton, IonIcon, IonButtons, IonBackButton,
    FormsModule, CommonModule
  ]
})
export class Tab2Page {
  user = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  isRegistered = false;
  showError = false;
  confetti = Array(50).fill(0);
  randomTicket = Math.floor(Math.random() * 900000);

  constructor(private router: Router) {
    addIcons({
      airplane, personCircleOutline, peopleCircleOutline, mailOpenOutline,
      lockClosedOutline, rocketOutline, exitOutline, searchOutline,
      homeOutline, chevronBackOutline
    });
    this.checkRegistration();
  }

  checkRegistration() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.user = JSON.parse(userData);
      this.isRegistered = true;
    }
  }

  registerUser() {
    if (!this.user.firstName || !this.user.lastName || !this.user.email || !this.user.password) {
      this.showError = true;
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(this.user));
    this.isRegistered = true;
    this.randomTicket = Math.floor(Math.random() * 900000);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.isRegistered = false;
    this.user = { firstName: '', lastName: '', email: '', password: '' };
  }

  navigateToStartseite() {
    this.router.navigate(['/footer/startseite'], { replaceUrl: true });
  }
}
