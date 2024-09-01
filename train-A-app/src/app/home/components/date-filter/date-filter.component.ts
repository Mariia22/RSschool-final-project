import { Component } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SearchService } from 'app/home/services/search.service';
import { TripFacade } from 'app/home/_state/search.facade';
import { CarriageFacade } from 'app/admin-overview/_state/carriage/carriage.facade';

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, AsyncPipe],
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss'],
})
export class DateFilterComponent {
  dates: Date[] = [];

  availableDates: Date[] = [];

  selectedDateIndex: number = 0;

  startDateIndex: number = 0;

  showFilter$ = this.searchService.filterIsActive$;

  constructor(
    private searchService: SearchService,
    private tripFacade: TripFacade,
    private carriageFacade: CarriageFacade,
  ) {
    this.searchService.filterIsActive$.subscribe(() => {
      this.selectedDateIndex = 0;
      this.startDateIndex = 0;
    });
    this.tripFacade.availableDates$.subscribe((dates) => {
      const availableDates: number[] = [];
      dates.forEach((date) => {
        availableDates.push(new Date(date).setHours(0, 0, 0, 0));
      });
      this.availableDates = [...new Set(availableDates.sort())].map((d) => new Date(d));
      this.dates = this.availableDates.slice(0, 4);
      if (this.availableDates.length > 0) {
        this.carriageFacade.loadCarriage();
      }
      if (dates.length > 0) this.selectDate(0);
    });
  }

  selectDate(index: number): void {
    this.selectedDateIndex = index;
    const params = this.searchService.getSearchParams();
    this.searchService.setSearchParams({ ...params, time: this.dates[index].toISOString() });
  }

  previousDate(): void {
    if (this.startDateIndex > 0) {
      this.startDateIndex -= 1;
    }
    console.log(this.startDateIndex);
    const endDateIndex =
      this.startDateIndex + 4 < this.availableDates.length
        ? this.startDateIndex + 4
        : this.availableDates.length;
    this.dates = this.availableDates.slice(this.startDateIndex, endDateIndex);
  }

  nextDate(): void {
    if (this.startDateIndex + 4 < this.availableDates.length) {
      this.startDateIndex += 1;
    }
    console.log(this.startDateIndex);
    const endDateIndex =
      this.startDateIndex + 4 < this.availableDates.length
        ? this.startDateIndex + 4
        : this.availableDates.length;
    this.dates = this.availableDates.slice(this.startDateIndex, endDateIndex);
  }
}
