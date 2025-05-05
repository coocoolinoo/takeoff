import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AerodataboxService {
  private readonly apiUrl = 'https://aerodatabox.p.rapidapi.com/airports/search/term';

  constructor(private http: HttpClient) {} // HttpClient injizieren

  searchAirports(query: string): Observable<any> {
    if (!query || query.length < 3) return of([]);

    const params = new HttpParams()
      .set('q', query)
      .set('limit', '5')
      .set('withFlightInfoOnly', 'true');

    return this.http.get(this.apiUrl, {
      headers: {
        'X-RapidAPI-Key': 'dd83395831msh3c5c21df7e6a51ep1c5847jsn2ec550d55641',
        'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
      },
      params
    }).pipe(
      catchError(() => of([]))
    );
  }
}
