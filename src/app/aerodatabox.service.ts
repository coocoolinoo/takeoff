import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface VisaRequirement {
  type: string;
  duration: string;
}

interface CountryRequirements {
  [key: string]: VisaRequirement;
}

interface VaccinationRequirements {
  [key: string]: string[];
}

interface DocumentRequirements {
  [key: string]: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AerodataboxService {
  private readonly apiUrl = 'https://aerodatabox.p.rapidapi.com';
  private readonly searchUrl = `${this.apiUrl}/airports/search/term`;
  private readonly countryInfoUrl = 'https://restcountries.com/v3.1/alpha';
  private readonly allCountriesUrl = 'https://restcountries.com/v3.1/all';

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

  getCountryInfo(countryCode: string): Observable<any> {
    return this.http.get(`${this.countryInfoUrl}/${countryCode}`).pipe(
      map(response => {
        const countryData = Array.isArray(response) ? response[0] : response;
        return {
          name: countryData.name.common,
          capital: countryData.capital?.[0] || 'Unknown',
          region: countryData.region,
          population: countryData.population,
          travelRequirements: {
            visa: this.getVisaRequirements(countryCode),
            vaccinations: this.getVaccinationRequirements(countryCode),
            documents: this.getRequiredDocuments(countryCode)
          }
        };
      }),
      catchError(error => {
        console.error('Country Info API Error:', error);
        return of(null);
      })
    );
  }

  getAllCountries(): Observable<any[]> {
    return this.http.get<any[]>(this.allCountriesUrl).pipe(
      map(countries => countries.map(country => ({
        name: country.name.common,
        code: country.cca2
      })).sort((a, b) => a.name.localeCompare(b.name))),
      catchError(error => {
        console.error('Error fetching countries:', error);
        return of([]);
      })
    );
  }

  private getVisaRequirements(countryCode: string): VisaRequirement {
    const visaRequirements: CountryRequirements = {
      'US': { type: 'ESTA', duration: '90 days' },
      'GB': { type: 'No visa required', duration: '90 days' },
      'DE': { type: 'No visa required', duration: '90 days' },
      // Add more countries as needed
    };
    return visaRequirements[countryCode] || { type: 'Check with embassy', duration: 'Unknown' };
  }

  private getVaccinationRequirements(countryCode: string): string[] {
    const vaccinationRequirements: VaccinationRequirements = {
      'US': ['COVID-19', 'Yellow Fever'],
      'GB': ['COVID-19'],
      'DE': ['COVID-19'],
      // Add more countries as needed
    };
    return vaccinationRequirements[countryCode] || ['COVID-19'];
  }

  private getRequiredDocuments(countryCode: string): string[] {
    const documentRequirements: DocumentRequirements = {
      'US': ['Valid Passport', 'ESTA Application', 'Return Ticket'],
      'GB': ['Valid Passport', 'Return Ticket'],
      'DE': ['Valid Passport', 'Return Ticket'],
      // Add more countries as needed
    };
    return documentRequirements[countryCode] || ['Valid Passport', 'Return Ticket'];
  }

  /**
   * Mock-Logik: Prüft, ob ein Passagier mit gegebener Nationalität ins Zielland einreisen darf.
   * Rückgabe: { allowed: boolean, reason: string }
   */
  canEnterCountry(passengerNationality: string, destinationCountryCode: string): { allowed: boolean, reason: string } {
    // Beispiel-Logik: DE, US, GB dürfen jeweils in die anderen Länder visafrei einreisen
    const visaFreeMatrix: { [key: string]: string[] } = {
      'DE': ['US', 'GB', 'DE'],
      'US': ['DE', 'GB', 'US'],
      'GB': ['DE', 'US', 'GB']
    };
    if (visaFreeMatrix[passengerNationality] && visaFreeMatrix[passengerNationality].includes(destinationCountryCode)) {
      return { allowed: true, reason: 'Visumfrei' };
    }
    if (passengerNationality === destinationCountryCode) {
      return { allowed: true, reason: 'Heimatland' };
    }
    return { allowed: false, reason: 'Visum oder Einreise nicht erlaubt (Mock)' };
  }
}
