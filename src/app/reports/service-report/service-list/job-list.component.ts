import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ReportService } from '../report-list.service';
/* import { Job } from '../report-list.model'; */
/* import { Pagination } from 'app/shared/pagination.model'; */
import { Employee } from '../../../employees/employee.model';
import { EmployeeService } from '../../../employees/employee.service';
import { JobStatus } from 'app/job-status/job-status.model';
import { JobStatusService } from 'app/job-status/job-status.service';
import { distinctUntilChanged, debounceTime, tap, isEmpty } from 'rxjs/operators';
import { Client } from '../../../clients/client.model';
import { AuthService } from '../../../login/auth.service';
import { ClientService } from '../../../clients/client.service';
import { JobType } from '../../../job-types/job-type.model';
import { JobTypeService } from '../../../job-types/job-type.service';
import { ReportsInfo } from '../../../shared/reports-info.model';
import { ReportData } from '../report-list.model';

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
export class ServiceListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  formCopy: any
  search: FormControl
  dataInfo: ReportsInfo
  jobs: ReportsInfo
  /* jobs: Job[] = [] */
  paramAttendance: Employee = null
  attendances: Employee[]
  creations: Employee[]
  clients: Client[]
  status: JobStatus[]
  job_types: JobType[]
  searching = false
  pageIndex: number
  filter = false
  params = {}
  hasFilterActive = false
  isAdmin: boolean = false
  reportData: ReportData;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private clientService: ClientService,
    private jobService: ReportService,
    private jobTypeService: JobTypeService,
    private jobStatus: JobStatusService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.isAdmin = this.authService.hasAccess('job/save')


    this.pageIndex = this.jobService.pageIndex

    this.paramAttendance = this.authService.currentUser().employee.department.description === 'Atendimento'
      ? this.authService.currentUser().employee : null

    this.createForm()
    this.loadInitialData()
  }

  createForm() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search,
      creation: this.fb.control(''),
      job_type: this.fb.control(''),
      client: this.fb.control(''),
      status: this.fb.control(''),
      initial_date: this.fb.control(''),
      final_date: this.fb.control(''),
    })

    if(this.isAdmin)
      this.searchForm.addControl('attendance', this.fb.control({ value: '' }))

    this.formCopy = this.searchForm.value

    if(JSON.stringify(this.jobService.searchValue) == JSON.stringify({})) {
      this.jobService.searchValue = this.searchForm.value
    } else {
      this.searchForm.setValue(this.jobService.searchValue)
    }

    this.searchForm.controls.client.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe(clientName => {
        this.clientService.clients({ search: clientName, attendance: this.paramAttendance }).subscribe((dataInfo) => {
          this.clients = dataInfo.pagination.data
        })
      })

    this.searchForm.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe((searchValue) => {
        this.params = this.getParams(searchValue)
        this.loadJobs(this.params, 1)

        this.pageIndex = 0
        this.jobService.pageIndex = 0
        this.jobService.searchValue = searchValue
        this.updateFilterActive()
      })
  }

  getParams(searchValue) {
    let status = searchValue.status != undefined ? searchValue.status.id : null
    let clientName = searchValue.client != '' ? searchValue.client : searchValue.search
    let attendanceFilter = this.isAdmin ? { attendance: searchValue.attendance } : {}

    return {
      creation: searchValue.creation,
      job_type: searchValue.job_type,
      final_date: searchValue.final_date,
      initial_date: searchValue.initial_date,
      clientName: clientName,
      status: status,
      ...attendanceFilter
    }
  }

  updateFilterActive() {
    if (JSON.stringify(this.jobService.searchValue) === JSON.stringify(this.formCopy)) {
      this.hasFilterActive = false
    } else {
      this.hasFilterActive = true
    }
  }

  clearFilter() {
    this.jobService.searchValue = {}
    this.jobService.pageIndex = 0
    this.pageIndex = 0
    this.createForm()
    this.loadInitialData()
  }

  loadInitialData() {
    if (JSON.stringify(this.jobService.searchValue) === JSON.stringify(this.formCopy)) {
      this.loadJobs({}, this.pageIndex + 1)
    } else {
      this.params = this.getParams(this.jobService.searchValue)
      this.loadJobs(this.params, this.pageIndex + 1)
    }

    this.updateFilterActive()
  }

  loadJobs(params, page: number) {
    if(this.searching) return

    this.searching = true
    let snackBar = this.snackBar.open('Carregando jobs...')
    this.jobService.jobs(params, page).subscribe(dataInfo => {
      this.dataInfo = dataInfo.jobs.data
      this.searching = false
      snackBar.dismiss()
    })
  }
  

 /*  loadFilterData() {
    this.jobStatus.jobStatus().subscribe(status => this.status = status)

    this.jobTypeService.jobTypes().subscribe(job_types => this.job_types = job_types)

    this.employeeService.canInsertClients({
      deleted: true
    }).subscribe((attendances) => {
      this.attendances = attendances
    })

    this.employeeService.employees({
      paginate: false,
      deleted: true
    }).subscribe(dataInfo => {
      let employees = dataInfo.pagination.data
      this.creations = employees.filter(employee => {
        return employee.department.description === 'Criação'
      })
    })
  } */
}
