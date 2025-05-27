import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Passenger {
  firstName: string;
  lastName: string;
  email?: string;
  password?: string;
  nationality: string;
  passportNumber: string;
  ticketNumber?: string;
}

@Injectable({ providedIn: 'root' })
export class PassengerService {
  private readonly STORAGE_KEY = 'passengers';
  private passengersSubject = new BehaviorSubject<Passenger[]>(this.loadPassengers());
  passengers$ = this.passengersSubject.asObservable();

  getPassengers(): Passenger[] {
    return this.passengersSubject.value;
  }

  setPassengers(passengers: Passenger[]): void {
    this.passengersSubject.next(passengers);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(passengers));
  }

  addPassenger(passenger: Passenger): void {
    const updated = [...this.getPassengers(), passenger];
    this.setPassengers(updated);
  }

  removePassenger(index: number): void {
    const updated = this.getPassengers().filter((_, i) => i !== index);
    this.setPassengers(updated);
  }

  private loadPassengers(): Passenger[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
} 