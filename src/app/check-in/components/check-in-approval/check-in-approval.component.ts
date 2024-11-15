import { OrganizationService } from 'app/shared/services/organization.service';
import { Job } from './../../../reports/service-report/report-list.model';
import { AfterViewInit, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Task } from 'app/schedule/task.model';
import { TaskService } from 'app/schedule/task.service';
import { CheckInOrganizationFormComponent } from '../check-in-organization-form/check-in-organization-form.component';
import { CheckInModel } from 'app/check-in/check-in.model';
import { OrganizationModel } from 'app/shared/models/organization.model';
import { EventService } from 'app/events/event.service';
import { Event } from 'app/events/event.model';
import { AuthService } from 'app/login/auth.service';
import { Place } from 'app/places/place.model';
import { DatePipe } from '@angular/common';
import { Employee } from 'app/employees/employee.model';

@Component({
  selector: 'cb-check-in-approval',
  templateUrl: './check-in-approval.component.html',
  styleUrls: ['./check-in-approval.component.css']
})
export class CheckInApprovalComponent implements AfterViewInit {
  @Input() job: Job;
  @Input() checkInModel: CheckInModel = new CheckInModel();
  @Input() employees: Employee[] = [];

  employeeId: number;

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

  constructor(
    private dialog: MatDialog,
    private datePipe: DatePipe, 
    public taskService: TaskService,
    private authService: AuthService,
    private eventService: EventService,
    private organizationService: OrganizationService,
  ) {
    this.employeeId = authService.currentUser().employee.id;
  }

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

  validateAlertDateApproval(event: PointerEvent): void {
    if (this.employeeId != this.job.attendance.id) {
      event.preventDefault();
    }
  }

  updateAlertDateApproval(): void {
    this.checkInModel.approval_employee_id = this.employeeId;
    this.checkInModel.approval_date = this.getCurrentDate();
  }

  validateAlertDateAcceptClient(event: PointerEvent): void {
    event.preventDefault();
  }

  validateAlertDateAcceptProposal(event: PointerEvent): void {
    if (this.employeeId != 11) {
      event.preventDefault();
    }
  }

  updateAlertDateAcceptProposal(): void {
    this.checkInModel.accept_proposal_employee_id = this.employeeId;
    this.checkInModel.accept_proposal_date = this.getCurrentDate();
  }

  validateAlertDateAcceptProduction(event: PointerEvent): void {
    if (this.employeeId != 20) {
      event.preventDefault();
    }
  }

  updateAlertDateAcceptProduction(): void {
    this.checkInModel.accept_production_employee_id = this.employeeId;
    this.checkInModel.accept_production_date = this.getCurrentDate();
  }

  validateAlertDateBoardApproval(event: PointerEvent): void {
    if (this.authService.currentUser().employee.department_id != 1) {
      event.preventDefault();
    }
  }

  validateAlertDateFinancialAcceptance(event: PointerEvent): void {
    if (this.authService.currentUser().employee.department_id != 1) {
      event.preventDefault();
    }
  }

  updateAlertDateBoardApproval(): void {
    this.checkInModel.board_approval_employee_id = this.employeeId;
    this.checkInModel.board_approval_date = this.getCurrentDate();
  }

  updateAlertDateFinancialAcceptance(): void {
    this.checkInModel.financial_acceptance_employee_id = this.employeeId;
    this.checkInModel.financial_acceptance_date = this.getCurrentDate();
  }

  updateOrganization(): void {
    this.checkInModel.organization_changed_by = this.employeeId;
    this.checkInModel.organization_changed_in = this.getCurrentDate();
  }

  updatePromoter(): void {
    this.checkInModel.promoter_changed_by = this.employeeId;
    this.checkInModel.promoter_changed_in = this.getCurrentDate();
  }

  updateEvent(): void {
    this.checkInModel.event_changed_by = this.employeeId;
    this.checkInModel.event_changed_in = this.getCurrentDate();
  }

  private getCurrentDate(): string {
    return this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
  }

  getEmployeeName(id: number): string {
    if (!id) {
      return '';
    }

    const index = this.employees.findIndex(x => x.id == id);

    if (index >= 0) {
      return this.employees[index].name;
    }
    
    return '';
  }

  getClientName() {
    if (this.job && this.job.agency) {
      return this.job.agency.fantasy_name;
    }

    if (this.job && this.job.client) {
      return this.job.client.fantasy_name;
    }
    
    return '-';
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
