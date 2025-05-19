import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-flugdetails',
  templateUrl: './flugdetails.page.html',
  styleUrls: ['./flugdetails.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FlugdetailsPage {
  flight: any = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const state = history.state;
    this.flight = state.flight || null;
  }
}
