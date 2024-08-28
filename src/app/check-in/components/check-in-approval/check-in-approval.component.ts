import { Job } from './../../../reports/service-report/report-list.model';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Task } from 'app/schedule/task.model';
import { TaskService } from 'app/schedule/task.service';
import { CheckInOrganizationFormComponent } from '../check-in-organization-form/check-in-organization-form.component';

@Component({
  selector: 'cb-check-in-approval',
  templateUrl: './check-in-approval.component.html',
  styleUrls: ['./check-in-approval.component.css']
})
export class CheckInApprovalComponent implements OnInit, AfterViewInit {

  @Input() job: Job;

  projects: Task[];
  memorials: Task[];
  budgets: Task[];

  constructor(
    private dialog: MatDialog,
    private taskService: TaskService,
  ) {}

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.loadProjects();
    this.loadMemorials();
    this.loadBudgets();
  }

  compareProject(var1: Task, var2: Task) : boolean {
    return var1.id === var2.id;
  }

  compareMemorial(var1: Task, var2: Task) : boolean {
    return var1.task.id === var2.task.id;
  }


  loadProjects() : void {
    this.projects = this.job.tasks.filter((task) => {
      return task.job_activity.initial == 1
    });

    let adds = [];

    this.projects.filter((parentTask => {
      let temp = this.job.tasks.filter((task) => {
        return parentTask.job_activity.modification_id == task.job_activity_id
          || parentTask.job_activity.option_id == task.job_activity_id
      });

      adds = adds.concat(temp);
      adds = adds.sort((a, b) => a.reopened - b.reopened);
    }));

    this.projects = this.projects.concat(adds).reverse();
  }

  loadMemorials() : void {
    this.memorials = this.job.tasks.filter((task) => {
      return ['Memorial descritivo'].indexOf(task.job_activity.description) >= 0;
    });
  }

  loadBudgets() : void {
    this.budgets = this.job.tasks.filter((task) => {
      return task.job_activity.initial == 1;
    });

    let adds = [];

    this.budgets.filter((parentTask => {
      let temp = this.job.tasks.filter((task) => {
        return parentTask.job_activity.modification_id == task.job_activity_id
          || parentTask.job_activity.option_id == task.job_activity_id
      });

      adds = adds.concat(temp.reverse())
    }));

    this.budgets = this.budgets.concat(adds).reverse();
  }

  openModalOrganizationForm(): void {
    const modal = this.dialog.open(CheckInOrganizationFormComponent, {
      width: '500px',
    });

    modal.afterClosed().subscribe(result => {
      console.log('The modal was closed');
    });
  }

}
