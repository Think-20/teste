import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Employee } from '../../employees/employee.model';
import { EmployeeService } from '../../employees/employee.service';
import { JobService } from '../../jobs/job.service';
import { PerformanceReportLite } from './performance-report-lite.model';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'cb-performance-report-lite',
  templateUrl: './performance-report-lite.component.html',
  styleUrls: ['./performance-report-lite.component.css']
})
export class PerformanceReportLiteComponent implements OnInit {

  filterOpen: boolean = true
  searchForm: FormGroup
  performanceLite: PerformanceReportLite
  attendances: Employee[]
  opportunity_quantity_goal: number = 42
  opportunity_value_goal: number = 4500000

  constructor(
    private formBuilder: FormBuilder,
    private jobService: JobService,
    private snackbar: MatSnackBar,
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
    this.listenForm()
  }

  loadData() {
    this.employeeService.employees().subscribe((dataInfo) => {
      let employees = <Employee[]> dataInfo.pagination.data
      this.attendances = employees.filter((employee) => employee.department.description == 'Atendimento')
    })
  }

  listenForm() {
    let snackbar
    this.searchForm.valueChanges
    .do(() => {
      if(!this.searchForm.valid) return

      snackbar = this.snackbar.open('Aguarde...')
    })
    .debounceTime(500)
    .subscribe((params) => {
      if(!this.searchForm.valid) return

      this.jobService.performanceLite(params).subscribe((performanceLite) => {
        this.performanceLite = performanceLite
        snackbar.dismiss()
      })
    })
  }

  percentOpportunityQuantity() {
    return ((this.performanceLite.opportunity_quantity * 100 / this.opportunity_quantity_goal) - 100).toFixed(1)
  }

  percentOpportunityValue() {
    return ((this.performanceLite.opportunity_value * 100 / this.opportunity_value_goal) - 100).toFixed(1)
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }
}
