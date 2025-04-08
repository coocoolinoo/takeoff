import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./footer/footer.routes').then((m) => m.routes),
  },
];
