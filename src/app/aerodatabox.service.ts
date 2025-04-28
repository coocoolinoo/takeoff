import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AerodataboxService {
  private readonly apiUrl = 'https://aerodatabox.p.rapidapi.com';
  private readonly headers = new HttpHeaders({
    'X-RapidAPI-Key': 'dd83395831msh3c5c21df7e6a51ep1c5847jsn2ec550d55641',
    'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
  });

  constructor(private http: HttpClient) {}

  searchAirports(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/airports/search/term`, {
      headers: this.headers,
      params: { q: query, limit: '10' }
    });
  }

  getFlightDates(airportIata: string, from: string, to: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/flights/airports/iata/${airportIata}/${from}/${to}`, {
      headers: this.headers,
      params: { withLeg: 'true', direction: 'Arrival' }
    });
  }
}
