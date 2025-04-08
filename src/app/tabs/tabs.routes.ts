import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'Startseite',
        loadComponent: () =>
          import('../Startseite/startseite.page').then((m) => m.StartseitePage),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'Flugsuche',
        loadComponent: () =>
          import('../Flugsuche/flugsuche.page').then((m) => m.FlugsuchePage),
      },
      {
        path: '',
        redirectTo: '/tabs/Startseite',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/Startseite',
    pathMatch: 'full',
  },
];
