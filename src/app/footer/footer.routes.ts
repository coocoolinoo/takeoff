import { Routes } from '@angular/router';
import { FooterPage } from './footer.page';

export const routes: Routes = [
  {
    path: 'footer',
    component: FooterPage,
    children: [
      {
        path: 'profile',
        loadComponent: () =>
          import('../tab2/tab2.page').then(m => m.Tab2Page)
      },
      {
        path: '',
        redirectTo: 'startseite',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'footer/startseite',
    pathMatch: 'full'
  }
];
