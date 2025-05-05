import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AerodataboxService {
  private readonly searchUrl = 'https://aerodatabox.p.rapidapi.com/airports/search/term';

  constructor(private http: HttpClient) {}

  searchAirports(query: string): Observable<any> {
    if (!query || query.length < 3) return of([]);

    const params = new HttpParams()
      .set('q', query)
      .set('limit', '5')
      .set('withFlightInfoOnly', 'true');

    return this.http.get(this.searchUrl, {
      headers: {
        'X-RapidAPI-Key': 'dd83395831msh3c5c21df7e6a51ep1c5847jsn2ec550d55641',
        'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
      },
      params
    }).pipe(
      catchError(() => of([]))
    );
  }

  getFlightsFromAirport(iataCode: string, date: string): Observable<any> {
    const url = `https://aerodatabox.p.rapidapi.com/flights/airports/icao/${iataCode}/${date}T00:00/${date}T23:59`;

    return this.http.get(url, {
      headers: {
        'X-RapidAPI-Key': 'dd83395831msh3c5c21df7e6a51ep1c5847jsn2ec550d55641',
        'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
      }
    }).pipe(
      catchError(() => of({ departures: [] }))
    );
  }
}
