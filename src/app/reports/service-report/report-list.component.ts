import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ReportService } from '../service-report/report-list.service';
import { Job, JobsDateFilter, ReportData } from '../service-report/report-list.model';
import { Pagination } from 'app/shared/pagination.model';
import { Employee } from '../../employees/employee.model';
import { EmployeeService } from '../../employees/employee.service';
import { JobStatus } from 'app/job-status/job-status.model';
import { JobStatusService } from 'app/job-status/job-status.service';
import { distinctUntilChanged, debounceTime, tap, isEmpty } from 'rxjs/operators';
import { Client } from '../../clients/client.model';
import { AuthService } from '../../login/auth.service';
import { ClientService } from '../../clients/client.service';
import { JobType } from '../../job-types/job-type.model';
import { JobTypeService } from '../../job-types/job-type.service';
import { DataInfo } from '../../shared/data-info.model';
import { Month, MONTHS } from 'app/shared/date/months';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'cb-job-list',
  templateUrl: './service-list/job-list.component.html',
  styleUrls: ['./service-list/job-list.component.css'],
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
export class ServiceReportComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  formCopy: any
  search: FormControl
  pagination: Pagination
  jobs: Job[] = []
  dataInfo: DataInfo
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
  date: Date;
  month: Month;
  year: number;
  years: number[] = []
  jobsDateFilter: JobsDateFilter[];
  iniDate: Date;
  finDate: Date;
  months: Month[] = MONTHS

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private clientService: ClientService,
    private jobService: ReportService,
    private jobTypeService: JobTypeService,
    private jobStatus: JobStatusService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    ) { }

  ngOnInit() {
    this.isAdmin = this.authService.hasAccess('job/save')

    this.pageIndex = this.jobService.pageIndex

    this.paramAttendance = this.authService.currentUser().employee.department.description === 'Atendimento'
      ? this.authService.currentUser().employee : null

    this.createForm()
    this.setYears()
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
      date_init: this.fb.control(''),
      date_end: this.fb.control(''),
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
        this.changeMonth()
      })
  }

  getParams(searchValue) {
    let status = searchValue.status != undefined ? searchValue.status.id : null
    let clientName = searchValue.client != '' ? searchValue.client : searchValue.search
    let attendanceFilter = this.isAdmin ? { attendance: searchValue.attendance } : {}

    return {
      //creation: searchValue.creation,
      //job_type: searchValue.job_type,
      date_end: searchValue.date_end,
      date_init: searchValue.date_init,
      name: clientName,
      //status: status,
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
    this.setDataByParams()
  }

  loadJobs(params, page: number) {
    if(this.searching) return
    
    this.searching = true
    let snackBar = this.snackBar.open('Carregando jobs...')
    this.jobService.jobs(params, page).subscribe(dataInfo => {
      dataInfo.jobs ? this.jobs = dataInfo.jobs.data : this.jobs = []
      this.pagination = dataInfo.jobs;
      this.reportData = (dataInfo as unknown as ReportData);
      this.searching = false
      snackBar.dismiss()
    })
  }

  changePage($event) {
    this.searching = true
    this.jobs = []
    this.jobService.jobs(this.jobService.searchValue, ($event.pageIndex + 1)).subscribe(dataInfo => {
      this.dataInfo = dataInfo.jobs
      this.pagination = dataInfo.jobs
      this.jobs = dataInfo.jobs.data
      this.searching = false
      this.pageIndex = $event.pageIndex
      this.jobService.pageIndex = this.pageIndex
    })
  }

  /* loadFilterData() {
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

  addMonth(inc: number) {
    this.date.setDate(1)
    this.date.setMonth(this.date.getMonth() + inc)
    this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1))
    this.year = this.date.getFullYear()

    this.changeMonth()
  }

  changeMonth() {
    if(this.searching) return;

    this.searching = true
    let snackBar = this.snackBar.open('Carregando tarefas...')

    this.jobs = []
    this.jobsDateFilter = []

    this.iniDate = new Date(this.year + '-' + this.month.id + '-' + this.date.getDate())
    this.finDate = new Date(this.year + '-' + this.month.id + '-' + this.date.getDate())

    const urlTree = this.router.createUrlTree([], {
      queryParams: { date: this.datePipe.transform(this.iniDate, 'yyyy-MM-dd') },
      queryParamsHandling: "merge",
      preserveFragment: true
    });

    this.iniDate.setDate(this.iniDate.getDate() - 10)
    this.finDate.setDate(this.finDate.getDate() + 10)

    this.router.navigateByUrl(urlTree)

    this.jobService.jobs({
      date_initi: this.datePipe.transform(this.iniDate, 'yyyy-MM-dd'),
      date_end: this.datePipe.transform(this.finDate, 'yyyy-MM-dd'),
      paginate: false,
      ...this.params
    }).subscribe(dataInfo => {
      dataInfo.jobs ? this.jobs = dataInfo.jobs.data : this.jobs = []
      this.pagination = dataInfo.jobs;
      this.reportData = (dataInfo as unknown as ReportData);
      this.searching = false
      snackBar.dismiss()
    })
  }

  updateMonth(month: Month) {
    this.month = month
    this.changeMonth()
  }

  updateYear(year: number) {
    this.year = year
    this.changeMonth()
  }

  setYears() {
    let ini = 2018
    let year = (new Date).getFullYear()

    while (ini <= (year + 1)) {
      this.years.push(ini)
      ini += 1
    }
  }

  setDataByParams() {
    this.date = new Date()

    this.route.queryParams.subscribe(params => {
      if (params.date != undefined) {
        this.date = new Date(params.date + "T00:00:00")
        this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1))
        this.year = this.date.getFullYear()
      } else {
        this.date = new Date(this.datePipe.transform(new Date, 'yyyy-MM-dd') + "T00:00:00")
        this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1))
        this.year = this.date.getFullYear()
      }

      this.changeMonth()
    })
  }

}
