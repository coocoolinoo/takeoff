import { Routes } from '@angular/router';
import { StartseitePage } from './Startseite/startseite.page';
import { FlugsuchePage } from './Flugsuche/flugsuche.page';
import { Tab2Page } from './tab2/tab2.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'startseite',
    pathMatch: 'full'
  },
  {
    path: 'startseite',
    component: StartseitePage
  },
  {
    path: 'flugsuche',
    component: FlugsuchePage
  },
  {
    path: 'profile',
    component: Tab2Page
  }
];
