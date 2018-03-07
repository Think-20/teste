import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { TimecardService } from '../timecard.service';
import { Timecard } from '../timecard.model';
import { Employee } from '../../employees/employee.model';
import { EmployeeService } from '../../employees/employee.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'cb-timecard-list',
  templateUrl: './timecard-list.component.html',
  styleUrls: ['./timecard-list.component.css'],
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
export class TimecardListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  employees: Employee[]
  timecards: Timecard[] = []
  accessList: boolean = false
  accessEdit: boolean = false
  accessDelete: boolean = false
  searching = false

  constructor(
    private fb: FormBuilder,
    private timecardService: TimecardService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.accessList = this.timecardService.hasAccess('list')
    this.accessEdit = this.timecardService.hasAccess('edit')
    this.accessDelete = this.timecardService.hasAccess('delete')

    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search
    })

    if(!this.accessList) {
      this.search.disable()
      this.searching = true
      this.timecardService.timecards().subscribe((pagination) => {
        this.timecards = <Timecard[]> pagination.data
        this.searching = false
      })
    }

    this.search.valueChanges
      .debounceTime(500)
      .subscribe(value => {
        if(!(value instanceof Object)) {
          this.searching = true
          this.employeeService.employees(value).subscribe((employees) => {
            this.employees = employees
            this.searching = false
          })
        } else {
          this.searching = true
          let snackBar = this.snackBar.open('Carregando registros...')
          let employee = <Employee> value
          this.timecardService.timecards(employee).subscribe(pagination => {
            this.searching = false
            this.timecards = <Timecard[]> pagination.data
            snackBar.dismiss()
          })
        }
    })
  }

  delete(timecard: Timecard) {
    this.timecardService.delete(timecard.id).subscribe(() => {
      this.timecards.splice(this.timecards.indexOf(timecard), 1)
    })
  }

  displayEmployee(employee: Employee) {
    return employee.name
  }

}
