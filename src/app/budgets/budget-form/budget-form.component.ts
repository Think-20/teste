import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Budget } from '../budget.model';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { BudgetService } from '../budget.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorHandler } from '../../shared/error-handler.service';
import { Task } from '../../schedule/task.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../login/auth.service';
import { Job } from 'app/jobs/job.model';
import { JobService } from 'app/jobs/job.service';
import { TaskService } from 'app/schedule/task.service';
import { Employee } from 'app/employees/employee.model';
import { EmployeeService } from 'app/employees/employee.service';

@Component({
  selector: 'cb-budget-form',
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.css']
})
export class BudgetFormComponent implements OnInit {
  /* budget: Budget
  budgetForm: FormGroup
  total: number = 0
  isAttendance: boolean = false
  isAdmin: boolean = false
  subscription: Subscription */
  @ViewChild('finalValue', { static : false }) finalValue: ElementRef;
  budgetForm = new FormGroup({});

  @Input('typeForm') typeForm: string
  @Input('task') task: Task
  @Input() job: Job
  sortedTasks: Task[]
  expandedIndex: number = null
  budgetForms: FormGroup[] = [];
  taskId;
  backscreen: string;
  attendances: Employee[]
  constructor(
    /* private budgetService: BudgetService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar, */
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private jobService: JobService,
    public taskService: TaskService,
    
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const taskId = params['taskId'];
      this.taskId = taskId
      this.backscreen = params['backscreen'];
    });

    this.carregarFuncionarios();
    this.sortTasks();
    this.loadTaskFromRoute();
    this.createForm();
  }

  createForm() {
    this.budgetForms = this.sortedTasks.map(() =>
      this.formBuilder.group({
        id: this.formBuilder.control('', [Validators.required]),
        orders_value: this.formBuilder.control('', []),
        attendance_value: this.formBuilder.control('', []),
        creation_value: this.formBuilder.control('', []),
        pre_production_value: this.formBuilder.control('', []),
        production_value: this.formBuilder.control('', []),
        details_value: this.formBuilder.control('', []),
        budget_si_value: this.formBuilder.control('', []),
        bv_value: this.formBuilder.control('', []),
        over_rates_value: this.formBuilder.control('', []),
        discounts_value: this.formBuilder.control('', []),
        taxes_value: this.formBuilder.control('', []),
        logistics_value: this.formBuilder.control('', []),
        equipment_value: this.formBuilder.control('', []),
        total_cost_value: this.formBuilder.control('', []),
        gross_profit_value: this.formBuilder.control('', []),
        profit_value: this.formBuilder.control('', []),
        final_value: this.formBuilder.control('', [Validators.required]),

        //job details
        attendance: this.formBuilder.control({ value: '', disabled: true }, [Validators.required]),
        client: this.formBuilder.control({ value: '', disabled: true }, [Validators.required]),
        event: this.formBuilder.control({ value: '', disabled: true }, [Validators.required]),
        place: this.formBuilder.control({ value: '', disabled: false }, [Validators.required]),
        creation_responsible: this.formBuilder.control({ value: '', disabled: true }, [Validators.required]),
        producer: this.formBuilder.control({ value: '', disabled: false }, [Validators.required]),

        //event details
        dt_event: this.formBuilder.control({ value: '', disabled: false }, []),
        budget_value: this.formBuilder.control({ value: '', disabled: true }, [Validators.required, Validators.maxLength(13)]),
        area: this.formBuilder.control({ value: '', disabled: true }, []),
        dt_inicio_event: this.formBuilder.control({ value: '', disabled: false }, []),
        mezanino: this.formBuilder.control({ value: '', disabled: false }, []),
        dt_montagem: this.formBuilder.control({ value: '', disabled: false }, []),
        dt_fim_event: this.formBuilder.control({ value: '', disabled: false }, []),
        dt_desmontagem: this.formBuilder.control({ value: '', disabled: false }, []),

        // material etc...
        marcenaria: this.formBuilder.control({ value: 0, disabled: false }, []),
        marcenaria_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),
        
        revestimentos_epeciais: this.formBuilder.control({ value: 0, disabled: false }, []),
        revestimentos_epeciais_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),

        estrutura_metalicas: this.formBuilder.control({ value: 0, disabled: false }, []),
        estrutura_metalicas_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),

        material_mezanino: this.formBuilder.control({ value: 0, disabled: false }, []),
        material_mezanino_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),

        fechamento_vidro: this.formBuilder.control({ value: 0, disabled: false }, []),
        fechamento_vidro_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),

        vitrines: this.formBuilder.control({ value: 0, disabled: false }, []),
        vitrines_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),
        
        acrilico: this.formBuilder.control({ value: 0, disabled: false }, []),
        acrilico_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),
        
        mobiliario: this.formBuilder.control({ value: 0, disabled: false }, []),
        mobiliario_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),

        refrigeracao_climatizacao: this.formBuilder.control({ value: 0, disabled: false }, []),
        refrigeracao_climatizacao_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),

        paisagismo: this.formBuilder.control({ value: 0, disabled: false }, []),
        paisagismo_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),

        comunicacao_visual: this.formBuilder.control({ value: 0, disabled: false }, []),
        comunicacao_visual_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),

        equipamento_audio_visual: this.formBuilder.control({ value: 0, disabled: false }, []),
        equipamento_audio_visual_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),

        itens_especiais: this.formBuilder.control({ value: 0, disabled: false }, []),
        itens_especiais_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),

        execucao: this.formBuilder.control({ value: 0, disabled: false }, []),
        execucao_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),

        logistica: this.formBuilder.control({ value: 0, disabled: false }, []),
        logistica_porcentagem: this.formBuilder.control({ value: 0, disabled: false }, []),

        custo_total: this.formBuilder.control({ value: 0, disabled: false }, []),


        // Racional Custos
        imposto: this.formBuilder.control({ value: 0, disabled: false }, []),
        comissao_vendas: this.formBuilder.control({ value: 0, disabled: false }, []),
        bonificacao_vendas: this.formBuilder.control({ value: 0, disabled: false }, []),
        bonificacao_projeto_interno: this.formBuilder.control({ value: 0, disabled: false }, []),
        bonificacao_orcamento: this.formBuilder.control({ value: 0, disabled: false }, []),
        bonificacao_gerente_producao: this.formBuilder.control({ value: 0, disabled: false }, []),
        bonificacao_producao: this.formBuilder.control({ value: 0, disabled: false }, []),
        bonificacao_detalhamento: this.formBuilder.control({ value: 0, disabled: false }, []),
        total_estande: this.formBuilder.control({ value: 0, disabled: false }, []),
      })
    );

    this.sortedTasks.forEach((x, index) => this.fillForm(index))
    console.log(this.job)
  }

  fillForm(index: number): void {
    const formData = this.sortedTasks[index]; // Suponha que budgetFormData seja o array de objetos com os dados
    // Verifique se o índice é válido
    if (formData) {
      this.budgetForms[index].patchValue({
        id: formData.id,
        orders_value: formData.orders_value,
        attendance_value: formData.attendance_value,
        creation_value: formData.creation_value,
        pre_production_value: formData.pre_production_value,
        production_value: formData.production_value,
        details_value: formData.details_value,
        budget_si_value: formData.budget_si_value,
        bv_value: formData.bv_value,
        over_rates_value: formData.over_rates_value,
        discounts_value: formData.discounts_value,
        taxes_value: formData.taxes_value,
        logistics_value: formData.logistics_value,
        equipment_value: formData.equipment_value,
        total_cost_value: formData.total_cost_value,
        gross_profit_value: formData.gross_profit_value,
        profit_value: formData.profit_value,
        final_value: formData.final_value,

        //job details
        attendance: this.job.attendance,
        client: this.job.client ? this.job.client.fantasy_name : { fantasy_name: this.job.not_client },
        event: this.job.event,
        place: this.job.place,
        creation_responsible: this.job.creation_responsible != null ? this.job.creation_responsible.name : 'Externo',

        //event details
        budget_value: this.job.budget_value,
        area: this.job.area > 0 ? this.job.area.toString().replace('.', ',') : '',
      });

      this.budgetForms[index].valueChanges.subscribe(form => {
        const soma_total = 
          form.marcenaria + 
          form.revestimentos_epeciais + 
          form.estrutura_metalicas + 
          form.material_mezanino + 
          form.fechamento_vidro + 
          form.vitrines + 
          form.acrilico + 
          form.mobiliario + 
          form.refrigeracao_climatizacao + 
          form.paisagismo + 
          form.comunicacao_visual + 
          form.equipamento_audio_visual + 
          form.itens_especiais + 
          form.execucao + 
          form.logistica;

          this.budgetForms[index].controls.custo_total.setValue(soma_total, { emitEvent: false });

          this.setPorcentgaem("marcenaria", index);
          this.setPorcentgaem("revestimentos_epeciais", index);
          this.setPorcentgaem("estrutura_metalicas", index);
          this.setPorcentgaem("material_mezanino", index);
          this.setPorcentgaem("fechamento_vidro", index);
          this.setPorcentgaem("vitrines", index);
          this.setPorcentgaem("acrilico", index);
          this.setPorcentgaem("mobiliario", index);
          this.setPorcentgaem("refrigeracao_climatizacao", index);
          this.setPorcentgaem("paisagismo", index);
          this.setPorcentgaem("comunicacao_visual", index);
          this.setPorcentgaem("equipamento_audio_visual", index);
          this.setPorcentgaem("itens_especiais", index);
          this.setPorcentgaem("execucao", index);
          this.setPorcentgaem("logistica", index);
      })
    }
  }

  setPorcentgaem(field: string, index: number) {
    const control: AbstractControl = this.budgetForms[index].get(field);

    const controlTotal: AbstractControl = this.budgetForms[index].get("custo_total");

    const controlPorcentagem: AbstractControl = this.budgetForms[index].get(field+"_porcentagem");
    
    const value = control.value;

    const valueTotal = controlTotal.value;

    if (valueTotal <= 0) {
      controlPorcentagem.setValue(0, { emitEvent: false });

      return;
    }

    const total = value / valueTotal;

    const porcentagem = total * 100;

    controlPorcentagem.setValue(parseFloat(porcentagem.toFixed(2)), { emitEvent: false });
  }

  getTaskByProjectFiles(index) {
    if (!this.sortedTasks.length) {
      return;
    }

    const task = this.sortedTasks[index];
    return task.project_files[task.project_files.length - 1];
  }

  getTask(index) {
    if (!this.sortedTasks.length) {
      return;
    }

    const task = this.sortedTasks[index];
    return task;
  }

  getLastPersonWhoModified(index) {
    if (!this.sortedTasks.length) {
      return;
    }

    const task = this.sortedTasks[index];

    if (!this.getTaskByProjectFiles(index) || !this.getTaskByProjectFiles(index).responsible) {
      return;
    }

    return task.updated_by ? task.updated_by : this.getTaskByProjectFiles(index).responsible.name;
  }

  getLastPersonWhoModifiedDate(index) {
    if (!this.sortedTasks.length) {
      return;
    }

    const task = this.sortedTasks[index];

    if (!task && this.getTaskByProjectFiles(index)) {
        return this.getTaskByProjectFiles(index).updated_at;;
    }

    return task.updated_at ? task.updated_at : '';
  }

  sendValues(budgetForm: FormGroup) {
    console.log(budgetForm)
    budgetForm.updateValueAndValidity()
    
    if (ErrorHandler.formIsInvalid(budgetForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    // this.taskService.changeValues({...budgetForm.value, task_id: this.taskId}).subscribe(data => {
    //   this.snackBar.open(data.message, '', {
    //     duration: data.status ? 1000 : 5000
    //   })

    //   if (this.backscreen === 'agenda') {
    //     this.router.navigate(['schedule'])
    //     return;
    //   } 

    //   this.router.navigateByUrl(`/jobs/edit/${this.job.id}?tab=check-in`)
    // })
  }

  formatFinalValue(budgetForm: FormGroup) {
    const finalValue = this.finalValue.nativeElement.value;
    budgetForm.get('final_value').setValue(finalValue.replace('R$ ', ''));
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const keyCode = event.which || event.keyCode;
    const keyValue = String.fromCharCode(keyCode);

    if (!/^[0-9.,]$/.test(keyValue) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
  }

  sortTasks() {
    this.sortedTasks = this.job.tasks.filter((task) => {
      return task.job_activity.initial == 1
    });
    let adds = [];
    this.sortedTasks.filter((parentTask => {
      let temp = this.job.tasks.filter((task) => {
        return parentTask.job_activity.modification_id == task.job_activity_id
          || parentTask.job_activity.option_id == task.job_activity_id
      });
      adds = adds.concat(temp.reverse())
    }));
    this.sortedTasks = this.sortedTasks.concat(adds).reverse();

    this.sortedTasks.forEach((task, index) => {
      if(task.project_files.length > 0 && this.expandedIndex == null) {
        this.expandedIndex = index
      }
    })

    console.log(this.sortedTasks)
  }

  loadTaskFromRoute() {
    
    this.route.queryParams.subscribe((params) => {
      let taskId = params['taskId']
      this.sortedTasks.forEach((task, index) => {
        if(task.id == taskId) {
          this.expandedIndex = index
        }
      })
    })
  }

  carregarFuncionarios() {
    this.employeeService.employees({
      paginate: false,
      deleted: true
    }).subscribe(dataInfo => {
      let employees = dataInfo.pagination.data
      this.attendances = employees.filter(employee => {
        return employee.department.description === 'Atendimento' || employee.department.description === 'Diretoria'
      })
    })
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }
  
  /* ngOnInit() {
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
        this.snackBar.open(data.message, '', {
          duration: 3000
        })
        return
      }

      this.snackBar.open('Orçamento salvo com sucesso!', '', {
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
  } */
}
