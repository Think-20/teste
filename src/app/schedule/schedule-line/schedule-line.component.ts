import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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

@Component({
  selector: 'cb-schedule-line',
  templateUrl: './schedule-line.component.html',
  styleUrls: ['./schedule-line.component.css']
})
export class ScheduleLineComponent implements OnInit {

  @Input() month: Month
  @Input() jobStatus: JobStatus[] = []
  @Input() tasks: Task[]
  @Input() chrono: Chrono
  @Input() today: Date
  @Output() scrollStatusEmitter: EventEmitter<boolean> = new EventEmitter()
  @Output() changeMonthEmitter: EventEmitter<any> = new EventEmitter()

  constructor(
    private jobService: JobService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private taskService: TaskService
  ) { }

  ngOnInit() {
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
    if(['Projeto', 'Orçamento'].indexOf(task.job_activity.description) >= 0) {
      this.jobService.delete(task.job.id).subscribe((data) => {
        this.snackBar.open(data.message, '', {
          duration: 5000
        })

        if (data.status) {
          this.changeMonthEmitter.emit({month: this.month, lastDate: lastDate})
        }
      })
    } else {
      this.taskService.delete(task.id).subscribe((data) => {
        this.snackBar.open(data.message, '', {
          duration: 5000
        })

        if (data.status) {
          this.changeMonthEmitter.emit({month: this.month, lastDate: lastDate})
        }
      })
    }
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

  getLineClass(task: Task, day: number, month: number) {
    if(task.job.id == null) {
      return
    }

    let originalTask = this.tasks.filter(taskF => { return taskF.id == task.id }).pop()
    let departmentId = task.responsible.department_id
    let ocurrences = originalTask.items.filter(item => {
      return item.date == this.datePipe.transform(this.today, 'yyyy-MM-dd')
    }).length

    if(ocurrences == 0) {
      return 'department-' + departmentId + '-border'
    }

    return 'department-' + departmentId + '-transparent department-' + departmentId + '-border'
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

  canShowBudgetValue(task: Task, chrono: Chrono) {
    let text = this.jobDisplay(task, chrono)
    if(text == '') {
      return false
    }

    let found = ['Modificação', 'Opção', 'Continuação', 'Continuação de', 'Detalhamento'].indexOf(text) >= 0
    return found ? false : true
  }

}
