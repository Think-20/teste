import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Chrono } from '../chrono.model';
import { Task } from '../task.model';
import { DatePipe } from '@angular/common';
import { TaskService } from '../task.service';
import { AuthService } from '../../login/auth.service';
import { Job } from '../../jobs/job.model';
import { JobService } from '../../jobs/job.service';
import { JobStatus } from '../../job-status/job-status.model';
import { MatSnackBar } from '@angular/material';
import { Month } from '../../shared/date/months';
import { Router } from '@angular/router';
import { isObject } from 'util';
import { MatMenuTrigger } from '@angular/material';

@Component({
  selector: 'cb-schedule-line',
  templateUrl: './schedule-line.component.html',
  styleUrls: ['./schedule-line.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleLineComponent implements OnInit {

  @Input() month: Month
  @Input() paramsHasFilter: boolean = false
  @Input() date: Date
  @Input() jobStatus: JobStatus[] = []
  @Input() tasks: Task[]
  @Input() chrono: Chrono
  @Input() today: Date
  @Output() scrollStatusEmitter: EventEmitter<boolean> = new EventEmitter()
  @Output() changeMonthEmitter: EventEmitter<any> = new EventEmitter()
  @ViewChild(MatMenuTrigger) menu: MatMenuTrigger;

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

  timeDisplay(task: Task, chrono: Chrono) {
    if(task.job.id == null) {
      return ''
    }

    let index = task.items.findIndex(arrayItem => {
      let date = new Date(arrayItem.date + "T00:00:00")
      return chrono.day == date.getDate()
    })
    let taskFound = this.tasks.find(arrayTask => { return task.id == arrayTask.id })

    if(taskFound == null) {
      return
    }

    return 'D+' + (taskFound.items.length - index - 1)
  }

  timeIconDisplay(task: Task, chrono: Chrono) {
    if(task.job.id == null) {
      return ''
    }

    if(task.project_file_done == 1) {
      return 'done'
    } else {
      let finalDate = new Date(task.available_date + 'T00:00:00')
      finalDate.setDate(finalDate.getDate() + (parseInt(task.duration.toString()) - 1))

      if(this.datePipe.transform(finalDate, 'yyyy-MM-dd') < this.datePipe.transform(new Date(), 'yyyy-MM-dd')) {
        return 'alarm'
      } else {
        return 'access_alarm'
      }
    }
  }

  getQueryParams(task: Task) {
    switch(task.job_activity.description) {
      case 'Projeto': return { taskId: task.id, tab: 'project' }
      case 'Memorial descritivo': return { taskId: task.id, tab: 'specification' }
      default: return ''
    }
  }

  signal(task: Task) {
    this.scrollStatusEmitter.emit(false)
    let job = task.job
    let oldStatus = job.status
    let wanted = job.status.id == 5 ? 1 : 5
    let wantedStatus = this.jobStatus.filter(s => { return s.id == wanted }).pop()
    job.status = wantedStatus

    this.jobService.edit(job).subscribe((data) => {
      this.scrollStatusEmitter.emit(true)
      if(data.status) {
        this.snackBar.open('Sinalização modificada com sucesso!', '', {
          duration: 3000
        })
      } else {
        job.status = oldStatus
      }
    })
  }

  delete(task: Task) {
    let lastDate = new Date(task.available_date + "T00:00:00")
    this.taskService.delete(task.id).subscribe((data) => {
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

  getLineClass(chrono: Chrono, task: Task, day: number, month: number, nextIndex: number) {
    let className = ''

    if(task.job.id == null) {
      return className
    }

    if(task.job.attendance_id != this.authService.currentUser().employee.id
      && task.responsible_id != this.authService.currentUser().employee.id
      && task.job.id != undefined && !this.permissionVerify('edit', task.job))
      className += ' other-attendance'

    if(isObject(task.job_activity)
      && ['Projeto', 'Orçamento', 'Outsider'].indexOf(task.job_activity.description) >= 0
      && this.jobDisplay(task, chrono).indexOf('Continuação de') == -1) {

        if(task.job.status.id == 3 && (['Projeto', 'Outsider'].indexOf(task.job_activity.description) >= 0))
          className += ' approved-creation'

        if(task.job.status.id == 3 && (['Orçamento'].indexOf(task.job_activity.description) >= 0))
          className += ' approved-budget'

        if(task.job.status.id == 3 && (['Orçamento'].indexOf(task.job_activity.description) >= 0))
          className += ' approved-budget'

        if(task.job.status.id == 5)
          className += ' signal'

        if(this.paramsHasFilter && task.job.id == null)
          className += ' hidden'
    }

    if(isObject(chrono.tasks[nextIndex + 1])
    &&['Projeto', 'Orçamento'].indexOf(chrono.tasks[nextIndex + 1].job_activity.description) >= 0
      && [5,3].indexOf(chrono.tasks[nextIndex + 1].job.status_id) >= 0
      && this.jobDisplay(task, chrono).indexOf('Continuação de') == -1)
    {
      className += ' no-border'
    }

    let originalTask = this.tasks.filter(taskF => { return taskF.id == task.id }).pop()
    let departmentId = task.responsible.department_id
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

  jobDisplay(task: Task, chrono: Chrono) {
    if(task.job.id == null) {
      return ''
    }

    let date = new Date(task.available_date + 'T00:00:00')

    if(date.getDate() != chrono.day) {
      return 'Continuação de ' + this.taskService.jobDisplay(task).toLowerCase()
    }

    return this.taskService.jobDisplay(task)
  }

  calcValue(job: Job) {
    let text = 0.00

    if(job.area > 0) {
      text = parseFloat((job.budget_value / job.area).toFixed(2))
    }

    return text
  }

  canShowDetails(task: Task, chrono: Chrono) {
    const available = ['Modificação', 'Opção', 'Continuação', 'Continuação de', 'Detalhamento', 'M. descritivo']
    let text = this.jobDisplay(task, chrono)
    if(text == '') {
      return false
    }

    let found = false

    available.forEach((value) => {
      if(text.indexOf(value) >= 0) found = true
    })

    return found ? false : true
  }

}
