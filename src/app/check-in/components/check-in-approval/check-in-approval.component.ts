import { OrganizationService } from 'app/shared/services/organization.service';
import { Job } from './../../../reports/service-report/report-list.model';
import { AfterViewInit, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Task } from 'app/schedule/task.model';
import { TaskService } from 'app/schedule/task.service';
import { CheckInOrganizationFormComponent } from '../check-in-organization-form/check-in-organization-form.component';
import { CheckInModel } from 'app/check-in/check-in.model';
import { OrganizationModel } from 'app/shared/models/organization.model';
import { AlertModel } from 'app/shared/models/alert.model';
import { EventModel } from 'app/shared/models/event.model';
import { EventService } from 'app/events/event.service';
import { Event } from 'app/events/event.model';
import { AuthService } from 'app/login/auth.service';

@Component({
  selector: 'cb-check-in-approval',
  templateUrl: './check-in-approval.component.html',
  styleUrls: ['./check-in-approval.component.css']
})
export class CheckInApprovalComponent implements AfterViewInit {

  @Input() job: Job;
  @Input() checkInModel: CheckInModel = new CheckInModel();

  projects: Task[] = [];
  project: Task;

  memorials: Task[] = [];
  memorial: Task;

  budgets: Task[] = [];
  budget: Task;

  events: Event[] = [];
  organizations: OrganizationModel[] = [];

  private get hasAlerts(): boolean {
    return this.checkInModel && !!this.checkInModel.alerts;
  }

  get approval(): AlertModel {
    return this.hasAlerts && this.checkInModel.alerts.approval ? this.checkInModel.alerts.approval : new AlertModel();
  }

  get acceptProposal(): AlertModel {
    return this.hasAlerts && this.checkInModel.alerts.accept_proposal ? this.checkInModel.alerts.accept_proposal : new AlertModel();
  }

  get acceptProduction(): AlertModel {
    return this.hasAlerts && this.checkInModel.alerts.accept_production ? this.checkInModel.alerts.accept_production : new AlertModel();
  }

  get boardApproval(): AlertModel {
    return this.hasAlerts && this.checkInModel.alerts.board_approval ? this.checkInModel.alerts.board_approval : new AlertModel();
  }

  get organization(): OrganizationModel {
    return this.checkInModel && this.checkInModel.organization ? this.checkInModel.organization : new OrganizationModel();
  }

  get event(): EventModel {
    return this.checkInModel && this.checkInModel.event ? this.checkInModel.event : new EventModel();
  }

  constructor(
    private dialog: MatDialog,
    public taskService: TaskService,
    private authService: AuthService,
    private eventService: EventService,
    private organizationService: OrganizationService,
  ) {}

  ngAfterViewInit(): void {
    this.loadEvents();
    this.loadOrganizations();
    this.loadProjects();
    this.loadMemorials();
    this.loadBudgets();
  }

  loadOrganizations(): void {
    this.organizationService.organizations().subscribe({
      next: (response) => {
        this.organizations = response;
      }
    });
  }

  loadEvents(): void {
    this.eventService.events().subscribe({
      next: (response) => {
        this.events = response.pagination.data as Event[];
      }
    });
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

  updateProject(project: Task): void {
    this.project = project;
  }

  updateMemorial(memorial: Task): void {
    this.memorial = memorial;
  }

  updateBudget(budget: Task): void {
    this.budget = budget;
  }

  updateCheckInModel(): void {
    if (!this.checkInModel) {
      return;
    }

    this.checkInModel.project = this.project;
    this.checkInModel.memorial = this.memorial;
    this.checkInModel.budget = this.budget;
  }

  updateAlertDate(alert: AlertModel): void {
    alert.date = new Date().toISOString();    
  }

  updatePromoter(): void {
    this.checkInModel.promoter_changed_by = this.authService.currentUser().employee.name;
    this.checkInModel.promoter_changed_in = new Date().toISOString();
  }

  selectEvent(event: Event): void {
    this.checkInModel.event = {
      event_id: event.id,
      event_name: event.name,
      place_name: event.place.name,
      installation_date: event.ini_date_mounting,
      event_date: event.ini_date,
      dismantling_date: event.ini_date_unmounting,
      changed_by: this.authService.currentUser().employee.name,
      changed_in: new Date().toISOString(),
    };
  }

  selectOrganization(organization: OrganizationModel): void {
    this.checkInModel.organization = {
      id: organization.id,
      name: organization.name,
      login: this.organization.login,
      password: this.organization.password,
      changed_by: this.authService.currentUser().employee.name,
      changed_in: new Date().toISOString(),
    };
  }

  openModalOrganizationForm(): void {
    const modal = this.dialog.open(CheckInOrganizationFormComponent, {
      width: '500px',
    });

    modal.afterClosed().subscribe(result => {
      if (result) {
        this.selectOrganization(result);

        this.loadOrganizations();
      }
    });
  }

  trackByEvent(index: number, event: Event): number {
    return event.id;
  }
}
