import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonToast,
    FormsModule,
    CommonModule
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

  constructor() {
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

    try {
      localStorage.setItem('currentUser', JSON.stringify(this.user));
      this.isRegistered = true;
      this.showError = false;
    } catch (e) {
      this.showError = true;
      console.error('Registration error:', e);
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.isRegistered = false;
    this.user = { firstName: '', lastName: '', email: '', password: '' };
  }
}
