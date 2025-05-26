import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AerodataboxService {
  private readonly apiUrl = 'https://aerodatabox.p.rapidapi.com';
  private readonly searchUrl = `${this.apiUrl}/airports/search/term`;

  constructor(private http: HttpClient) {}

  searchAirports(term: string): Observable<any> {
    if (!term || term.length < 3) return of([]);

    const params = {
      q: term,
      limit: '5',
      withFlightInfoOnly: 'true'
    };

    return this.http.get(this.searchUrl, {
      headers: {
        'X-RapidAPI-Key': 'dd83395831msh3c5c21df7e6a51ep1c5847jsn2ec550d55641',
        'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
      },
      params
    }).pipe(
      catchError(() => of({ items: [] })))
  }

  getFlightsBetweenAirports(fromIata: string, toIata: string, date: string): Observable<any> {
    const formattedDate = date.split('T')[0];
    const url = `${this.apiUrl}/flights/airports/iata/${fromIata}/${toIata}/${formattedDate}`;

    return this.http.get(url, {
      headers: {
        'X-RapidAPI-Key': 'dd83395831msh3c5c21df7e6a51ep1c5847jsn2ec550d55641',
        'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
      },
      params: {
        withLeg: 'true',
        direction: 'Departure',
        withCancelled: 'false',
        withCodeshared: 'true',
        withCargo: 'false'
      }
    }).pipe(
      catchError(error => {
        console.error('API Error:', error);
        return of({ departures: [] });
      })
    );
  }
}
