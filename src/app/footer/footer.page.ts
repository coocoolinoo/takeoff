import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, search, person } from 'ionicons/icons'; // More intuitive icons

@Component({
  selector: 'app-footer',
  templateUrl: 'footer.page.html',
  styleUrls: ['footer.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class FooterPage {
  constructor() {
    addIcons({ home, search, person }); // Updated icons
  }
}
