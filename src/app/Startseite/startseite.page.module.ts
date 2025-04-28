import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StartseitePage } from './startseite.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StartseitePage
  ],
  declarations: [],  // Deklarieren der Seite im Modul
})
export class StartseitePageModule {}
