import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface CountryInfo {
  name: string;
  capital: string;
  region: string;
  population: number;
  travelRequirements: {
    visa: {
      type: string;
      duration: string;
    };
    vaccinations: string[];
    documents: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class CountryinfoService {
  private apiUrl = 'https://restcountries.com/v3.1';

  constructor(private http: HttpClient) { }

  searchCountry(query: string): Observable<any[]> {
    if (!query) {
      return this.http.get<any[]>(`${this.apiUrl}/all`);
    }
    return this.http.get<any[]>(`${this.apiUrl}/name/${query}`);
  }

  getCountryInfo(countryCode: string): Observable<CountryInfo> {
    return this.http.get<any[]>(`${this.apiUrl}/alpha/${countryCode}`).pipe(
      map(response => {
        if (response && response.length > 0) {
          const country = response[0];
          return {
            name: country.name.common,
            capital: country.capital?.[0] || 'Unbekannt',
            region: country.region,
            population: country.population,
            travelRequirements: {
              visa: {
                type: this.getVisaRequirement(countryCode),
                duration: '90 Tage'
              },
              vaccinations: [
                'COVID-19 (empfohlen)',
                'Tetanus (empfohlen)'
              ],
              documents: [
                'Gültiger Reisepass oder Personalausweis'
              ]
            }
          };
        }
        return this.getDefaultCountryInfo();
      })
    );
  }

  private getVisaRequirement(countryCode: string): string {
    const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
    
    if (euCountries.includes(countryCode)) {
      return 'Kein Visum für EU-Bürger';
    }
    return 'Bitte informieren Sie sich bei der Botschaft';
  }

  private getDefaultCountryInfo(): CountryInfo {
    return {
      name: 'Unbekannt',
      capital: 'Unbekannt',
      region: 'Unbekannt',
      population: 0,
      travelRequirements: {
        visa: {
          type: 'Bitte informieren Sie sich bei der Botschaft',
          duration: 'Unbekannt'
        },
        vaccinations: ['Bitte informieren Sie sich bei der Botschaft'],
        documents: ['Gültiger Reisepass']
      }
    };
  }
}

