import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { Timecard } from '../timecard.model';
import { TimecardService } from '../timecard.service';

import { Patterns } from '../../shared/patterns.model';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import { ErrorHandler } from '../../shared/error-handler.service';
import { Employee } from '../../employees/employee.model';
import { EmployeeService } from '../../employees/employee.service';
import { AuthService } from '../../login/auth.service';

@Component({
  selector: 'cb-timecard-form',
  templateUrl: './timecard-form.component.html',
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
      ]))),
    ])
  ]
})
@Injectable()
export class TimecardFormComponent implements OnInit {

  typeForm: string
  rowAppearedState = 'ready'
  timecard: Timecard
  timecardForm: FormGroup
  employees: Observable<Employee[]>
  accessNew: boolean = false
  justifyHours: boolean = false

  constructor(
    private timecardService: TimecardService,
    private employeeService: EmployeeService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    let snackBarStateCharging
    this.typeForm = this.route.snapshot.url[0].path
    this.accessNew = this.timecardService.hasAccess('new')

    this.timecardForm = this.formBuilder.group({
      id: this.formBuilder.control(''),
      entry: this.formBuilder.control('', [
        Validators.required
      ]),
      exit: this.formBuilder.control('', [
        Validators.required
      ]),
      employee: this.formBuilder.control('', [
        Validators.required
      ]),
      reason: this.formBuilder.control('')
    })

    if(!this.accessNew) {
      this.timecardForm.controls.employee.setValue(this.authService.currentUser().employee)
      this.timecardForm.controls.employee.disable()
    }

    this.timecardForm.controls.entry.valueChanges
    .debounceTime(500)
    .subscribe((value) => this.checkJustifyHours())
    this.timecardForm.controls.exit.valueChanges
    .debounceTime(500)
    .subscribe((value) => this.checkJustifyHours())

    this.timecardForm.controls.employee.valueChanges
    .do(employeeName => {
        snackBarStateCharging = this.snackBar.open('Aguarde...')
    })
    .debounceTime(500)
    .subscribe(employeeName => {
      this.employees = this.employeeService.employees(employeeName)
      Observable.timer(500).subscribe(timer => snackBarStateCharging.dismiss())
    })

    if(this.typeForm === 'edit') {
      let snackBarStateCharging = this.snackBar.open('Carregando registro...')
      let timecardId = parseInt(this.route.snapshot.url[1].path)
      this.timecardService.timecard(timecardId).subscribe(timecard => {
        snackBarStateCharging.dismiss()
        this.timecard = timecard
        this.timecardForm.controls.entry.setValue(this.timecard.entry.replace(' ','T').substring(0, 16))
        this.timecardForm.controls.exit.setValue(this.timecard.exit.replace(' ','T').substring(0, 16))
        this.timecardForm.controls.employee.setValue(this.timecard.employee)
      })
    }

  }

  checkJustifyHours() {
    let entry = this.timecardForm.controls.entry.value
    let exit = this.timecardForm.controls.exit.value
    let diff = (new Date(exit).getTime() - new Date(entry).getTime())/1000

    if(isNaN(diff)) return

    console.log(diff)

    //9 horas e 15 minutos pra menos e pra mais
    if(diff > 33300 || diff < 31500) {
      this.justifyHours = true
      this.timecardForm.controls.reason.setValidators(Validators.required)
      this.timecardForm.controls.exit.setErrors({})
      this.timecardForm.controls.exit.updateValueAndValidity()
    }  else {
      this.justifyHours = false
      this.timecardForm.controls.reason.setValidators([])
      this.timecardForm.controls.exit.updateValueAndValidity()
    }
  }

  displayEmployee(employee: Employee) {
    return employee.name
  }

  save(timecard: Timecard) {
    if(ErrorHandler.formIsInvalid(this.timecardForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    this.timecardService.save(timecard).subscribe(data => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })
    })
  }

  edit(timecard: Timecard, timecardId: number) {
    if(ErrorHandler.formIsInvalid(this.timecardForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    timecard.id = timecardId

    this.timecardService.edit(timecard).subscribe(data => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })
    })
  }

}

