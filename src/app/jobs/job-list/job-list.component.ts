import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { JobService } from '../job.service';
import { Job } from '../job.model';
import { Pagination } from 'app/shared/pagination.model';
import { Employee } from '../../employees/employee.model';
import { EmployeeService } from '../../employees/employee.service';
import { JobStatus } from 'app/job-status/job-status.model';
import { JobStatusService } from 'app/job-status/job-status.service';
import { distinctUntilChanged, debounceTime, tap } from 'rxjs/operators';
import { Client } from '../../clients/client.model';
import { AuthService } from '../../login/auth.service';
import { ClientService } from '../../clients/client.service';
import { JobType } from '../../job-types/job-type.model';
import { JobTypeService } from '../../job-types/job-type.service';

@Component({
  selector: 'cb-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css'],
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
@Injectable()
export class JobListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  pagination: Pagination
  jobs: Job[] = []
  paramAttendance: Employee = null
  attendances: Employee[]
  creations: Employee[]
  clients: Client[]
  status: JobStatus[]
  job_types: JobType[]
  searching = false
  pageIndex: number = 0
  filter = false
  isAdmin: boolean = false

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private clientService: ClientService,
    private jobService: JobService,
    private jobTypeService: JobTypeService,
    private jobStatus: JobStatusService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.isAdmin = this.authService.hasAccess('job/save')

    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search,
      attendance: this.fb.control({value: '', disabled: !this.isAdmin}),
      creation: this.fb.control(''),
      job_type: this.fb.control(''),
      client: this.fb.control(''),
      status: this.fb.control('')
    })

    this.loadFilterData()
    this.paramAttendance = this.authService.currentUser().employee.department.description === 'Atendimento'
    ? this.authService.currentUser().employee : null

    this.searching = true

    this.searchForm.controls.client.valueChanges
    .pipe(distinctUntilChanged(), debounceTime(500))
    .subscribe(clientName => {
      this.clientService.clients({ search: clientName, attendance: this.paramAttendance }).subscribe((dataInfo) => {
        this.clients = dataInfo.pagination.data
      })
    })

    let snackBar = this.snackBar.open('Carregando jobs...')
    this.jobService.jobs().subscribe(pagination => {
      this.pagination = pagination
      this.searching = false
      this.jobs = pagination.data
      snackBar.dismiss()
    })

    let snackbar
    this.searchForm.valueChanges
      .do(() => snackbar = this.snackBar.open('Carregando jobs...') )
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe(() => {
        let controls = this.searchForm.controls
        let status = controls.status.value != undefined ? controls.status.value.id : null
        let clientName = controls.client.value != '' ? controls.client.value : controls.search.value

        this.jobService.jobs({
          clientName: clientName,
          status: status,
          attendance: controls.attendance.value,
          creation: controls.creation.value,
          job_type: controls.job_type.value
        }).subscribe(pagination => {
          snackbar.dismiss()
          this.pagination = pagination
          this.searching = false
          this.jobs = pagination.data
          snackBar.dismiss()
        })
      })
  }

  loadFilterData() {
    this.jobStatus.jobStatus().subscribe(status => this.status = status)

    this.jobTypeService.jobTypes().subscribe(job_types => this.job_types = job_types)

    this.employeeService.canInsertClients().subscribe((attendances) => {
      this.attendances = attendances
    })

    this.employeeService.employees().subscribe(dataInfo => {
      let employees = dataInfo.pagination.data
      this.creations = employees.filter(employee => {
        return employee.department.description === 'Criação'
      })
    })
  }

  editStatus(event, job: Job) {
    let status = event.value as JobStatus
    let oldStatus = job.status
    job.status = status
    this.jobService.edit(job).subscribe(data => {
      if (data.status == true) {
        this.snackBar.open('Atualizado com sucesso!', '', {
          duration: 3000
        })
      } else {
        job.status = oldStatus
        this.snackBar.open('Erro ao atualizar.', '', {
          duration: 3000
        })
      }
    })
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }

  compareStatus(var1: JobStatus, var2: JobStatus) {
    return var1.id === var2.id
  }

  compareJobType(var1: JobType, var2: JobType) {
    return var1.id === var2.id
  }

  changePage($event) {
    this.searching = true
    this.jobs = []
    this.jobService.jobs(this.search.value, ($event.pageIndex + 1)).subscribe(pagination => {
      this.pagination = pagination
      this.jobs = pagination.data
      this.searching = false
    })
    this.pageIndex = $event.pageIndex
  }

  delete(job: Job) {
    this.jobService.delete(job.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if (data.status) {
        this.jobs.splice(this.jobs.indexOf(job), 1)
        this.pagination.total = this.pagination.total - 1
      }
    })
  }

}
