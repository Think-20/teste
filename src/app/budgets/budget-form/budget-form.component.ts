import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Budget } from '../budget.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BudgetService } from '../budget.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { ErrorHandler } from '../../shared/error-handler.service';
import { Task } from '../../schedule/task.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../login/auth.service';
import { Job } from 'app/jobs/job.model';

@Component({
  selector: 'cb-budget-form',
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.css']
})
export class BudgetFormComponent implements OnInit {
  budget: Budget
  budgetForm: FormGroup
  total: number = 0
  isAttendance: boolean = false
  isAdmin: boolean = false
  subscription: Subscription

  @Input('typeForm') typeForm: string
  @Input('task') task: Task
  @Input('job') job: Job

  constructor(
    private budgetService: BudgetService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.isAdmin = this.authService.hasAccess('budget/save')
    this.isAttendance = this.job.attendance_id == this.authService.currentUser().employee.id

    this.budget = this.task.budget

    this.budgetForm = this.formBuilder.group({
      id: this.formBuilder.control({ value: (this.budget ? this.budget.id : ''), disabled: true }),
      task_id: this.formBuilder.control({ value: (this.budget ? this.budget.task_id : ''), disabled: true }),
      gross_value: this.formBuilder.control((this.budget ? this.budget.gross_value : ''), [Validators.required]),
      bv_value: this.formBuilder.control((this.budget ? this.budget.bv_value : ''), [Validators.required]),
      equipments_value: this.formBuilder.control((this.budget ? this.budget.equipments_value : ''), [Validators.required]),
      optional_value: this.formBuilder.control((this.budget ? this.budget.optional_value : '')),
      logistics_value: this.formBuilder.control((this.budget ? this.budget.logistics_value : ''), [Validators.required]),
      sales_commission_value: this.formBuilder.control((this.budget ? this.budget.sales_commission_value : '')),
      tax_aliquot: this.formBuilder.control({ value: (this.budget ? this.budget.tax_aliquot : '16.33'), disabled: true }),
      tax_value: this.formBuilder.control({ value: '', disabled: true }),
      others_value: this.formBuilder.control((this.budget ? this.budget.others_value : '')),
      markup_aliquot: this.formBuilder.control((this.budget ? this.budget.markup_aliquot : '35'), [
        Validators.max(100)
      ]),
      markup_value: this.formBuilder.control({ value: '', disabled: true }),
      discount_value: this.formBuilder.control({value: '', disabled: true })
    })

    if(this.isAttendance) {
      this.budgetForm.disable()
    }

    this.setFormConfig()
    this.addEvent()
    this.calculate()
  }

  addEvent() {
    this.subscription = this.budgetForm.valueChanges
    .pipe(distinctUntilChanged())
    .subscribe(() => {
      this.calculate()
    })
  }

  calculate() {
    let controls = this.budgetForm.controls
    let discount_aliquot: number = 0
    let cost = (
      this.getNumber('gross_value')
      + this.getNumber('optional_value')
      + this.getNumber('bv_value')
      + this.getNumber('equipments_value')
      + this.getNumber('logistics_value')
      + this.getNumber('sales_commission_value')
      + this.getNumber('others_value')
    )

    this.total = parseFloat((cost * ((100 + this.getNumber('markup_aliquot')) / 100)).toFixed(2))
    this.subscription.unsubscribe()

    if(this.total > 0) {
      discount_aliquot = this.getNumber('markup_aliquot') >= 35 ? 0.00 : 35.00 - this.getNumber('markup_aliquot')

      controls.discount_value.setValue((this.total * (discount_aliquot) / 100).toFixed(2))
      controls.tax_value.setValue((this.total / parseFloat(controls.tax_aliquot.value)).toFixed(2))
      controls.markup_value.setValue((cost * this.getNumber('markup_aliquot') / 100).toFixed(2))
    } else {
      controls.tax_value.setValue('')
      controls.discount_value.setValue('')
      controls.markup_value.setValue('')
    }

    this.addEvent()
  }

  getNumber(field: string): number {
    let val = this.budgetForm.controls[field].value
    val = val != null && val != '' && val != '0' ? val : 0
    return parseFloat(val)
  }

  setFormConfig() {
    if(this.typeForm == 'show') {
      this.budgetForm.disable()
    } else if(this.budget != null) {
      this.typeForm = 'edit'
    } else {
      this.typeForm = 'new'
    }
  }

  save() {
    this.budgetForm.updateValueAndValidity()
    let budget = this.budgetForm.getRawValue()
    budget.task = this.task

    if (ErrorHandler.formIsInvalid(this.budgetForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    this.budgetService.save(budget).subscribe(data => {
      if (!data.status) {
        let snack = this.snackBar.open(data.message, '', {
          duration: 3000
        })
        return
      }

      let snack = this.snackBar.open('Orçamento salvo com sucesso!', '', {
        duration: 3000
      })
      this.budget = data.budget as Budget
      this.setFormConfig()
    })
  }

  edit() {
    this.budgetForm.updateValueAndValidity()
    let budget = this.budgetForm.getRawValue()
    budget.task = this.task
    budget.id = this.budget.id

    if (ErrorHandler.formIsInvalid(this.budgetForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    this.budgetService.edit(budget).subscribe(data => {
      if (!data.status) {
        let snack = this.snackBar.open(data.message, '', {
          duration: 3000
        })
        return
      }

      let snack = this.snackBar.open('Orçamento editado com sucesso!', '', {
        duration: 3000
      })
      this.budget = data.budget as Budget
      this.setFormConfig()
    })
  }
}
