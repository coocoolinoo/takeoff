import { Routes } from '@angular/router';
import { StartseitePage } from './Startseite/startseite.page';

export const routes: Routes = [
  {
    path: 'startseite',
    component: StartseitePage,
  },
  {
    path: '',
    redirectTo: 'startseite',
    pathMatch: 'full'
  }
];
