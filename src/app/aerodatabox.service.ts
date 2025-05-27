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
  private apiKey = 'aero_8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c';
  
  // EU-Länder
  private euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
  
  // Schengen-Länder (inkl. Nicht-EU)
  private schengenCountries = [...this.euCountries, 'IS', 'LI', 'NO', 'CH'];
  
  // Länder mit speziellen Visa-Anforderungen
  private visaRequiredCountries: { [key: string]: VisaRequirement } = {
    'US': { type: 'ESTA oder Visum', duration: '90 Tage' },
    'CA': { type: 'eTA oder Visum', duration: '6 Monate' },
    'AU': { type: 'ETA oder Visum', duration: '3 Monate' },
    'NZ': { type: 'NZeTA oder Visum', duration: '3 Monate' },
    'JP': { type: 'Visum', duration: '90 Tage' },
    'KR': { type: 'K-ETA oder Visum', duration: '90 Tage' },
    'CN': { type: 'Visum', duration: '30 Tage' },
    'IN': { type: 'e-Visum', duration: '60 Tage' },
    'RU': { type: 'Visum', duration: '30 Tage' },
    'BR': { type: 'e-Visum', duration: '90 Tage' }
  };

  // Länder mit speziellen Einreisebeschränkungen
  private restrictedCountries = ['KP', 'IR', 'SY', 'CU', 'VE'];

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
    // Aerodatabox erwartet Zeitfenster im Format YYYY-MM-DDTHH:mm
    const from = `${date}T00:00`;
    const to = `${date}T23:59`;
    const url = `${this.apiUrl}/flights/airport/iata/${fromIata}/${from}/${to}`;
    return this.http.get(url, {
      headers: {
        'X-RapidAPI-Key': 'dd83395831msh3c5c21df7e6a51ep1c5847jsn2ec550d55641',
        'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
      }
    }).pipe(
      map((response: any) => ({
        departures: (response.departures || []).filter(
          (flight: any) => flight.arrival?.airport?.iata === toIata
        )
      })),
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

  canEnterCountry(nationality: string, destinationCountry: string): { allowed: boolean; reason: string } {
    // Prüfe auf Heimatland
    if (nationality === destinationCountry) {
      return {
        allowed: true,
        reason: 'Einreise erlaubt (Heimatland)'
      };
    }

    // Prüfe auf Einreisebeschränkungen
    if (this.restrictedCountries.includes(destinationCountry)) {
      return {
        allowed: false,
        reason: 'Einreise derzeit nicht möglich (Reisebeschränkungen)'
      };
    }

    // EU-Bürger in EU-Ländern
    if (this.euCountries.includes(destinationCountry) && this.euCountries.includes(nationality)) {
      return {
        allowed: true,
        reason: 'Einreise erlaubt (EU-Bürger)'
      };
    }

    // Schengen-Bürger in Schengen-Ländern
    if (this.schengenCountries.includes(destinationCountry) && this.schengenCountries.includes(nationality)) {
      return {
        allowed: true,
        reason: 'Einreise erlaubt (Schengen-Raum)'
      };
    }

    // Spezielle Visa-Anforderungen
    if (this.visaRequiredCountries[destinationCountry]) {
      const visaInfo = this.visaRequiredCountries[destinationCountry];
      return {
        allowed: true,
        reason: `${visaInfo.type} erforderlich (${visaInfo.duration})`
      };
    }

    // Standardfall für andere Länder
    return {
      allowed: true,
      reason: 'Einreise erlaubt (Standard)'
    };
  }

  private getVisaRequirements(countryCode: string): VisaRequirement {
    if (this.euCountries.includes(countryCode)) {
      return { type: 'Kein Visum für EU-Bürger', duration: 'Unbegrenzt' };
    }
    if (this.visaRequiredCountries[countryCode]) {
      return this.visaRequiredCountries[countryCode];
    }
    return { type: 'Bitte informieren Sie sich bei der Botschaft', duration: 'Unbekannt' };
  }

  private getVaccinationRequirements(countryCode: string): string[] {
    const baseVaccinations = ['COVID-19 (empfohlen)', 'Tetanus (empfohlen)'];
    
    // Spezielle Impfanforderungen für bestimmte Regionen
    if (['BR', 'CO', 'PE', 'EC', 'BO'].includes(countryCode)) {
      return [...baseVaccinations, 'Gelbfieber (empfohlen)'];
    }
    if (['NG', 'GH', 'KE', 'TZ', 'UG'].includes(countryCode)) {
      return [...baseVaccinations, 'Gelbfieber (erforderlich)', 'Malaria-Prophylaxe (empfohlen)'];
    }
    if (['IN', 'NP', 'BD', 'LK'].includes(countryCode)) {
      return [...baseVaccinations, 'Hepatitis A (empfohlen)', 'Typhus (empfohlen)'];
    }

    return baseVaccinations;
  }

  private getRequiredDocuments(countryCode: string): string[] {
    const baseDocuments = ['Gültiger Reisepass'];
    
    if (this.euCountries.includes(countryCode)) {
      return ['Gültiger Reisepass oder Personalausweis'];
    }
    if (this.visaRequiredCountries[countryCode]) {
      return [...baseDocuments, 'Rückflugticket', 'Unterkunftsnachweis'];
    }
    if (this.schengenCountries.includes(countryCode)) {
      return [...baseDocuments, 'Rückflugticket', 'Reisekrankenversicherung'];
    }

    return [...baseDocuments, 'Rückflugticket'];
  }
}
