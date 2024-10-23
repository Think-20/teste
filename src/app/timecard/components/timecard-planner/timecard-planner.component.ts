import { TimecardService } from './../../timecard.service';
import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatCalendar, MatSnackBar } from '@angular/material';
import { AuthService } from 'app/login/auth.service';
import { IPlannerDay } from 'app/timecard/models/planner-day.model';
import { IPlannerHour } from 'app/timecard/models/planner-hour.model';
import { IPlannerLog } from 'app/timecard/models/planner-log.model';

@Component({
  selector: 'cb-timecard-planner',
  templateUrl: './timecard-planner.component.html',
  styleUrls: ['./timecard-planner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimecardPlannerComponent implements AfterViewInit {
  @ViewChild('calendar', { static: false }) calendar: MatCalendar<any>;

  private year: number = null;

  private month: number = null;

  private employeeId: number = null;

  logs: IPlannerLog[] = [];

  logsMap: Map<string, IPlannerLog> = new Map<string, IPlannerLog>();

  days: IPlannerDay[] = [];

  daysFilter: number[] = [];

  hours = Array.from({ length: 23 - 6 + 1 }, (_, i) => i + 6);

  currentMonth = true;

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

  date = new Date();

  constructor(
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private timecardService: TimecardService,
  ) { }

  ngAfterViewInit() {
    const currentUser = this.authService.currentUser();

    this.isDiretoria = currentUser.employee.department_id === 1;

    if (!this.isDiretoria) {
      this.employeeId = currentUser.employee.id;
    }

    this.loadLogs(new Date().getFullYear(), new Date().getMonth(), this.employeeId, true);
  }

  loadLogs = (year: number, month: number, employeeId: number, init = false) => {
    let snackBarStateCharging = this.snackBar.open('Carregando...');

    if (this.isDiretoria) {
      this.employeeId = employeeId;
    }

    this.year = year || new Date().getFullYear();

    this.month = month || new Date().getMonth();

    if (!this.employeeId) {
      this.loadDays();

      if (init) {
        this.scrollToCurrentDate();
      }

      snackBarStateCharging.dismiss();

      return;
    }

    this.timecardService.getLogs(year, month + 1, this.employeeId).subscribe({
      next: response => {
        this.logs = response;

        this.loadDays();

        if (this.currentMonth && init) {
          this.scrollToCurrentDate();
        }

        snackBarStateCharging.dismiss();
      },
      error: () => {
        this.logs = [];

        this.loadDays();

        snackBarStateCharging.dismiss();
      }
    });
  }

  private scrollToCurrentDate(): void {
    setTimeout(() => {
      const container = document.querySelector('.tc-planner-days');

      const element = document.getElementById(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));

      const containerRect = container.getBoundingClientRect();

      const elementRect = element.getBoundingClientRect();

      const offsetTop = elementRect.top - containerRect.top + container.scrollTop;

      const scrollPosition = offsetTop - (container.clientHeight / 2) + (element.clientHeight / 2);

      container.scrollTo({ top: scrollPosition, behavior: 'auto' });
    });
  }

  private loadDays = () => {
    this.year = this.year || new Date().getFullYear();

    this.month = this.month || new Date().getMonth();

    const day = this.selectedDay || new Date().getDate();
    
    this.date = new Date(this.year, this.month, day);
    
    this.calendar.activeDate = this.date;

    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();

    this.daysFilter = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    this.loadLogsMap();

    const days: IPlannerDay[] = [];

    this.daysFilter.forEach(day => {
      const date = new Date(this.year, this.month, day);
  
      const dayObject: IPlannerDay = {
        date: this.datePipe.transform(date, 'yyyy-MM-dd'),
        time_logs: this.loadHours(day),
      };
  
      dayObject.visible = this.dayIsVisible(dayObject);
  
      days.push(dayObject);
    });

    this.days = days;

    this.loadHasDayWithSelectedCategories();

    this.currentMonth = this.year === new Date().getFullYear() && this.month === new Date().getMonth();
  }

  private loadLogsMap = () => {
    const formattedDate = this.datePipe.transform(new Date(this.year, this.month, 1), 'yyyy-MM');

    const logs = this.logs.filter(log => {
      const formattedLogDate = this.datePipe.transform(log.date, 'yyyy-MM');

      if (this.employeeId !== log.employee_id) {
        return false;
      }

      return formattedDate === formattedLogDate;
    });

    this.logsMap = new Map<string, IPlannerLog>();
  
    logs.forEach(log => {
      const logDate = this.datePipe.transform(log.date, 'yyyy-MM-dd HH:mm');

      this.logsMap.set(logDate, log);
    });
  }

  private loadHours = (day: number): IPlannerHour[] => {
    return this.hours.map(hour => {
      const date = new Date(this.year, this.month, day, hour, 0, 0, 0);

      const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd HH:mm');

      const log = this.logsMap.get(formattedDate);

      return {
        date: formattedDate,
        log: log || {}
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
    } else {
      this.logs.push(log);
    }

    this.loadLogsMap();
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
