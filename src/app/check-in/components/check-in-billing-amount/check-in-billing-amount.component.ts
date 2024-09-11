import { PaymentService } from './../../../shared/services/payment.service';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CheckInModel } from 'app/check-in/check-in.model';
import { Job } from 'app/jobs/job.model';
import { Task } from 'app/schedule/task.model';
import { CheckInPeopleComponent } from '../check-in-people/check-in-people.component';
import { MatDialog } from '@angular/material';
import { PersonModel } from 'app/shared/models/person.model';
import { PersonService } from 'app/shared/services/person.service';
import { CheckInPaymentFormComponent } from '../check-in-payment-form/check-in-payment-form.component';
import { PaymentModel } from 'app/shared/models/payment.model';

@Component({
  selector: 'cb-check-in-billing-amount',
  templateUrl: './check-in-billing-amount.component.html',
  styleUrls: ['./check-in-billing-amount.component.css']
})
export class CheckInBillingAmountComponent implements OnInit, OnChanges {
  @Input() job = new Job();
  @Input() checkInModel = new CheckInModel();

  budgets: Task[] = [];

  persons: PersonModel[] = [];

  payments: PaymentModel[] = [];

  get personName(): string {
    if (!this.checkInModel.bv_customer_service) {
      return '';
    }

    const index = this.persons.findIndex(x => x.id === this.checkInModel.bv_customer_service);

    if (index >= 0) {
      return this.persons[index].name;
    }
    
    return '';
  }

  get budget(): Task {
    return this.budgets.find(x => x.id === this.checkInModel.budget);
  }

  get finalValue(): number {
    const budget = this.budget;

    if (!budget) {
      return 0;
    }

    const total = budget.final_value;

    return parseFloat(Number(total).toFixed(2));
  }

  get custoTotal(): number {
    const budget = this.budget;
    
    if (!budget) {
      return 0;
    }

    const total = 
      budget.marcenaria +
      budget.revestimentos_epeciais +
      budget.estrutura_metalicas +
      budget.material_mezanino +
      budget.fechamento_vidro +
      budget.vitrines +
      budget.acrilico +
      budget.mobiliario +
      budget.refrigeracao_climatizacao +
      budget.paisagismo +
      budget.comunicacao_visual +
      budget.equipamento_audio_visual +
      budget.itens_especiais +
      budget.execucao;

    return parseFloat((total || 0).toFixed(2));
  }

  get bv(): number {
    const budget = this.budget;
    
    if (!budget) {
      return 0;
    }

    const total = this.custoTotal * budget.coeficiente_margem;

    return total * 0.7 * budget.comissao_vendas_coeficiente;
  }

  get impostos(): number {
    const budget = this.budget;
    
    if (!budget) {
      return 0;
    }

    const total = (this.custoTotal * budget.coeficiente_margem) * budget.imposto_coeficiente;

    return parseFloat((total || 0).toFixed(2));
  }

  get equipamentos(): number {
    const budget = this.budget;
    
    if (!budget) {
      return 0;
    }

    const total = budget.equipamento_audio_visual;

    return parseFloat((total || 0).toFixed(2));
  }

  get logistica(): number {
    const budget = this.budget;
    
    if (!budget) {
      return 0;
    }

    const total = budget.operacional_logistica * budget.frete_logistica_coeficiente;

    return parseFloat((total || 0).toFixed(2));
  }

  get credenciaisTaxas(): number {
    const budget = this.budget;
    
    if (!budget) {
      return 0;
    }

    const total = budget.credenciais_taxas;

    return parseFloat((total || 0).toFixed(2));
  }

  get seguro(): number {
    const budget = this.budget;
    
    if (!budget) {
      return 0;
    }

    const total = budget.seguro;

    return parseFloat((total || 0).toFixed(2));
  }

  get outros(): number {
    const budget = this.budget;
    
    if (!budget) {
      return 0;
    }

    const total = budget.servico_diversos_operacional;

    return parseFloat((total || 0).toFixed(2));
  }

  get desconto(): number {
    const budget = this.budget;
    
    if (!budget) {
      return 0;
    }

    const total = budget.desconto;

    return parseFloat((total || 0).toFixed(2));
  }

  get valorTotalRecebido(): number {
    if (!this.payments || !this.payments.length) {
      return 0;
    }

    if (this.payments.length == 1) {
      return this.payments[0].payment_date ? this.payments[0].value : 0;
    }

    return this.payments
      .filter(x => !!x.payment_date)
      .map(x => x.value)
      .reduce((prv, current) => prv + current);
  }

  constructor(
    private dialog: MatDialog,
    private personService: PersonService,
    private paymentService: PaymentService,
  ) { }

  ngOnInit() {
    this.loadBudgets();
    this.loadPersons();
  }

  private loadBudgets() : void {
    this.budgets = this.job.tasks.filter((task) => {
      return task.job_activity.initial == 1;
    });

    let adds = [];

    this.budgets.filter((parentTask => {
      let temp = this.job.tasks.filter((task) => {
        return parentTask.job_activity.modification_id == task.job_activity_id
          || parentTask.job_activity.option_id == task.job_activity_id
      });

      adds = adds.concat(temp.reverse())
    }));

    this.budgets = this.budgets.concat(adds).reverse();
  }

  private loadPersons(): void {
    this.personService.persons().subscribe({
      next: response => {
        this.persons = response;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (Object.keys(changes).includes('checkInModel')) {
      if (this.checkInModel.id) {
        this.loadPayments(this.checkInModel.id);
      }
    }
  }

  private loadPayments(checkInId: number): void {
    this.paymentService.paymentsByCheckInId(checkInId).subscribe({
      next: response => {
        this.payments = response;
      }
    });
  }

  openModalPerson(): void {
    const modal = this.dialog.open(CheckInPeopleComponent, {
      width: '500px',
    });

    modal.afterClosed().subscribe(result => {
      if (result) {
        this.persons.push(result);
      }
    });
  }

  openModalPayment(paymentModel?: PaymentModel): void {
    const modal = this.dialog.open(CheckInPaymentFormComponent, {
      width: '500px',
      data: {
        checkInId: this.checkInModel.id,
        baseValue: this.job.budget_value,
        paymentModel,
      }
    });

    modal.componentInstance.checkInId = this.checkInModel.id,
    modal.componentInstance.baseValue = this.job.budget_value,
    modal.componentInstance.patchValue(paymentModel);

    modal.afterClosed().subscribe(result => {
      if (result) {
        this.payments.push(result);
      }
    });
  }

  edit(payment: PaymentModel): void {
    this.openModalPayment(payment);
  }

  delete(payment: PaymentModel): void {
    this.paymentService.delete(payment.id)
      .subscribe(() => {
        this.loadPayments(this.checkInModel.id);
      });
  }
}
