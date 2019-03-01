import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Employee } from '../../employees/employee.model';
import { EmployeeService } from '../../employees/employee.service';

@Component({
  selector: 'cb-performance-report-lite',
  templateUrl: './performance-report-lite.component.html',
  styleUrls: ['./performance-report-lite.component.css']
})
export class PerformanceReportLiteComponent implements OnInit {

  filterOpen: boolean = true
  searchForm: FormGroup
  attendances: Employee[]

  constructor(
    private formBuilder: FormBuilder,
    private employeeService: EmployeeService
  ) { }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      initial_date: this.formBuilder.control('', [
        Validators.required
      ]),
      final_date: this.formBuilder.control('', [
        Validators.required
      ]),
      time_to_analyze: this.formBuilder.control('', [
        Validators.required
      ]),
      attendances: this.formBuilder.control('')
    })

    this.loadData()
  }

  loadData() {
    this.employeeService.employees().subscribe((dataInfo) => {
      let employees = <Employee[]> dataInfo.pagination.data
      this.attendances = employees.filter((employee) => employee.department.description == 'Atendimento')
    })
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }
}
