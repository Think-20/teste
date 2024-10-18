import { TimecardService } from './../../timecard.service';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCalendar } from '@angular/material';
import { AuthService } from 'app/login/auth.service';
import { IPlannerDay } from 'app/timecard/models/planner-day.model';
import { IPlannerHour } from 'app/timecard/models/planner-hour.model';
import { IPlannerLog } from 'app/timecard/models/planner-log.model';

@Component({
  selector: 'cb-timecard-planner',
  templateUrl: './timecard-planner.component.html',
  styleUrls: ['./timecard-planner.component.css']
})
export class TimecardPlannerComponent implements OnInit {
  @ViewChild('calendar', { static: false }) calendar: MatCalendar<any>;

  private year: number = null;

  private month: number = null;

  private employeeId: number = null;

  logs: IPlannerLog[] = [];

  days: IPlannerDay[] = [];

  daysFilter: number[] = [];

  currentMonth = false;

  categories = [
    "Prospecção",
    "Reunião clientes",
    "Prospecção de clientes",
    "Memorial descritivo",
    "Briefing Criação",
    "Processos Adm",
    "Trânsito",
    "Montagem",
    "VT",
    "Feira",
    "Almoço",
    "Intervalo",
    "Saída",
  ];

  allCategories = 'Todas';

  categoriesFilter = [this.allCategories, ...this.categories]

  categorySelected = this.allCategories;

  isDiretoria = false;

  hasDayWithSelectedCategories = false;

  selectedDay: number = null;

  date: Date;

  constructor(
    private datePipe: DatePipe,
    private authService: AuthService,
    private timecardService: TimecardService,
  ) { }

  ngOnInit() {
    const currentUser = this.authService.currentUser();

    this.isDiretoria = currentUser.employee.department_id === 1;

    if (!this.isDiretoria) {
      this.employeeId = currentUser.employee.id;
    }

    this.loadLogs();
  }

  private loadLogs = () => {
    this.timecardService.getLogs().subscribe({
      next: response => {
        this.logs = response;

        const year = this.year;

        const month = this.month;

        this.loadDays(year, month, this.employeeId);
      }
    });
  }

  loadDays = (year: number, month: number, emplyeeId: number) => {
    if (this.selectedDay && month !== this.month) {
      this.selectedDay = 1;
    }

    this.year = year ? year : new Date().getFullYear();

    this.month = month ? month : new Date().getMonth();

    const day = this.selectedDay || new Date().getDate();
    
    this.date = new Date(this.year, this.month, day);
    
    this.calendar.activeDate = this.date;

    if (this.isDiretoria) {
      this.employeeId = emplyeeId;
    }

    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();

    this.daysFilter = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const logs = this.getLogs();

    const days: IPlannerDay[] = [];

    for (const day of this.daysFilter) {
      const date = new Date(this.year, this.month, day);

      const dayObject: IPlannerDay = {
        date: this.datePipe.transform(date, 'yyyy-MM-dd'),
        time_logs: this.loadHours(day, logs),
      };

      dayObject.visible = this.dayIsVisible(dayObject);

      days.push(dayObject);
    }

    this.days = days;

    this.loadHasDayWithSelectedCategories();

    this.currentMonth = this.year === new Date().getFullYear() && this.month === new Date().getMonth();
  }

  private getLogs = () => {
    const formattedDate = this.datePipe.transform(new Date(this.year, this.month, 1), 'yyyy-MM');

    return this.logs.filter(log => {
      const formattedLogDate = this.datePipe.transform(log.date, 'yyyy-MM');

      if (this.employeeId !== log.employee_id) {
        return false;
      }

      return formattedDate === formattedLogDate;
    });
  }

  private loadHours = (day: number, logs: IPlannerLog[]): IPlannerHour[] => {
    const hours = Array.from({ length: 23 - 6 + 1 }, (_, i) => i + 6);

    return hours.map(hour => {
      const date = new Date(this.year, this.month, day, hour, 0, 0, 0);

      const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd HH:mm');

      const log = logs.find(log => {
        const formattedLogDate = this.datePipe.transform(log.date, 'yyyy-MM-dd HH:mm');

        if (this.employeeId !== log.employee_id) {
          return false;
        }

        return formattedDate === formattedLogDate;
      });

      return {
        date: this.datePipe.transform(new Date(this.year, this.month, day, hour, 0, 0, 0), 'yyyy-MM-dd HH:mm'),
        log: { ...log }
      } as IPlannerHour;
    });
  }

  selectDay(date: Date): void {
    this.selectedDay = date.getDate();

    this.date = new Date(this.year, this.month, this.selectedDay);

    this.scrollToDate(this.datePipe.transform(date, 'yyyy-MM-dd'));
  }

  scrollToDate(date: string): void {
    setTimeout(() => {
      document
        .getElementById(date)
        .scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  gotToCurrentDate = (): void => this.scrollToDate(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));

  setLog(log: IPlannerLog): void {
    const index = this.logs.findIndex(x => x.id === log.id);

    if (index >= 0) {
      this.logs[index] = log;
      
      return;
    }

    this.logs.push(log);
  }

  selectCategory = (category: string): void => {
    this.categorySelected = category;

    this.daysVisible();

    this.loadHasDayWithSelectedCategories();
  }

  private daysVisible = (): void => {
    this.days.map((day) => {
      day.visible = this.dayIsVisible(day);
    });
  }

  private dayIsVisible = (day: IPlannerDay): boolean => {
    if (this.categorySelected === this.allCategories) {
      return true;
    }

    return day.time_logs.some(tl => tl.log.category === this.categorySelected);
  }

  private loadHasDayWithSelectedCategories = () => {
    if (this.categorySelected === this.allCategories && this.days.length) {
      this.hasDayWithSelectedCategories = true;

      return;
    }

    this.hasDayWithSelectedCategories = this.days.some(day => day.time_logs.some(tl => {
      return tl.log.category === this.categorySelected;
    }));
  }

  trackByDays(index: number, day: IPlannerDay) {
    return day.date;
  }

  trackByTimeLogs(index: number, timeLog: IPlannerHour) {
    return timeLog.date;
  }

}
