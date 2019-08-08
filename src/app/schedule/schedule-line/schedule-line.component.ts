import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Chrono } from '../chrono.model';
import { DatePipe } from '@angular/common';
import { TaskService } from '../task.service';
import { AuthService } from '../../login/auth.service';
import { Job } from '../../jobs/job.model';
import { JobService } from '../../jobs/job.service';
import { JobStatus } from '../../job-status/job-status.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Month } from '../../shared/date/months';
import { Router } from '@angular/router';
import { isObject } from 'util';
import { MatMenuTrigger, MatMenu } from '@angular/material/menu';
import { TaskItem } from '../task-item.model';
import { Task } from '../task.model';

@Component({
  selector: 'cb-schedule-line',
  templateUrl: './schedule-line.component.html',
  styleUrls: ['./schedule-line.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleLineComponent implements OnInit {

  @Input() menu: MatMenu
  @ViewChild('menuTrigger', { static: false }) menuTrigger: MatMenuTrigger
  @Input() month: Month
  @Input() paramsHasFilter: boolean = false
  @Input() date: Date
  @Input() jobStatus: JobStatus[] = []
  @Input() item: TaskItem
  @Input() chrono: Chrono
  @Input() today: Date
  @Output() changeMonthEmitter: EventEmitter<any> = new EventEmitter()

  constructor(
    private jobService: JobService,
    private router: Router,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private taskService: TaskService
  ) { }

  ngOnInit() {
  }

  openMenu(item: TaskItem) {
    if(this.jobDisplay(item).indexOf('Continuação de') >= 0) {
      this.menuTrigger.closeMenu();
    }
  }

  goToJob(job: Job) {
    if(job.id == null) {
      return ''
    }

    if(this.permissionVerify('edit', job)) {
      this.router.navigateByUrl('/jobs/edit/' + job.id)
    } else if(this.permissionVerify('show', job)) {
      this.router.navigateByUrl('/jobs/show/' + job.id)
    }
  }

  timeDisplay(item: TaskItem, chrono: Chrono) {
    if(item.task.job.id == null) {
      return ''
    }

    let index = item.task.items.findIndex(arrayItem => {
      let date = new Date(arrayItem.date + "T00:00:00")
      return chrono.day == date.getDate()
    })
    let taskFound = this.item.task

    if(taskFound == null) {
      return
    }

    return 'D+' + (item.task.items.length - index - 1)
  }

  timeIconDisplay() {
    if(this.item.task.job.id == null) {
      return ''
    }

    if(this.item.task.done == 1) {
      return 'done'
    } else {
      let lastItem = this.item.task.items[(this.item.task.items.length - 1)]
      let finalDate = new Date(lastItem.date + 'T00:00:00')

      if(this.datePipe.transform(finalDate, 'yyyy-MM-dd') < this.datePipe.transform(new Date(), 'yyyy-MM-dd')) {
        return 'alarm'
      } else {
        return 'access_alarm'
      }
    }
  }

  signal(task: Task) {
    let job = task.job
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

  deleteTask(item: TaskItem) {
    let lastDate = new Date(item.date + "T00:00:00")
    this.taskService.delete(item.task.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if (data.status) {
        this.changeMonthEmitter.emit({month: this.month, lastDate: lastDate})
      }
    })
  }

  deleteJob(task: Task) {
    let lastDate = new Date(task.available_date + "T00:00:00")
    this.jobService.delete(task.job.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if (data.status) {
        this.changeMonthEmitter.emit({month: this.month, lastDate: lastDate})
      }
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
        access = this.authService.hasAccess('job/remove/{id}')
        break
      }
      default: {
        access = false
        break
      }
    }
    return access
  }

  getLineClass(chrono: Chrono, item: TaskItem, day: number, month: number, nextIndex: number) {
    let className = ''

    if(item.task.job.id == null) {
      return className
    }

    if(item.task.job.attendance_id != this.authService.currentUser().employee.id
      && item.task.responsible_id != this.authService.currentUser().employee.id
      && item.task.job.id != undefined && !this.permissionVerify('edit', item.task.job))
      className += ' other-attendance'

    if(isObject(item.task.job_activity)
      && ['Projeto', 'Orçamento', 'Outsider'].indexOf(item.task.job_activity.description) >= 0
      && this.jobDisplay(item).indexOf('Continuação de') == -1) {

        if(item.task.job.status.id == 3 && (['Projeto', 'Outsider'].indexOf(item.task.job_activity.description) >= 0))
          className += ' approved-creation'

        if(item.task.job.status.id == 3 && (['Orçamento'].indexOf(item.task.job_activity.description) >= 0))
          className += ' approved-budget'

        if(item.task.job.status.id == 3 && (['Orçamento'].indexOf(item.task.job_activity.description) >= 0))
          className += ' approved-budget'

        if(item.task.job.status.id == 5)
          className += ' signal'

        if(this.paramsHasFilter && item.task.job.id == null)
          className += ' hidden'
    }

    if(isObject(chrono.items[nextIndex + 1])
    &&['Projeto', 'Orçamento'].indexOf(chrono.items[nextIndex + 1].task.job_activity.description) >= 0
      && [5,3].indexOf(chrono.items[nextIndex + 1].task.job.status_id) >= 0
      && this.jobDisplay(item).indexOf('Continuação de') == -1)
    {
      className += ' no-border'
    }

    let originalTask = item.task
    let departmentId = item.task.responsible.department_id
    let ocurrences = originalTask.items.filter(item => {
      return item.date == this.datePipe.transform(this.today, 'yyyy-MM-dd')
    }).length

    if(ocurrences == 0) {
      className += ' department-' + departmentId + '-border'
      return className
    }

    className += ' department-' + departmentId + '-transparent department-' + departmentId + '-border'
    return className
  }

  jobDisplay(item: TaskItem) {
    if(item.task.job.id == null) {
      return ''
    }

    let activity = this.taskService.jobDisplay(item.task)

    if(item.id != item.task.items[0].id) {
      return 'Continuação de ' + activity.toLowerCase()
    }

    return activity
  }

  calcValue(job: Job) {
    let text = 0.00

    if(job.area > 0) {
      text = parseFloat((job.budget_value / job.area).toFixed(2))
    }

    return text
  }

  canShowDetails(item: TaskItem) {
    const available = ['Modificação', 'Opção', 'Continuação', 'Continuação de', 'Detalhamento', 'M. descritivo']
    let text = this.jobDisplay(item)

    if(text == '') {
      return false
    }

    let found = false

    available.forEach((value) => {
      if(text.indexOf(value) >= 0) found = true
    })

    if(text.indexOf('Orçamento') >= 0
    && item.task.job.job_activity.description != 'Projeto externo') {
      found = true
    }

    return found ? false : true
  }

}
