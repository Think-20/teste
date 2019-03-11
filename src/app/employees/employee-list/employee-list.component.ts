import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { EmployeeService } from '../employee.service';
import { Employee } from '../employee.model';
import { AuthService } from '../../login/auth.service';
import { Pagination } from '../../shared/pagination.model';
import { DataInfo } from '../../shared/data-info.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { API } from '../../app.api';
import { DepartmentService } from '../../department/department.service';
import { PositionService } from '../../position/position.service';
import { Department } from '../../department/department.model';
import { Position } from '../../position/position.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'cb-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
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
export class EmployeeListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  employees: Employee[] = []
  departments: Department[]
  positions: Position[]
  searching = false
  filter: boolean = false
  pagination: Pagination
  pageIndex: number = 0
  dataInfo: DataInfo
  API = API

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private positionService: PositionService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar
  ) { }

  total(employees: Employee[]) {
    return employees.length
  }

  permissionVerify(module: string, employee: Employee): boolean {
    let access: boolean
    switch(module) {
      case 'show': {
        access = employee.id != employee.id ? this.authService.hasAccess('employees/get/{id}') : true
        break
      }
      case 'edit': {
        access = employee.id != employee.id ? this.authService.hasAccess('employee/edit') : true
        break
      }
      case 'toggle-deleted': {
        access = employee.id != employee.id ? this.authService.hasAccess('employee/toggle-deleted/{id}') : true
        break
      }
      default: {
        access = false
        break
      }
    }
    return access
  }

  ngOnInit() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search,
      department: this.fb.control(''),
      position: this.fb.control(''),
    })

    this.loadEmployees({
      deleted: true
    })
    this.loadData()

    this.searchForm.valueChanges
    .pipe(distinctUntilChanged())
    .debounceTime(500)
    .subscribe(() => {
      let controls = this.searchForm.controls
      this.loadEmployees({
        deleted: true,
        search: controls.search.value,
        department: controls.department.value,
        position: controls.position.value,
      })
    })
  }

  loadData() {
    this.departmentService.departments().subscribe((dataInfo) => {
      this.departments = <Department[]> dataInfo.pagination.data
    })
    this.positionService.positions().subscribe((dataInfo) => {
      this.positions = <Position[]> dataInfo.pagination.data
    })
  }

  loadEmployees(params = {}) {
    this.searching = true
    let snackBar = this.snackBar.open('Carregando funcionários...')

    this.employeeService.employees(params).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.employees = <Employee[]> this.pagination.data
      snackBar.dismiss()
    })
  }

  filterToggle() {
    this.filter = this.filter ? false : true
  }

  compareDepartment(var1: Department, var2: Department) {
    return var1.id === var2.id
  }

  comparePosition(var1: Position, var2: Position) {
    return var1.id === var2.id
  }

  toggleDeleted(employee: Employee) {
    let employeeCopy = Object.create(employee)
    this.employeeService.toggleDeleted(employee.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if(data.status) {
        let index = this.employees.indexOf(employee)
        this.employees[index].deleted_at = employeeCopy.deleted_at == null
          ? this.datePipe.transform(new Date(), 'YYYY-MM-DD hh:mm:ss')
          : null
      }
    })
  }

  changePage($event) {
    this.searching = true
    this.employees = []
    let controls = this.searchForm.controls

    this.employeeService.employees(
    {
      deleted: true,
      search: controls.search.value,
      department: controls.department.value,
      position: controls.position.value,
    }, ($event.pageIndex + 1)).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.employees = <Employee[]> this.pagination.data
    })

    this.pageIndex = $event.pageIndex
  }

}
