import { Routes } from '@angular/router';
import { FooterPage } from './footer.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: FooterPage,
    children: [
      {
        path: 'Flugsuche',
        loadComponent: () =>
          import('../Startseite/startseite.page').then((m) => m.StartseitePage),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: '',
        redirectTo: '/footer/Startseite',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/footer/Startseite',
    pathMatch: 'full',
  },
];
