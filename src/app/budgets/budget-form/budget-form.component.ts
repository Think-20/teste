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

@Component({
  selector: 'cb-budget-form',
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.css']
})
export class BudgetFormComponent implements OnInit {
  budget: Budget
  budgetForm: FormGroup
  total: number = 0
  subscription: Subscription

  @Input('typeForm') typeForm: string
  @Input('task') task: Task
  @Input('isAdmin') isAdmin: boolean = false

  constructor(
    private budgetService: BudgetService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
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
      tax_value: this.formBuilder.control({ value: (this.budget ? this.budget.tax_value : ''), disabled: true }),
      others_value: this.formBuilder.control((this.budget ? this.budget.others_value : '')),
      discount_aliquot: this.formBuilder.control((this.budget ? this.budget.discount_aliquot : ''), [
        Validators.max(100)
      ]),
    })

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
    this.total = parseFloat(
      (
        (this.getNumber('gross_value')
        + this.getNumber('optional_value')
        + this.getNumber('bv_value')
        + this.getNumber('equipments_value')
        + this.getNumber('logistics_value')
        + this.getNumber('sales_commission_value')
        + this.getNumber('others_value')
        )
        * ((100 - this.getNumber('discount_aliquot')) / 100)
    ).toFixed(2))

    this.subscription.unsubscribe()

    if(this.total > 0) {
      controls.tax_value.setValue((this.total / parseFloat(controls.tax_aliquot.value)).toFixed(2))
    } else {
      controls.tax_value.setValue('')
    }

    this.addEvent()
  }

  getNumber(field: string): number {
    return parseFloat(this.budgetForm.controls[field].value)
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
