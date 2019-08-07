import { Component, OnInit, ViewChildren, QueryList, NgZone, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Employee } from '../employees/employee.model';
import { EmployeeService } from '../employees/employee.service';
import { Month, MONTHS } from '../shared/date/months';
import { DAYSOFWEEK } from '../shared/date/days-of-week';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../login/auth.service';
import { TaskService } from './task.service';
import { TaskItem } from './task-item.model';
import { Chrono } from './chrono.model';

import { Observable, timer, Subscription } from 'rxjs';
import 'rxjs/add/operator/filter';
import { JobStatusService } from '../job-status/job-status.service';
import { JobStatus } from '../job-status/job-status.model';
import { DataInfo } from '../shared/data-info.model';
import { DatePipe } from '@angular/common';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { Client } from 'app/clients/client.model';
import { ClientService } from 'app/clients/client.service';
import { JobActivityService } from '../job-activities/job-activity.service';
import { JobTypeService } from '../job-types/job-type.service';
import { JobActivity } from '../job-activities/job-activity.model';
import { JobType } from '../job-types/job-type.model';
import { ScheduleBlock } from './schedule-block/schedule-block.model';
import { Job } from '../jobs/job.model';
import { ScheduleBlockService } from './schedule-block/schedule-block.service';
import { Department } from '../department/department.model';
import { BlockDialogComponent } from './schedule-block/block-dialog/block-dialog.component';
import { Task } from './task.model';

@Component({
  selector: 'cb-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
  animations: [
    trigger('rowAppeared', [
      state('ready', style({ opacity: 1 })),
      transition('void => ready', animate('300ms 0s ease-in', keyframes([
        style({ opacity: 0, transform: 'translateX(-30px)', offset: 0 }),
        style({ opacity: 0.8, transform: 'translateX(10px)', offset: 0.8 }),
        style({ opacity: 1, transform: 'translateX(0px)', offset: 1 })
      ]))),
      transition('ready => void', animate('300ms 0s ease-out', keyframes([
        style({ opacity: 1, transform: 'translateX(0px)', offset: 0 }),
        style({ opacity: 0.8, transform: 'translateX(-10px)', offset: 0.2 }),
        style({ opacity: 0, transform: 'translateX(30px)', offset: 1 })
      ])))
    ])
  ]
})
export class ScheduleComponent implements OnInit {

  @ViewChildren('list') list: QueryList<any>
  searchForm: FormGroup
  formCopy: any
  search: FormControl
  rowAppearedState: string = 'ready'
  items: TaskItem[] = []
  attendances: Employee[]
  employees: Employee[]
  departments: Department[] = []
  clients: Client[] = []
  jobActivities: JobActivity[] = []
  jobTypes: JobType[] = []
  params: any = {}
  searching = false
  filter = false
  chrono: Chrono[] = []
  dateBlocks: ScheduleBlock[] = []
  month: Month
  months: Month[] = MONTHS
  paramsHasFilter: boolean = false
  year: number
  years: number[] = []
  date: Date
  iniDate: Date
  finDate: Date
  stepDate: number = 10
  scrollToElement: string = ''
  scrollToDateFlag: boolean = false
  scrollParams: ScrollIntoViewOptions = { behavior: 'smooth' }
  jobStatus: JobStatus[]
  timer: Observable<number>
  timer2: Observable<number>
  dataInfo: DataInfo
  subscription: Subscription
  subscriptions: Subscription[] = []
  lastUpdateMessage: string
  paramAttendance: Employee = null
  isAdmin: boolean = false
  counter: number = 0
  hasFilterActive = false

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private employeeService: EmployeeService,
    private taskService: TaskService,
    private jobActivityService: JobActivityService,
    private jobTypeService: JobTypeService,
    private jobStatusService: JobStatusService,
    private scheduleBlockService: ScheduleBlockService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private datePipe: DatePipe,
    private route: ActivatedRoute
  ) { }

  changeMonthByLine(data: any) {
    this.month = data.month
    this.date = data.lastDate
    this.changeMonth()
  }

  lineChronoClass(chrono: Chrono, employees: Employee[]) {
    if (employees == undefined) return

    let date = chrono.year + '-' + chrono.month + '-' + chrono.day
    let foundDate = this.dateBlocks.find((scheduleBlock) => {
      return this.datePipe.transform(scheduleBlock.date, 'yyyy-MM-dd')
        == this.datePipe.transform(date, 'yyyy-MM-dd')
    })

    /* Lista de funcionários não contempla todos os departamentos que usam o cronograma */
    if (foundDate != undefined
      && foundDate.blocks != undefined
      && foundDate.blocks.length >= employees.length) {
      return 'line-chrono-block'
    }

    return ''
  }

  blockText(chrono: Chrono) {
    let date = chrono.year + '-' + chrono.month + '-' + chrono.day
    let foundDate = this.dateBlocks.find((scheduleBlock) => {
      return this.datePipe.transform(scheduleBlock.date, 'yyyy-MM-dd')
        == this.datePipe.transform(date, 'yyyy-MM-dd')
    })

    if (foundDate != undefined) {
      return 'UNBLOCK'
    }

    return 'BLOCK'
  }

  blockedNumber(chrono: Chrono) {
    let date = chrono.year + '-' + chrono.month + '-' + chrono.day
    let foundDate = this.dateBlocks.find((scheduleBlock) => {
      return this.datePipe.transform(scheduleBlock.date, 'yyyy-MM-dd')
        == this.datePipe.transform(date, 'yyyy-MM-dd')
    })

    if (foundDate != undefined) {
      return foundDate.blocks.length
    }

    return '0'
  }

  openBlockDialog(chrono: Chrono) {
    let date = this.datePipe.transform(chrono.year + '-' + chrono.month + '-' + chrono.day, 'yyyy-MM-dd')

    const dialogRef = this.dialog.open(BlockDialogComponent, {
      width: '400px',
      data: { date: date, employees: this.employees, scheduleBlocks: this.dateBlocks }
    });

    dialogRef.afterClosed().subscribe(() => {
      const snackbar = this.snackBar.open('Aguarde enquanto atualizamos...')
      this.scheduleBlockService.valid().subscribe((scheduleBlocks) => {
        this.dateBlocks = scheduleBlocks
        snackbar.dismiss()
      })
    });
  }

  permissionVerify(module: string, job: Job): boolean {
    let access: boolean
    let employee = this.authService.currentUser().employee
    switch (module) {
      case 'new': {
        access = this.authService.hasAccess('job/save')
        break
      }
      case 'show': {
        access = job.attendance.id != employee.id ? this.authService.hasAccess('jobs/get/{id}') : true
        break
      }
      case 'edit': {
        access = job.attendance.id != employee.id ? this.authService.hasAccess('job/edit') : true
        break
      }
      case 'task.edit': {
        access = this.authService.hasAccess('task/edit')
        break
      }
      case 'delete': {
        access = job.attendance.id != employee.id ? this.authService.hasAccess('job/remove/{id}') : true
        break
      }
      default: {
        access = false
        break
      }
    }
    return access
  }

  ngOnInit() {
    this.isAdmin = this.permissionVerify('new', new Job())

    this.paramAttendance = this.authService.currentUser().employee.department.description === 'Atendimento'
      ? this.authService.currentUser().employee : null

    this.createForm()
    this.setYears()
    this.createTimerUpdater()
    this.loadFilterData()
    this.loadInitialData()
  }

  ngAfterViewInit() {
    this.list.changes.subscribe(() => this.scrollToDate())
  }

  createForm() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search,
      attendance_array: this.fb.control([]),
      responsible_array: this.fb.control([]),
      job_type_array: this.fb.control([]),
      job_activity_array: this.fb.control([]),
      client: this.fb.control(''),
      department_array: this.fb.control([]),
      status_array: this.fb.control([])
    })

    this.formCopy = this.searchForm.value

    if (JSON.stringify(this.taskService.searchValue) == JSON.stringify({})) {
      this.taskService.searchValue = this.searchForm.value
    } else {
      this.searchForm.setValue(this.taskService.searchValue)
    }

    this.searchForm.valueChanges
    .pipe(distinctUntilChanged(), debounceTime(500))
    .subscribe((searchValue) => {
      this.params = this.getParams(searchValue)
      this.taskService.searchValue = searchValue
      this.updateFilterActive()
      this.checkParamsHasFilter()
      this.changeMonth()
    })

    this.searchForm.controls.client.valueChanges
    .pipe(distinctUntilChanged(), debounceTime(500))
    .subscribe(clientName => {
      this.clientService.clients({ search: clientName, attendance: this.paramAttendance }).subscribe((dataInfo) => {
        this.clients = dataInfo.pagination.data
      })
    })
  }

  getParams(searchValue) {
    let clientName = searchValue.client != '' ? searchValue.client : searchValue.search
    return  {
      clientName: clientName,
      status_array: searchValue.status_array,
      attendance_array: searchValue.attendance_array,
      responsible_array: searchValue.responsible_array,
      job_type_array: searchValue.job_type_array,
      job_activity_array: searchValue.job_activity_array,
      department_array: searchValue.department_array
    }
  }

  updateFilterActive() {
    if (JSON.stringify(this.taskService.searchValue) === JSON.stringify(this.formCopy)) {
      this.hasFilterActive = false
    } else {
      this.hasFilterActive = true
    }
  }

  clearFilter() {
    this.taskService.searchValue = {}
    this.createForm()
    this.loadInitialData()
  }

  loadInitialData() {
    if (JSON.stringify(this.taskService.searchValue) === JSON.stringify(this.formCopy)) {
      this.params = {}
    } else {
      this.params = this.getParams(this.taskService.searchValue)
    }

    this.updateFilterActive()
    this.checkParamsHasFilter()
    this.setDataByParams()
  }

  checkParamsHasFilter() {
    this.paramsHasFilter = false
    Object.keys(this.params).forEach((key) => {
      if (this.params[key] != undefined
        && this.params[key] != null
        && this.params[key] != '')
        this.paramsHasFilter = true
    })
  }

  loadFilterData() {
    this.jobActivityService.jobActivities().subscribe(activities => this.jobActivities = activities)

    this.jobTypeService.jobTypes().subscribe(jobTypes => this.jobTypes = jobTypes)

    this.jobStatusService.jobStatus().subscribe(status => this.jobStatus = status)

    this.employeeService.canInsertClients({
      deleted: true
    }).subscribe((attendances) => {
      this.attendances = attendances
    })

    this.scheduleBlockService.valid().subscribe((scheduleBlocks) => { this.dateBlocks = scheduleBlocks })

    if(this.authService.hasAccess('employees/filter'))
      this.employeeService.employees().subscribe(dataInfo => {
        let list = ['Planejamento', 'Atendimento', 'Criação', 'Orçamento']
        let employees: Employee[] = dataInfo.pagination.data
        this.employees = employees.filter(employee => {
          if (!this.departments.some((item) => { return item.id == employee.department.id })
            && list.indexOf(employee.department.description) > -1)
            this.departments.push(employee.department)

          if (list.indexOf(employee.department.description) > -1) return true;
        })
      })
  }

  toggleDepartments() {
    let array = this.searchForm.controls.department_array.value as Department[]

    array.length > 0
      ? this.searchForm.controls.department_array.setValue([])
      : this.searchForm.controls.department_array.setValue(this.departments)
  }

  toggleResponsibles() {
    let array = this.searchForm.controls.responsible_array.value as Employee[]

    array.length > 0
      ? this.searchForm.controls.responsible_array.setValue([])
      : this.searchForm.controls.responsible_array.setValue(this.employees)
  }

  toggleAttendances() {
    let array = this.searchForm.controls.attendance_array.value as Employee[]

    array.length > 0
      ? this.searchForm.controls.attendance_array.setValue([])
      : this.searchForm.controls.attendance_array.setValue(this.attendances)
  }

  toggleJobTypes() {
    let array = this.searchForm.controls.job_type_array.value as JobType[]

    array.length > 0
      ? this.searchForm.controls.job_type_array.setValue([])
      : this.searchForm.controls.job_type_array.setValue(this.jobTypes)
  }

  toggleJobActivities() {
    let array = this.searchForm.controls.job_activity_array.value as JobActivity[]

    array.length > 0
      ? this.searchForm.controls.job_activity_array.setValue([])
      : this.searchForm.controls.job_activity_array.setValue(this.jobActivities)
  }

  toggleStatus() {
    let array = this.searchForm.controls.status_array.value as JobStatus[]

    array.length > 0
      ? this.searchForm.controls.status_array.setValue([])
      : this.searchForm.controls.status_array.setValue(this.jobStatus)
  }

  setYears() {
    let ini = 2018
    let year = (new Date).getFullYear()

    while (ini <= (year + 1)) {
      this.years.push(ini)
      ini += 1
    }
  }

  setDataByParams() {
    this.date = new Date()

    this.route.queryParams.subscribe(params => {
      if (params.date != undefined) {
        this.date = new Date(params.date + "T00:00:00")
        this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1))
        this.year = this.date.getFullYear()
      } else {
        this.date = new Date(this.datePipe.transform(new Date, 'yyyy-MM-dd') + "T00:00:00")
        this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1))
        this.year = this.date.getFullYear()
      }

      this.changeMonth()
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })
  }

  createTimerUpdater() {
    let time = 60000
    let date = new Date()

    this.timer = timer(time * 2, time)
    this.subscription = this.timer.subscribe(timer => {
      this.taskService.updatedInfo().subscribe(data => {
        if (data.date == this.dataInfo.updatedInfo.date) {
          return
        }
        this.dataInfo.updatedInfo = data
        this.setUpdatedMessage()
        this.changeMonth()
      })
    })

    this.subscriptions.push(this.subscription)

    if (this.authService.currentUser().email == 'tv@thinkideias.com.br') {
      this.timer2 = timer(5000, 60 * 1000 * 30)

      this.subscriptions.push(this.timer2.subscribe(timer => {
        date = new Date()
        this.date = new Date(this.datePipe.transform(date, 'yyyy-MM-dd') + "T00:00:00")
        this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1))
        this.changeMonth()
        this.counter += 1

        if (this.counter > 2) {
          window.location.reload();
        }

        let dialog = this.dialog.open(ReloadComponent, {
          height: '1px',
          width: '1px'
        })
        Observable.timer(3000).subscribe(timer => {
          dialog.close()
        })
      }))
    }
  }

  setUpdatedMessage() {
    if (this.dataInfo.updatedInfo.date == undefined) {
      this.lastUpdateMessage = 'Sem atualizações'
      return
    }

    this.lastUpdateMessage = 'Última atualização ' + this.dataInfo.updatedInfo.date + ' por ' + this.dataInfo.updatedInfo.employee
  }

  updateMonth(month: Month) {
    this.month = month
    this.changeMonth()
  }

  addMonth(inc: number) {
    this.date.setDate(1)
    this.date.setMonth(this.date.getMonth() + inc)
    this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1))
    this.year = this.date.getFullYear()

    this.changeMonth()
  }

  updateYear(year: number) {
    this.year = year
    this.changeMonth()
  }

  changeMonth() {
    this.searching = true
    let snackBar = this.snackBar.open('Carregando tarefas...')

    this.items = []
    this.chrono = []

    this.iniDate = new Date(this.year + '-' + this.month.id + '-' + this.date.getDate())
    this.finDate = new Date(this.year + '-' + this.month.id + '-' + this.date.getDate())

    const urlTree = this.router.createUrlTree([], {
      queryParams: { date: this.datePipe.transform(this.iniDate, 'yyyy-MM-dd') },
      queryParamsHandling: "merge",
      preserveFragment: true
    });

    this.iniDate.setDate(this.iniDate.getDate() - 5)
    this.finDate.setDate(this.finDate.getDate() + 5)

    this.router.navigateByUrl(urlTree)

    this.taskService.tasks({
      iniDate: this.datePipe.transform(this.iniDate, 'yyyy-MM-dd'),
      finDate: this.datePipe.transform(this.finDate, 'yyyy-MM-dd'),
      paginate: false,
      ...this.params
    }).subscribe(dataInfo => {
      this.searching = false
      this.items = dataInfo.pagination.data
      this.dataInfo = dataInfo
      this.setUpdatedMessage()
      this.mountDates(this.iniDate, this.finDate)

      this.scrollToDateFlag = true
      snackBar.dismiss()
    })
  }

  /*
   * Mescla os itens da agenda com as datas do calendário
   */
  mountDates(iniDate: Date, finDate: Date, insertInBegin = false) {
    let chrono: Chrono
    let date: Date = new Date(iniDate.getTime())
    let fixedDateMax: Date = new Date(finDate.getTime())
    let dates: Chrono[] = []

    while (date.getTime() <= fixedDateMax.getTime()) {
      let filteredTasks = this.items.filter(item => {
        let itemDate = new Date(item.date + 'T00:00:00')
        return date.getDate() == itemDate.getDate()
          && date.getMonth() == itemDate.getMonth()
      })

      let count = filteredTasks.length
      let length = (date.getDay() == 6 || date.getDay() == 0) ? 3 : filteredTasks.length

      for (let index = 0; index < (5 - length); index++) {
        let item = new TaskItem
        item.date = this.datePipe.transform(date, 'yyyy-MM-dd')
        item.task = new Task
        item.task.job = new Job
        item.task.items = []
        item.task.items.push(item)
        filteredTasks.push(item)
      }

      chrono = {
        day: date.getDate(),
        month: (date.getMonth() + 1),
        year: date.getFullYear(),
        dayOfWeek: DAYSOFWEEK.find(dayOfWeek => dayOfWeek.id == date.getDay()),
        items: filteredTasks.sort((a, b) => {
          if (a.task.responsible != null && b.task.responsible != null)
            return a.task.responsible.department_id > b.task.responsible.department_id ? 1 : -1
        }),
        length: count
      }

      dates.push(chrono)
      date.setDate(date.getDate() + 1)
    }

    if(insertInBegin) {
      this.chrono = dates.concat(this.chrono)
    } else {
      this.chrono = this.chrono.concat(dates)
    }
  }

  scrollToDate() {
    let query: string = ''
    let element: HTMLElement

    if( !this.scrollToDateFlag ) return;

    query = this.scrollToElement != '' ? this.scrollToElement : '.day-' + this.date.getDate()
    element = document.querySelector(query);

    if (element != null) {
      element.scrollIntoView(this.scrollParams)
    }

    this.scrollToDateFlag = false
    this.scrollToElement = ''
    this.scrollParams = { behavior: 'smooth' }
  }

  scrolling($event) {
    if( this.searching ) return;

    let scrollTop = $event.target.scrollTop
    if((scrollTop + $event.target.offsetHeight) >= $event.target.scrollHeight) {
      this.loadItemsAfter()
    } else if(scrollTop == 0) {
      this.loadItemsBefore()
    }
  }

  loadItemsAfter() {
    let snackBar = this.snackBar.open('Carregando datas posteriores...')
    let iniDate = new Date(this.finDate.getTime())

    iniDate.setDate(this.finDate.getDate() + 1)
    this.finDate.setDate(this.finDate.getDate() + this.stepDate)

    this.searching = true

    this.taskService.tasks({
      iniDate: this.datePipe.transform(iniDate, 'yyyy-MM-dd'),
      finDate: this.datePipe.transform(this.finDate, 'yyyy-MM-dd'),
      paginate: false,
      ...this.params
    }).subscribe((dataInfo) => {
      this.items = this.items.concat(dataInfo.pagination.data)
      this.dataInfo = dataInfo
      this.setUpdatedMessage()
      this.mountDates(iniDate, this.finDate)
      snackBar.dismiss()

      this.scrollToElement = '.day-' + this.datePipe.transform(iniDate, 'd')
      this.scrollToElement += '.month-' + this.datePipe.transform(iniDate, 'M')
      this.scrollToDateFlag = true
      this.scrollParams = { behavior: 'smooth' }

      this.searching = false
    })
  }

  loadItemsBefore() {
    let snackBar = this.snackBar.open('Carregando datas anteriores...')
    let finDate = new Date(this.iniDate.getTime())

    finDate.setDate(this.iniDate.getDate() - 1)
    this.iniDate.setDate(this.iniDate.getDate() - this.stepDate)

    this.searching = true

    this.taskService.tasks({
      iniDate: this.datePipe.transform(this.iniDate, 'yyyy-MM-dd'),
      finDate: this.datePipe.transform(finDate, 'yyyy-MM-dd'),
      paginate: false,
      ...this.params
    }).subscribe((dataInfo) => {
      this.items = dataInfo.pagination.data.concat(this.items)
      this.dataInfo = dataInfo
      this.setUpdatedMessage()
      this.mountDates(this.iniDate, finDate, true)
      snackBar.dismiss()

      this.scrollToElement = '.day-' + this.datePipe.transform(finDate, 'd')
      this.scrollToElement += '.month-' + this.datePipe.transform(finDate, 'M')
      this.scrollToDateFlag = true
      this.scrollParams = { behavior: 'auto' }

      this.searching = false
    })
  }

  addTask(day: number) {
    let month = this.date.getMonth() + 1
    let tempMonth = month.toString()
    let tempDay = day.toString()

    if (month < 10) {
      tempMonth = '0' + month
    }

    if (day < 10) {
      tempDay = '0' + day
    }

    this.router.navigate(['/schedule/new'], {
      queryParams: {
        date: this.date.getUTCFullYear() + '-' + tempMonth + '-' + tempDay
      }
    })
  }

  compareJobActivity(var1: JobActivity, var2: JobActivity) {
    return var1.id === var2.id
  }

  compareDepartment(var1: Department, var2: Department) {
    return var1.id === var2.id
  }

  compareJobType(var1: JobType, var2: JobType) {
    return var1.id === var2.id
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }

  compareStatus(var1: JobStatus, var2: JobStatus) {
    return var1.id === var2.id
  }

}

@Component({
  selector: 'cb-reload',
  template: ''
})
export class ReloadComponent { }


