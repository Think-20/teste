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

@Component({
  selector: 'cb-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css'],
  animations: [
    trigger('rowAppeared', [
      state('ready', style({opacity: 1})),
      transition('void => ready', animate('300ms 0s ease-in', keyframes([
        style({opacity: 0, transform: 'translateX(-30px)', offset: 0}),
        style({opacity: 0.8, transform: 'translateX(10px)', offset: 0.8}),
        style({opacity: 1, transform: 'translateX(0px)', offset: 1})
      ]))),
      transition('ready => void', animate('300ms 0s ease-out', keyframes([
        style({opacity: 1, transform: 'translateX(0px)', offset: 0}),
        style({opacity: 0.8, transform: 'translateX(-10px)', offset: 0.2}),
        style({opacity: 0, transform: 'translateX(30px)', offset: 1})
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
  attendances: Employee[]
  status: JobStatus[]
  searching = false
  filter = false

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private jobService: JobService,
    private jobStatus: JobStatusService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search,
      attendance: this.fb.control('')
    })

    this.jobStatus.jobStatus().subscribe(status => this.status = status)

    /*
    this.employeeService.canInsertClients().subscribe((attendances) => {
      this.attendances = attendances
    })
    */

    this.searching = true
    let snackBar = this.snackBar.open('Carregando jobs...')

    this.jobService.jobs({
      orderBy: 'created_at'
    }).subscribe(pagination => {
      this.pagination = pagination
      this.searching = false
      this.jobs = pagination.data
      snackBar.dismiss()
    })

    this.searchForm.controls.attendance.valueChanges
      .do(() => this.searching = true)
      .debounceTime(500)
      .subscribe(value => {
        this.jobService.jobs().subscribe(pagination => {
          this.pagination = pagination
          this.searching = false
          this.jobs = pagination.data
        })
    })

    this.search.valueChanges
      .do(() => this.searching = true)
      .debounceTime(500)
      .subscribe(value => {
        this.jobService.jobs(value).subscribe(pagination => {
          this.pagination = pagination
          this.searching = false
          this.jobs = pagination.data
        })
    })
  }

  editStatus(event, job: Job) {
    let status = event.value as JobStatus
    let oldStatus = job.status
    job.status = status
    this.jobService.edit(job).subscribe(data => {
      if(data.status == true) {
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

  changePage($event) {
    this.searching = true
    this.jobs = []
    this.jobService.jobs(this.search.value, ($event.pageIndex + 1)).subscribe(pagination => {
      this.pagination = pagination
      this.jobs = pagination.data
      this.searching = false
    })
  }

  delete(job: Job) {
    this.jobService.delete(job.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if(data.status) {
        this.jobs.splice(this.jobs.indexOf(job), 1)
        this.pagination.total = this.pagination.total - 1
      }
    })
  }

}
