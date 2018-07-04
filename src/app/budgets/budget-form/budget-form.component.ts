import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Budget } from '../budget.model';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { BudgetService } from '../budget.service';
import { UploadFileService } from '../../shared/upload-file.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from '../../employees/employee.model';
import { MatSnackBar } from '@angular/material';

import { ErrorHandler } from '../../shared/error-handler.service';
import { Patterns } from '../../shared/patterns.model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import { isUndefined, isObject } from 'util';
import { Job } from '../../jobs/job.model';

@Component({
  selector: 'cb-budget-form',
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.css']
})
export class BudgetFormComponent implements OnInit {
  availableDateParam: string
  @Input('typeForm') typeForm: string
  @Input('job') job: Job
  budgets: Budget[]
  @Input('budget') budget: Budget
  budgetForm: FormGroup
  responsibles: Employee[]
  @Input('isAdmin') isAdmin: boolean = false
  @ViewChild('responsible') responsibleSelect

  constructor(
    private budgetService: BudgetService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  ngOnChanges() {
    this.ngOnInit()
  }

  ngOnInit() {
    this.budgetForm = this.formBuilder.group({
      id: this.formBuilder.control({ value: '', disabled: true }),
      available_date: this.formBuilder.control('', [Validators.required]),
      responsible: this.formBuilder.control('', [Validators.required]),
    })

    this.availableDateParam = this.typeForm == 'new' ? this.route.snapshot.params['available_date'] : ''

    if(this.job != null && this.job['budget'] != null) {
      this.budget = this.job['budget']
      this.loadDefaultData(this.budget)
    } else {
      this.loadDefaultData()
    }

    if(this.typeForm == 'show') {
      this.budgetForm.disable()
    }
  }

  toggleCreation() {
    if (!this.isAdmin) {
      this.responsibleSelect.close()
    }
  }

  loadDefaultData(budget: Budget = null) {
    let snackBarStateCharging = this.snackBar.open('Aguarde...')
    this.budgetService.loadFormData().subscribe((response) => {
      let data = response.data
      this.responsibles = data.responsibles

      if (this.availableDateParam == '' || this.availableDateParam == undefined) {
        this.budgetForm.controls.responsible.setValue(data.responsible)
        this.budgetForm.controls.available_date.setValue(data.available_date)

        snackBarStateCharging.dismiss()
        //snackBarStateCharging = this.snackBar.open('Considerando que o tempo de produção seja 1 dia, ' + data.responsible.name + ' foi selecionado.', '', {
          //duration: 2000
        //})

      } else {
        snackBarStateCharging.dismiss()
        this.budgetForm.controls.available_date.setValue(this.availableDateParam)
      }

      if(budget != null) {
        this.loadBudgetInForm(budget)
      }
    })
  }

  loadBudget() {
    let budget = null
    this.loadBudgetInForm(budget)
  }

  loadBudgetInForm(budget: Budget) {
    this.budgetForm.controls.available_date.setValue(budget.available_date)
    this.budgetForm.controls.responsible.setValue(budget.responsible)
  }

  compareResponsible(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }

  save() {
    this.budgetForm.updateValueAndValidity()
    let budget = this.budgetForm.value
    budget.job = this.job

    if (ErrorHandler.formIsInvalid(this.budgetForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    this.budgetService.save(budget).subscribe(data => {
      if (data.status) {
        this.budget = data.budget as Budget
        let snack = this.snackBar.open('Orçamento salvo com sucesso, redirecionando para o cronograma.', '', {
          duration: 3000
        })
        snack.afterDismissed().subscribe(() => {
          this.router.navigateByUrl('/schedule')
        })
      } else {
        this.snackBar.open(data.message, '', {
          duration: 5000
        })
      }

    })
  }

  edit() {
    this.budgetForm.updateValueAndValidity()
    let budget = this.budgetForm.value
    budget.id = this.budget.id

    if (ErrorHandler.formIsInvalid(this.budgetForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    this.budgetService.edit(budget).subscribe(data => {
      this.snackBar.open(data.message, '', {
        duration: data.status ? 1000 : 5000
      }).afterDismissed().subscribe(observer => {
        if (data.status) {
          this.router.navigateByUrl('/schedule')
        }
      })
    })
  }
}
