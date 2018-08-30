import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Budget } from '../budget.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BudgetService } from '../budget.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { ErrorHandler } from '../../shared/error-handler.service';
import { Task } from '../../schedule/task.model';

@Component({
  selector: 'cb-budget-form',
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.css']
})
export class BudgetFormComponent implements OnInit {
  budget: Budget
  budgetForm: FormGroup

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
    this.budgetForm = this.formBuilder.group({
      id: this.formBuilder.control({ value: '', disabled: true }),
      job_id: this.formBuilder.control({ value: '', disabled: true }),
      task_id: this.formBuilder.control({ value: '', disabled: true }),
      gross_value: this.formBuilder.control('', [Validators.required]),
      bv_value: this.formBuilder.control('', [Validators.required]),
      equipments_value: this.formBuilder.control('', [Validators.required]),
      logistics_value: this.formBuilder.control('', [Validators.required]),
      sales_commission_value: this.formBuilder.control(''),
      tax_aliquot: this.formBuilder.control({ value: '', disabled: true }),
      tax_value: this.formBuilder.control({ value: '', disabled: true }),
      others_value: this.formBuilder.control(''),
      discount_aliquot: this.formBuilder.control(''),
    })

    //this.budget = this.task.budget

    if(this.typeForm == 'show') {
      this.budgetForm.disable()
    }
  }

  save() {
    this.budgetForm.updateValueAndValidity()
    let budget = this.budgetForm.value

    if (ErrorHandler.formIsInvalid(this.budgetForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    /*
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
    */
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

    /*
    this.budgetService.edit(budget).subscribe(data => {
      this.snackBar.open(data.message, '', {
        duration: data.status ? 1000 : 5000
      }).afterDismissed().subscribe(observer => {
        if (data.status) {
          this.router.navigateByUrl('/schedule')
        }
      })
    })
    */
  }
}
