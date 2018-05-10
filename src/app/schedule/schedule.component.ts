import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { BriefingService } from '../briefings/briefing.service';
import { Briefing } from '../briefings/briefing.model';
import { Pagination } from 'app/shared/pagination.model';
import { Employee } from '../employees/employee.model';
import { EmployeeService } from '../employees/employee.service';

@Component({
  selector: 'cb-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
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
export class ScheduleComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  pagination: Pagination
  briefings: Briefing[] = []
  attendances: Employee[]
  searching = false
  filter = false

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private briefingService: BriefingService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search,
      attendance: this.fb.control('')
    })

    /*
    this.employeeService.canInsertClients().subscribe((attendances) => {
      this.attendances = attendances
    })
    */

    this.searching = true
    let snackBar = this.snackBar.open('Carregando briefings...')

    this.briefingService.briefings().subscribe(pagination => {
      this.pagination = pagination
      this.searching = false
      this.briefings = pagination.data
      snackBar.dismiss()
    })

    this.searchForm.controls.attendance.valueChanges
      .do(() => this.searching = true)
      .debounceTime(500)
      .subscribe(value => {
        this.briefingService.briefings().subscribe(pagination => {
          this.pagination = pagination
          this.searching = false
          this.briefings = pagination.data
        })
    })

    this.search.valueChanges
      .do(() => this.searching = true)
      .debounceTime(500)
      .subscribe(value => {
        this.briefingService.briefings(value).subscribe(pagination => {
          this.pagination = pagination
          this.searching = false
          this.briefings = pagination.data
        })
    })
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }

  changePage($event) {
    this.searching = true
    this.briefings = []
    this.briefingService.briefings(this.search.value, ($event.pageIndex + 1)).subscribe(pagination => {
      this.pagination = pagination
      this.briefings = pagination.data
      this.searching = false
    })
  }

  delete(briefing: Briefing) {
    this.briefingService.delete(briefing.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if(data.status) {
        this.briefings.splice(this.briefings.indexOf(briefing), 1)
        this.pagination.total = this.pagination.total - 1
      }
    })
  }

}
