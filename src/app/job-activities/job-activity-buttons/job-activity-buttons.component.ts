import { Component, OnInit, Input } from '@angular/core';
import { JobActivity } from '../job-activity.model';
import { TaskService } from 'app/schedule/task.service';
import { Task } from 'app/schedule/task.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'cb-job-activity-buttons',
  templateUrl: './job-activity-buttons.component.html',
  styleUrls: ['./job-activity-buttons.component.css']
})
export class JobActivityButtonsComponent implements OnInit {

  @Input() task: Task;
  @Input() jobActivity: JobActivity;

  constructor(
    private taskService: TaskService,
    private datePipe: DatePipe,
    private snackbar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
  }

  insertModification() {
    this.insertDerived(this.jobActivity.modification)
  }

  insertOption() {
    this.insertDerived(this.jobActivity.option)
  }

  insertDerived(jobActivity: JobActivity) {
    this.taskService.insertDerived({
      task: this.task,
      job_activity: jobActivity
    }).subscribe((data) => {
      let message = data.status ? 'Redirecionando para o cronograma...' : data.message;
      this.snackbar.open(message, '', {
        duration: 5000
      }).afterDismissed().subscribe(() => {
        const task: Task = data.task
        if(data.status) {
          this.router.navigateByUrl('/schedule?date=' + this.datePipe.transform(task.items[0].date, 'yyyy-MM-dd'))
        }
      })
    })
  }

}
