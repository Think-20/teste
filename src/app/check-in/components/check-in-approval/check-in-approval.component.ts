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
import { EventService } from 'app/events/event.service';
import { Event } from 'app/events/event.model';
import { AuthService } from 'app/login/auth.service';
import { Place } from 'app/places/place.model';

@Component({
  selector: 'cb-check-in-approval',
  templateUrl: './check-in-approval.component.html',
  styleUrls: ['./check-in-approval.component.css']
})
export class CheckInApprovalComponent implements AfterViewInit {

  @Input() job: Job;
  @Input() checkInModel: CheckInModel = new CheckInModel();

  projects: Task[] = [];
  get project(): Task {
    const index = this.projects.findIndex(x => x.id === this.checkInModel.project);

    if (index >= 0) {
      return this.projects[index];
    }

    return null;
  }

  memorials: Task[] = [];
  get memorial(): Task {
    const index = this.memorials.findIndex(x => x.id === this.checkInModel.memorial);

    if (index >= 0) {
      return this.memorials[index];
    }

    return null;
  }

  budgets: Task[] = [];
  get budget(): Task {
    const index = this.budgets.findIndex(x => x.id === this.checkInModel.budget);

    if (index >= 0) {
      return this.budgets[index];
    }

    return null;
  }

  events: Event[] = [];
  get selectedEvent(): Event {
    const index = this.events.findIndex(x => x.id === this.checkInModel.event_id);

    if (index >= 0) {
      return this.events[index];
    }

    return new Event();
  }

  get place(): Place {
    if (this.checkInModel.event_id) {
      return this.selectedEvent.place;
    }

    return new Place();
  }

  organizations: OrganizationModel[] = [];
  get organization(): OrganizationModel {
    const index = this.organizations.findIndex(x => x.id === this.checkInModel.organization_id);

    if (index >= 0) {
      return this.organizations[index];
    }

    return new OrganizationModel();
  }

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

  updateAlertDate(alert: AlertModel): void {
    alert.date = new Date().toISOString();    
  }

  updateOrganization(): void {
    this.checkInModel.organization_changed_by = this.authService.currentUser().employee.name;
    this.checkInModel.organization_changed_in = new Date().toISOString();
  }

  updatePromoter(): void {
    this.checkInModel.promoter_changed_by = this.authService.currentUser().employee.name;
    this.checkInModel.promoter_changed_in = new Date().toISOString();
  }

  updateEvent(): void {
    this.checkInModel.event_changed_by = this.authService.currentUser().employee.name;
    this.checkInModel.event_changed_in = new Date().toISOString();
  }

  openModalOrganizationForm(): void {
    const modal = this.dialog.open(CheckInOrganizationFormComponent, {
      width: '500px',
    });

    modal.afterClosed().subscribe((result?: OrganizationModel) => {
      if (result) {
        this.checkInModel.organization_id = result.id;
        
        this.updateOrganization();
        
        this.loadOrganizations();
      }
    });
  }

  trackByEvent(index: number, event: Event): number {
    return event.id;
  }
}
