import { Component, OnInit, ViewChildren, QueryList, NgZone, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { JobService } from '../jobs/job.service';
import { Job } from '../jobs/job.model';
import { Pagination } from 'app/shared/pagination.model';
import { Employee } from '../employees/employee.model';
import { EmployeeService } from '../employees/employee.service';
import { Month, MONTHS } from '../shared/date/months';
import { DAYSOFWEEK, DayOfWeek } from '../shared/date/days-of-week';
import { Router } from '@angular/router';
import { AuthService } from '../login/auth.service';
import { BriefingService } from '../briefings/briefing.service';
import { Briefing } from '../briefings/briefing.model';
import { BudgetService } from '../budgets/budget.service';
import { JobActivityServiceInterface } from '../jobs/job-activity-service.interface';
import { Budget } from '../budgets/budget.model';
import { Task } from './task.model';
import { TaskService } from './task.service';
import { TaskItem } from './task-item.model';

import { Observable, timer, Subscription } from 'rxjs';
import 'rxjs/add/operator/filter';
import { JobStatusService } from '../job-status/job-status.service';
import { JobStatus } from '../job-status/job-status.model';

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
  scrollActivate: boolean = false
  rowAppearedState: string = 'ready'
  pagination: Pagination
  tasks: Task[] = []
  jobs: Job[] = []
  attendances: Employee[]
  searching = false
  filter = false
  chrono: Chrono[] = []
  month: Month
  months: Month[] = MONTHS
  year: number
  date: Date
  jobStatus: JobStatus[]
  updatedMessage: string = ''
  timer: Observable<number>
  subscription: Subscription

  jobDrag: Job
  lineJob: HTMLElement
  tempX: number
  tempY: number

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private taskService: TaskService,
    private jobService: JobService,
    private jobStatusService: JobStatusService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private briefingService: BriefingService,
    private budgetService: BudgetService,
    private ngZone: NgZone,
    private el: ElementRef,
    private router: Router
  ) { }

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

            info.parentSenderPos = Array.prototype.indexOf.call(this.parentNode.parentNode.parentNode.children, this.parentNode.parentNode)
            info.senderPos = Array.prototype.indexOf.call(this.parentNode.children, this)
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

            angular.scrollActivate = false
            info = JSON.parse(event.dataTransfer.getData('type'))
            info.parentRecipientPos = Array.prototype.indexOf.call(this.parentNode.parentNode.parentNode.children, this.parentNode.parentNode)
            info.recipientPos = Array.prototype.indexOf.call(this.parentNode.children, this)

            let senderParent = document.querySelectorAll('.line-jobs')[info.parentSenderPos] as HTMLElement
            let recipientParent = document.querySelectorAll('.line-jobs')[info.parentRecipientPos] as HTMLElement
            let parentRecipientPos: number = info.parentRecipientPos
            let parentSenderPos: number = info.parentSenderPos

            //let job1Html = senderParent.querySelectorAll('.line-job')[info.senderPos] as HTMLElement
            //job1Html.style.backgroundColor = 'yellow'
            //let job2Html = recipientParent.querySelectorAll('.line-job')[info.recipientPos] as HTMLElement
            //job2Html.style.backgroundColor = 'red'

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
                angular.changeMonth(angular.month)
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
      attendance: this.fb.control('')
    })

    this.date = new Date()
    this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1))
    this.year = this.date.getFullYear()
    this.changeMonth(this.month)

    this.createTimerUpdater()
    this.loadJobStatus()
  }

  loadJobStatus() {
    this.jobStatusService.jobStatus().subscribe(jobStatus => this.jobStatus = jobStatus)
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  createTimerUpdater() {
    let time = 30000
    this.timer = timer(time * 2, time)
    this.subscription = this.timer.subscribe(timer => {
      this.changeMonth(this.month)
    })
  }

  checkIfDeadlineIsMinor(job: Job, availableDate: string) {
    if(job.id == null) {
      return false
    }

    return new Date(job.deadline) <= new Date(availableDate)
  }

  changeMonth(month: Month) {
    this.searching = true
    let snackBar = this.snackBar.open('Carregando tarefas...')
    this.month = month
    let iniDateWithoutLimits = new Date(this.date.getUTCFullYear() + '-' + (month.id) + '-01')
    let finDateWithoutLimits = new Date(this.date.getUTCFullYear() + '-' + (month.id) + '-31')
    iniDateWithoutLimits.setDate(iniDateWithoutLimits.getDate() - 10)
    finDateWithoutLimits.setDate(finDateWithoutLimits.getDate() + 10)
    let iniDate = iniDateWithoutLimits.getUTCFullYear() + '-' + (iniDateWithoutLimits.getMonth() + 1) + '-' + iniDateWithoutLimits.getDate()
    let finDate = finDateWithoutLimits.getUTCFullYear() + '-' + (finDateWithoutLimits.getMonth() + 1) + '-' + finDateWithoutLimits.getDate()

    let date = new Date()
    if (month.id == date.getMonth() + 1) {
      this.scrollActivate = true
    } else {
      this.scrollActivate = false
    }

    this.taskService.tasks({
      iniDate: iniDate,
      finDate: finDate,
      paginate: false
    }).subscribe(pagination => {
      this.pagination = pagination
      this.searching = false
      this.tasks = pagination.data
      this.chronologicDisplay(this.date.getUTCFullYear() + '-' + (month.id) + '-01')
      this.setUpdatedMessage()
      snackBar.dismiss()
    })
  }

  setUpdatedMessage() {
    if (this.tasks.length == 0) {
      this.updatedMessage = 'Sem atualizações'
      return
    }

    let jobs = this.tasks.map(task => {
      return task.job
    })

    let sortedJobs = jobs.sort((a, b) => {
      if (a.updated_at > b.updated_at) {
        return 1
      } else if (a.updated_at < b.updated_at) {
        return -1
      } else {
        return 0
      }
    })

    let formatedDate = ''
    let job = sortedJobs[sortedJobs.length - 1]
    let date = new Date(job.updated_at)

    if (date.getDate() < 10) {
      formatedDate += '0' + date.getDate() + '/'
    } else {
      formatedDate += date.getDate() + '/'
    }

    if ((date.getUTCMonth() + 1) < 10) {
      formatedDate += '0' + (date.getUTCMonth() + 1) + '/'
    } else {
      formatedDate += (date.getUTCMonth() + 1) + '/'
    }

    formatedDate += date.getFullYear()
    formatedDate += ' às '

    if (date.getHours() < 10) {
      formatedDate += '0' + date.getHours() + ':'
    } else {
      formatedDate += date.getHours() + ':'
    }

    if (date.getMinutes() < 10) {
      formatedDate += '0' + date.getMinutes()
    } else {
      formatedDate += date.getMinutes()
    }

    this.updatedMessage = 'Última atualização ' + formatedDate + ' por ' + job.attendance.name
  }

  jobDisplay(task: Task, chrono: Chrono) {
    if(task.job.id == null) {
      return ''
    }

    let date = new Date(task.available_date + 'T00:00:00')

    if(date.getDate() != chrono.day) {
      return 'Continuação'
    }

    return task.job_activity.description
  }

  signal(job: Job) {
    let oldStatus = job.status
    let wanted = job.status.id == 5 ? 1 : 5
    let wantedStatus = this.jobStatus.filter(s => { return s.id == wanted }).pop()
    job.status = wantedStatus

    this.jobService.edit(job).subscribe((data) => {
      if(data.status) {
        this.snackBar.open('Sinalização modificada com sucesso!', '', {
          duration: 3000
        })
      } else {
        job.status = oldStatus
      }
    })
  }

  chronologicDisplay(iniDate) {
    let i: number = 0
    let date: Date = new Date(iniDate)
    let thisMonth: number = date.getMonth()
    let days: number[]
    date.setDate(1)

    while (date.getMonth() == thisMonth) {
      if (date.getDay() > 0 && date.getDay() < 6) {
        let filteredTasks = this.tasks.filter(task => {
          return task.items.filter(item => {
              let itemDate = new Date(item.date + 'T00:00:00')
              return date.getDate() == itemDate.getDate()
              && date.getMonth() == itemDate.getMonth()
            }
          ).length  > 0
        })

        let length = filteredTasks.length

        for(let index = 0; index < (5 - length); index++) {
          let task = new Task
          let item = new TaskItem
          item.date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
          task.job = new Job
          task.items = []
          task.items.push(item)
          filteredTasks.push(task)
        }

        this.chrono[i] = {
          day: date.getDate(),
          dayOfWeek: DAYSOFWEEK.find(dayOfWeek => dayOfWeek.id == date.getDay()),
          tasks: filteredTasks
        }

        i++
      }

      date.setDate(date.getDate() + 1)
    }
  }

  scrollToDate() {
    let date = new Date()
    let dayString: string
    const elementBodyTable = document.querySelectorAll('.mat-row-scroll')[0] as HTMLElement;

    if(this.month.id == date.getMonth() + 1) {
      dayString = '.day-' + this.date.getDate()
      const elementList = document.querySelectorAll(dayString);

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

  delete(task: Task) {
    this.taskService.delete(task.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if (data.status) {
        this.changeMonth(this.month)
      }
    })
  }

}

export class Chrono {
  day: number
  dayOfWeek: DayOfWeek
  tasks: Task[]
}
