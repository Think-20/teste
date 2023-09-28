import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { MONTHS, Month } from 'app/shared/date/months';
import { HomeService } from './home.service';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { HomeData } from './models/home-data.model';
import { HomeInfo } from './models/home-info.model';

@Component({
  selector: 'cb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  searchForm: FormGroup;
  formCopy: any;
  dataInfo: HomeInfo;
  hasFilterActive = false
  searching = false
  filter = false
  params = {}
  homeData: HomeData;
  date: Date;
  month: Month;
  nextMonth: Month;
  year: number;
  years: number[] = []
  iniDate: Date;
  finDate: Date;
  months: Month[] = MONTHS
  nextMonthName: string = '';
  nextYear: number = 0;
  
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private homeService: HomeService
    ) { }

  ngOnInit() {
    this.createForm();
    this.setYears();
    this.loadInitialData();
  }

  createForm() {
    this.searchForm = this.fb.group({
      date_init: this.fb.control(''),
      date_end: this.fb.control(''),
    })

    this.formCopy = this.searchForm.value;

    if(JSON.stringify(this.homeService.searchValue) == JSON.stringify({})) {
      this.homeService.searchValue = this.searchForm.value;
    } else {
      this.searchForm.setValue(this.homeService.searchValue);
    }

    this.searchForm.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe((searchValue) => {
        this.params = this.getParams(searchValue);
        this.loadJobs(this.params);
        this.updateFilterActive();
        this.changeMonth();
      })
  }

  loadInitialData() {
    if (JSON.stringify(this.homeService.searchValue) === JSON.stringify(this.formCopy)) {
      this.params = this.getParams(this.homeService.searchValue);
      this.loadJobs({}, true);
    } else {
      this.params = this.getParams(this.homeService.searchValue);
      this.loadJobs(this.params, true);
    }

    this.updateFilterActive()
  }

  updateFilterActive() {
    if (JSON.stringify(this.homeService.searchValue) === JSON.stringify(this.formCopy)) {
      this.hasFilterActive = false;
    } else {
      this.hasFilterActive = true;
    }
  }

  addMonth(inc: number) {
    this.date.setDate(1);
    this.date.setMonth(this.date.getMonth() + inc);
    
    const nextMonthIndex = (this.date.getMonth() + 1) % 12;
    this.nextMonth = MONTHS.find(month => month.id == (nextMonthIndex + 1));
    this.nextYear = this.date.getFullYear() + (nextMonthIndex === 0 ? 1 : 0);
    
    this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1));
    this.year = this.date.getFullYear();

    this.changeMonth();
}

  changeMonth() {
    if(this.searching) return;
    let snackBar = this.snackBar.open('Carregando tarefas...');

    const daysInMonth = this.getDaysInMonth(this.year, this.nextMonth.id);
    this.iniDate = new Date(this.year + '-' + this.month.id + '-' + 1);
    this.finDate = new Date(this.nextYear + '-' + this.nextMonth.id + '-' + daysInMonth);

    this.iniDate.setDate(this.iniDate.getDate());
    this.finDate.setDate(this.finDate.getDate());

    this.homeService.searchValue = {
      ...this.homeService.searchValue,
      date_init:this.iniDate,
      date_end: this.finDate,
    }

    this.params = this.getParams(this.homeService.searchValue);
    this.loadJobs(this.params);
  }

  getParams(searchValue) {
    this.iniDate = this.homeService.searchValue.date_init ? this.homeService.searchValue.date_init : searchValue.date_init;
    this.finDate = this.homeService.searchValue.date_end ? this.homeService.searchValue.date_end : searchValue.date_end;

    this.homeService.searchValue = {
      ...searchValue,
      date_init:this.iniDate,
      date_end: this.finDate,
    }

    return {
      final_date: searchValue.final_date,
      date_end: this.finDate,
      date_init: this.iniDate,
    }
  }

  getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  updateMonth(month: Month) {
    this.month = month;
    this.changeMonth();
  }

  updateNextMonth(month: Month) {
    this.nextMonth = month;
    this.changeMonth();
  }

  updateYear(year: number) {
    this.year = year;
    this.changeMonth();
  }

  updateNextYear(year: number) {
    this.nextYear = year;
    this.changeMonth();
  }

  setYears() {
    let ini = 2018;
    let year = (new Date).getFullYear();

    while (ini <= (year + 1)) {
      this.years.push(ini);
      ini += 1;
    }
  }

  clearFilter() {
    this.homeService.searchValue = {};
    this.createForm();
    this.loadInitialData();
  }

  loadJobs(params, configureDates = false) {
    let hasDateFilter = false;
    const filter: any = this.homeService.searchValue;

    if (filter) {
      hasDateFilter = !!(filter.date_init || filter.date_end);
    }

    if (hasDateFilter) {
      this.setCurrentDateFilterByDate(filter.date_init, filter.date_end);
    }

    this.searching = true;
    let snackBar = this.snackBar.open('Carregando jobs...');
    this.homeService.home(params)
    .subscribe(dataInfo => {
      if (configureDates && !hasDateFilter) {
        this.setDataByParams();
      }
      
      this.homeData = (dataInfo as unknown as HomeData);
      this.searching = false;
      snackBar.dismiss();
    })
  }

  setDataByParams() {
    this.date = new Date();

    this.route.queryParams.subscribe(params => {
      if (params.date != undefined) {
        this.date = new Date(params.date + "T00:00:00");
        this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1));
        this.year = this.date.getFullYear();
      } else {

        this.date = new Date();
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth());
        this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1));
        this.nextMonth = MONTHS[nextDate.getMonth()];

        this.year = this.date.getFullYear();
        this.nextYear = nextDate.getFullYear();
      }

      this.changeMonth();
    })
  }

  setCurrentDateFilterByDate(dateInit: Date, dateEnd: Date) {
    this.month = MONTHS.find(month => month.id == (dateInit.getMonth() + 1));
    this.year = dateInit.getFullYear();

    this.nextMonth = MONTHS.find(month => month.id == (dateEnd.getMonth() + 1));
    this.nextYear = dateEnd.getFullYear();
  }
}
