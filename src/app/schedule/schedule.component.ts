import { Component, OnInit, ViewChildren, QueryList, NgZone, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar, MatDialog } from '@angular/material';

import { JobService } from '../jobs/job.service';
import { Job } from '../jobs/job.model';
import { Pagination } from 'app/shared/pagination.model';
import { Employee } from '../employees/employee.model';
import { EmployeeService } from '../employees/employee.service';
import { Month, MONTHS } from '../shared/date/months';
import { DAYSOFWEEK, DayOfWeek } from '../shared/date/days-of-week';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../login/auth.service';
import { BriefingService } from '../briefings/briefing.service';
import { Briefing } from '../briefings/briefing.model';
import { BudgetService } from '../budgets/budget.service';
import { Budget } from '../budgets/budget.model';
import { Task } from './task.model';
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
  search: FormControl
  rowAppearedState: string = 'ready'
  pagination: Pagination
  tasks: Task[] = []
  jobs: Job[] = []
  attendances: Employee[]
  employees: Employee[]
  clients: Client[] = []
  jobActivities: JobActivity[] = []
  jobTypes: JobType[] = []
  params: any = {}
  searching = false
  filter = false
  scrollActive: boolean = true
  chrono: Chrono[] = []
  month: Month
  months: Month[] = MONTHS
  paramsHasFilter: boolean = false
  year: number
  date: Date
  jobStatus: JobStatus[]
  timer: Observable<number>
  timer2: Observable<number>
  today: Date
  dataInfo: DataInfo
  subscription: Subscription
  subscriptions: Subscription[] = []
  lastUpdateMessage: string
  paramAttendance: Employee = null
  counter: number = 0

  jobDrag: Job
  lineJob: HTMLElement
  tempX: number
  tempY: number

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private employeeService: EmployeeService,
    private taskService: TaskService,
    private jobService: JobService,
    private jobActivityService: JobActivityService,
    private jobTypeService: JobTypeService,
    private jobStatusService: JobStatusService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private briefingService: BriefingService,
    private budgetService: BudgetService,
    private dialog: MatDialog,
    private ngZone: NgZone,
    private el: ElementRef,
    private router: Router,
    private datePipe: DatePipe,
    private route: ActivatedRoute
  ) { }

  changeMonthByLine(data: any) {
    this.changeMonth(data.month, data.lastDate)
  }

  changeScrollStatus(status: boolean) {
    this.scrollActive = status
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

  ngAfterViewInit() {
    this.list.changes.subscribe(() => {
      this.scrollToDate()

      let list = document.querySelectorAll("[draggable='true']")
      let info = { parentSenderPos: null, parentRecipientPos: null, senderPos: null, recipientPos: null }
      let draggable
      let angular = this

      this.ngZone.runOutsideAngular(() => {
        for (let i = 0; i < list.length; i++) {
          let info = { parentSenderPos: null, senderPos: null }
          draggable = list.item(i) as HTMLElement
          draggable.addEventListener('dragstart', function (event: DragEvent) {
            if( ! angular.subscription.closed) {
              angular.subscription.unsubscribe()
            }

            info.parentSenderPos = Array.prototype.indexOf.call(this.closest('.mat-row-scroll').children, this.closest('.mat-row'))
            info.senderPos = Array.prototype.indexOf.call(this.closest('.line-jobs').querySelectorAll('.line-job'), this)
            event.dataTransfer.setData('type', JSON.stringify(info))
          })
          draggable.addEventListener('dragover', function (event) {
            event.preventDefault()
          })
          draggable.addEventListener('dragend', function (event) {
            event.preventDefault()
          })
        }
      })

      this.ngZone.run(() => {
        for (let i = 0; i < list.length; i++) {
          draggable = list.item(i) as HTMLElement
          draggable.addEventListener('drop', function (event: DragEvent) {
            angular.createTimerUpdater()

            if (this.parentNode == null) {
              return
            }

            event.preventDefault()

            info = JSON.parse(event.dataTransfer.getData('type'))
            info.parentRecipientPos = Array.prototype.indexOf.call(this.closest('.mat-row-scroll').children, this.closest('.mat-row'))
            info.recipientPos = Array.prototype.indexOf.call(this.closest('.line-jobs').querySelectorAll('.line-job'), this)

            let senderParent = document.querySelectorAll('.line-jobs')[info.parentSenderPos] as HTMLElement
            let recipientParent = document.querySelectorAll('.line-jobs')[info.parentRecipientPos] as HTMLElement
            let parentRecipientPos: number = info.parentRecipientPos
            let parentSenderPos: number = info.parentSenderPos

            let task1 = angular.chrono[parentSenderPos].tasks[info.senderPos]
            let task2 = angular.chrono[parentRecipientPos].tasks[info.recipientPos]
            let job1 = task1.job
            let job2 = task2.job

            let jobStep1 = task1.job_activity != null ? task1.job_activity.description : ''
            let jobStep2 = task2.job_activity != null ? task2.job_activity.description : ''

            if(jobStep1 != jobStep2 && jobStep1 != '' && jobStep2 != '' ) {
              angular.snackBar.open('Não é possível mudar data de tipos diferentes', '', {
                duration: 3000
              })
              return
            } else if(jobStep1 == '' && jobStep2 == '') {
              return
            }

            let snackBar = angular.snackBar.open('Aguarde enquanto mudamos a data...')

            angular.taskService.editAvailableDate(task1, task2).subscribe((data) => {
              if(data.status == true) {
                snackBar.dismiss()
                angular.changeMonth(angular.month, new Date(task2.items[0].date + "T00:00:00"))
              } else {
                snackBar.dismiss()
                angular.snackBar.open(data.message, '', {
                  duration: 3000
                })
                return false
              }
            })
          })
        }
      })
    })
  }

  ngOnInit() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search,
      attendance_array: this.fb.control(''),
      responsible_array: this.fb.control(''),
      job_type_array: this.fb.control(''),
      job_activity_array: this.fb.control(''),
      client: this.fb.control(''),
      status_array: this.fb.control('')
    })

    this.paramAttendance = this.authService.currentUser().employee.department.description === 'Atendimento'
    ? this.authService.currentUser().employee : null

    this.searchForm.controls.client.valueChanges
    .pipe(distinctUntilChanged(), debounceTime(500))
    .subscribe(clientName => {
      this.clientService.clients({ search: clientName, attendance: this.paramAttendance }).subscribe((dataInfo) => {
        this.clients = dataInfo.pagination.data
      })
    })

    let snackbar

    this.searchForm.valueChanges
      .do(() => {
        snackbar = this.snackBar.open('Carregando jobs...')
      })
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe(() => {
        let controls = this.searchForm.controls
        let clientName = controls.client.value != '' ? controls.client.value : controls.search.value

        this.params = {
          clientName: clientName,
          status_array: controls.status_array.value,
          attendance_array: controls.attendance_array.value,
          responsible_array: controls.responsible_array.value,
          job_type_array: controls.job_type_array.value,
          job_activity_array: controls.job_activity_array.value
        }
        this.checkParamsHasFilter()
        this.changeMonth(this.month, this.date)
      })

    this.today = new Date()
    this.activeDate()
    this.createTimerUpdater()
    this.loadJobStatus()
    this.loadFilterData()
  }

  checkParamsHasFilter() {
    this.paramsHasFilter = false
    Object.keys(this.params).forEach((key) => {
      if(this.params[key] != undefined
        && this.params[key] != null
        && this.params[key] != '')
        this.paramsHasFilter = true
    })
  }

  loadFilterData() {
    this.jobActivityService.jobActivities().subscribe(activities => this.jobActivities = activities)

    this.jobTypeService.jobTypes().subscribe(jobTypes => this.jobTypes = jobTypes)

    this.jobStatusService.jobStatus().subscribe(status => this.jobStatus = status)

    this.employeeService.canInsertClients().subscribe((attendances) => {
      this.attendances = attendances
    })

    this.employeeService.employees().subscribe(employees => {
      let list = ['Planejamento', 'Atendimento', 'Criação', 'Orçamento']
      this.employees = employees.filter(employee => {
        if(list.indexOf(employee.department.description) > -1) return true;
      })
    })
  }

  activeDate() {
    this.date = new Date()

    this.route.queryParams.subscribe(params => {
      if(params.date != undefined) {
        this.date = new Date(params.date + "T00:00:00")
        this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1))
        this.year = this.date.getFullYear()
        this.changeMonth(this.month, this.date)
      } else {
        this.date = new Date(this.datePipe.transform(this.today, 'yyyy-MM-dd') + "T00:00:00")
        this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1))
        this.year = this.date.getFullYear()
        this.changeMonth(this.month, this.date)
      }
    })
  }

  loadJobStatus() {
    this.jobStatusService.jobStatus().subscribe(jobStatus => this.jobStatus = jobStatus)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })
  }

  createTimerUpdater() {
    let time = 60000
    this.timer = timer(time * 2, time)
    this.subscription = this.timer.subscribe(timer => {
      this.taskService.updatedInfo().subscribe(data => {
        if(data.date == this.dataInfo.updatedInfo.date) {
          return
        }
        this.dataInfo.updatedInfo = data
        this.setUpdatedMessage()
        this.changeMonth(this.month)
      })
    })

    this.subscriptions.push(this.subscription)

    if(this.authService.currentUser().email == 'tv@thinkideias.com.br') {
      this.timer2 = timer(5000, 60 * 1000 * 30)
      this.subscriptions.push(this.timer2.subscribe(timer => {
        this.counter += 1

        if(this.counter > 2) {
          window.location.reload()
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
    if(this.dataInfo.updatedInfo.date == undefined) {
      this.lastUpdateMessage = 'Sem atualizações'
      return
    }

    this.lastUpdateMessage = 'Última atualização ' + this.dataInfo.updatedInfo.date + ' por ' +  this.dataInfo.updatedInfo.employee
  }

  checkIfDeadlineIsMinor(job: Job, availableDate: string) {
    if(job.id == null) {
      return false
    }

    return new Date(job.deadline) <= new Date(availableDate)
  }

  updateMonth(month: Month) {
    let date = new Date(this.date.getUTCFullYear() + '-' + (month.id) + '-01')
    let now = new Date()

    if(month.id == (now.getMonth() + 1)) {
      date.setDate(now.getDate())
    }

    this.changeMonth(month, date)
  }

  changeMonth(month: Month, date?: Date) {
    this.searching = true
    let snackBar = this.snackBar.open('Carregando tarefas...')
    this.month = month
    let iniDateWithoutLimits = new Date(this.date.getUTCFullYear() + '-' + (month.id) + '-01')
    let finDateWithoutLimits = new Date(this.date.getUTCFullYear() + '-' + (month.id) + '-31')

    if(date != null) {
      const urlTree = this.router.createUrlTree([], {
        queryParams: { date: this.datePipe.transform(date, 'yyyy-MM-dd') },
        queryParamsHandling: "merge",
        preserveFragment: true });

      this.router.navigateByUrl(urlTree);
    }

    iniDateWithoutLimits.setDate(iniDateWithoutLimits.getDate() - 15)
    finDateWithoutLimits.setDate(finDateWithoutLimits.getDate() + 15)
    let iniDate = iniDateWithoutLimits.getUTCFullYear() + '-' + (iniDateWithoutLimits.getMonth() + 1) + '-' + iniDateWithoutLimits.getDate()
    let finDate = finDateWithoutLimits.getUTCFullYear() + '-' + (finDateWithoutLimits.getMonth() + 1) + '-' + finDateWithoutLimits.getDate()

    this.taskService.tasks({
      iniDate: iniDate,
      finDate: finDate,
      paginate: false,
      ...this.params
    }).subscribe(dataInfo => {
      this.pagination = dataInfo.pagination
      this.searching = false
      this.tasks = this.pagination.data
      this.dataInfo = dataInfo
      this.setUpdatedMessage()
      this.chronologicDisplay(this.date.getUTCFullYear() + '-' + (month.id) + '-01')
      snackBar.dismiss()
    })
  }

  chronologicDisplay(iniDate) {
    let i: number = 0
    let fixedDateMax: Date = new Date(iniDate)
    let date: Date = new Date(iniDate)

    date.setDate(date.getDate() - 5)
    fixedDateMax.setDate(fixedDateMax.getDate() + 35)
    let days: number[]

    while (date.getTime() < fixedDateMax.getTime()) {
      let filteredTasks = this.tasks.filter(task => {
        return task.items.filter(item => {
            let itemDate = new Date(item.date + 'T00:00:00')
            return date.getDate() == itemDate.getDate()
            && date.getMonth() == itemDate.getMonth()
          }
        ).length  > 0
      })

      let count = filteredTasks.length
      let length = (date.getDay() == 6 || date.getDay() == 0) ? 3 : filteredTasks.length

      for(let index = 0; index < (5 - length); index++) {
        let task = new Task
        let item = new TaskItem
        item.date = this.datePipe.transform(date, 'yyyy-MM-dd')
        task.job = new Job
        task.items = []
        task.items.push(item)
        filteredTasks.push(task)
      }

      this.chrono[i] = {
        day: date.getDate(),
        month: (date.getMonth() + 1),
        dayOfWeek: DAYSOFWEEK.find(dayOfWeek => dayOfWeek.id == date.getDay()),
        tasks: filteredTasks.sort((a,b) => {
          if(a.responsible != null && b.responsible != null)
          return a.responsible.department_id > b.responsible.department_id ? 1 : -1
        }),
        length: count
      }

      i++

      date.setDate(date.getDate() + 1)
    }
  }

  scrollToDate() {
    if( ! this.scrollActive ) {
      return
    }

    let date = this.date
    let query: string
    const elementBodyTable = document.querySelectorAll('.mat-row-scroll')[0] as HTMLElement;

    if(this.month.id == date.getMonth() + 1) {
      query = '.day-' + this.date.getDate() + '.month-' + (this.date.getMonth() + 1)
      const elementList = document.querySelectorAll(query);

      if (elementList.length > 0) {
        const element = elementList[0] as HTMLElement;
        elementBodyTable.scrollTo(0, element.offsetTop - 45)
      }
    } else {
      elementBodyTable.scrollTo(0, 0)
    }
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
export class ReloadComponent {}


