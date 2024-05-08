import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { BudgetService } from "../budget.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ErrorHandler } from "../../shared/error-handler.service";
import { Task } from "../../schedule/task.model";
import { Job } from "app/jobs/job.model";
import { TaskService } from "app/schedule/task.service";
import { Employee } from "app/employees/employee.model";
import { EmployeeService } from "app/employees/employee.service";
import { AuthService } from "app/login/auth.service";

@Component({
  selector: "cb-budget-form",
  templateUrl: "./budget-form.component.html",
  styleUrls: ["./budget-form.component.css"],
})
export class BudgetFormComponent implements OnInit {
  @ViewChild("finalValue", { static: false }) finalValue: ElementRef;
  budgetForm = new FormGroup({});

  @Input("typeForm") typeForm: string;
  @Input("task") task: Task;
  @Input() job: Job;
  sortedTasks: Task[];
  expandedIndex: number = null;
  budgetForms: FormGroup[] = [];
  taskId;
  backscreen: string;
  attendances: Employee[];
  isDiretoria = false;
  constructor(
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    public taskService: TaskService,

    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.checkUserDepartment();

    this.route.queryParams.subscribe((params) => {
      const taskId = params["taskId"];
      this.taskId = taskId;
      this.backscreen = params["backscreen"];
    });

    this.carregarFuncionarios();
    this.sortTasks();
    this.loadTaskFromRoute();
    this.createForm();
  }

  checkUserDepartment() {
    const currentUser = this.authService.currentUser();
    this.isDiretoria = currentUser.employee.department_id === 1;
  }

  createForm() {
    this.budgetForms = this.sortedTasks.map(() =>
      this.formBuilder.group({
        id: this.formBuilder.control("", [Validators.required]),
        orders_value: this.formBuilder.control("", []),
        attendance_value: this.formBuilder.control("", []),
        creation_value: this.formBuilder.control("", []),
        pre_production_value: this.formBuilder.control("", []),
        production_value: this.formBuilder.control("", []),
        details_value: this.formBuilder.control("", []),
        budget_si_value: this.formBuilder.control("", []),
        bv_value: this.formBuilder.control("", []),
        over_rates_value: this.formBuilder.control("", []),
        discounts_value: this.formBuilder.control("", []),
        taxes_value: this.formBuilder.control("", []),
        logistics_value: this.formBuilder.control("", []),
        equipment_value: this.formBuilder.control("", []),
        total_cost_value: this.formBuilder.control("", []),
        gross_profit_value: this.formBuilder.control("", []),
        profit_value: this.formBuilder.control("", []),
        final_value: this.formBuilder.control("", [Validators.required]),

        //job details
        attendance: this.formBuilder.control({ value: "", disabled: true }, [Validators.required]),
        client: this.formBuilder.control({ value: "", disabled: true }, [Validators.required]),
        event: this.formBuilder.control({ value: "", disabled: true }, [Validators.required]),
        place: this.formBuilder.control({ value: "", disabled: false }, [Validators.required]),
        creation_responsible: this.formBuilder.control({ value: "", disabled: true }, [Validators.required]),
        producer: this.formBuilder.control({ value: "", disabled: false }, []),

        //event details
        dt_event: this.formBuilder.control({ value: "", disabled: false }, []),
        budget_value: this.formBuilder.control({ value: "", disabled: true }, [Validators.required, Validators.maxLength(13)]),
        area: this.formBuilder.control({ value: "", disabled: true }, []),
        mezanino: this.formBuilder.control({ value: "", disabled: false }, []),
        dt_inicio_event: this.formBuilder.control({ value: "", disabled: false }, []),
        dt_montagem: this.formBuilder.control({ value: "", disabled: false }, []),
        dt_fim_event: this.formBuilder.control({ value: "", disabled: false }, []),
        dt_desmontagem: this.formBuilder.control({ value: "", disabled: false }, []),

        // material etc...
        marcenaria: this.formBuilder.control({ value: 0, disabled: false }, []),
        marcenaria_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        revestimentos_epeciais: this.formBuilder.control({ value: 0, disabled: false }, []),
        revestimentos_epeciais_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        estrutura_metalicas: this.formBuilder.control({ value: 0, disabled: false }, []),
        estrutura_metalicas_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        material_mezanino: this.formBuilder.control({ value: 0, disabled: false }, []),
        material_mezanino_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        fechamento_vidro: this.formBuilder.control({ value: 0, disabled: false }, []),
        fechamento_vidro_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        vitrines: this.formBuilder.control({ value: 0, disabled: false }, []),
        vitrines_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        acrilico: this.formBuilder.control({ value: 0, disabled: false }, []),
        acrilico_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        mobiliario: this.formBuilder.control({ value: 0, disabled: false }, []),
        mobiliario_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        refrigeracao_climatizacao: this.formBuilder.control({ value: 0, disabled: false }, []),
        refrigeracao_climatizacao_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        paisagismo: this.formBuilder.control({ value: 0, disabled: false }, []),
        paisagismo_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        comunicacao_visual: this.formBuilder.control({ value: 0, disabled: false }, []),
        comunicacao_visual_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        equipamento_audio_visual: this.formBuilder.control({ value: 0, disabled: false }, []),
        equipamento_audio_visual_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        itens_especiais: this.formBuilder.control({ value: 0, disabled: false }, []),
        itens_especiais_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        execucao: this.formBuilder.control({ value: 0, disabled: false }, []),
        execucao_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        diversos_operacional: this.formBuilder.control({ value: 0, disabled: false }, []),
        diversos_operacional_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        frete_logistica: this.formBuilder.control({ value: 0, disabled: false }, []),
        frete_logistica_porcentagem: this.formBuilder.control({ value: 0, disabled: true }, []),

        custo_total: this.formBuilder.control({ value: 0, disabled: true }, []),

        // visibilidade dos valores
        budget_value_visibily: this.formBuilder.control({ value: true, disabled: false }, []),
        custo_total_visibily: this.formBuilder.control({ value: true, disabled: false }, []),
        total_geral_estande_visibily: this.formBuilder.control({ value: true, disabled: false }, []),
        liquido_think_visibily: this.formBuilder.control({ value: true, disabled: false }, []),

        // Racional Custos
        imposto: this.formBuilder.control({ value: 0, disabled: true }, []),
        comissao_vendas: this.formBuilder.control({ value: 0, disabled: true }, []),
        bonificacao_projeto_interno: this.formBuilder.control({ value: 0, disabled: true }, []),
        bonificacao_orcamento: this.formBuilder.control({ value: 0, disabled: true }, []),
        bonificacao_gerente_producao: this.formBuilder.control({ value: 0, disabled: true }, []),
        bonificacao_producao: this.formBuilder.control({ value: 0, disabled: true }, []),
        bonificacao_detalhamento: this.formBuilder.control({ value: 0, disabled: true }, []),
        coeficiente_margem: this.formBuilder.control({ value: 0, disabled: false }, []),
        total_estande: this.formBuilder.control({ value: 0, disabled: true }, []),

        opcional_equipamento_audio_visual: this.formBuilder.control({ value: 0, disabled: false }, []),
        total_geral_estande: this.formBuilder.control({ value: 0, disabled: true }, []),
        liquido_think: this.formBuilder.control({ value: 0, disabled: true }, []),
        margem_lucro: this.formBuilder.control({ value: 0, disabled: true }, []),
      })
    );

    this.sortedTasks.forEach((x, index) => this.fillForm(index));
    console.log(this.job);
  }

  fillForm(index: number): void {
    const formData = this.sortedTasks[index]; // Suponha que budgetFormData seja o array de objetos com os dados
    // Verifique se o índice é válido
    if (formData) {
      this.budgetForms[index].valueChanges.subscribe((form) => {
        this.setCustoTotal(form, index);

        this.setTodasPorcentagens(index);

        this.setTotalEstande(index);

        this.setTotalImposto(index);

        this.setTodasComissoesBonificacoes(index);
        
        this.setTotalGeralEstande(index);

        this.setTotalLiquidoThink(index);

        this.setMargemLucro(index);
      });

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
        creation_responsible: this.job.creation_responsible != null ? this.job.creation_responsible.name: "Externo",
        producer: this.job.producer,

        //event details
        budget_value: this.job.budget_value,
        area: this.job.area > 0 ? this.job.area.toString().replace(".", ",") : "",
        mezanino: formData.mezanino,
        dt_inicio_event: formData.dt_inicio_event,
        dt_montagem: formData.dt_montagem,
        dt_fim_event: formData.dt_fim_event,
        dt_desmontagem: formData.dt_desmontagem,

        // valores orçamento
        marcenaria: formData.marcenaria || 0,
        revestimentos_epeciais: formData.revestimentos_epeciais || 0,
        estrutura_metalicas: formData.estrutura_metalicas || 0,
        material_mezanino: formData.material_mezanino || 0,
        fechamento_vidro: formData.fechamento_vidro || 0,
        vitrines: formData.vitrines || 0,
        acrilico: formData.acrilico || 0,
        mobiliario: formData.mobiliario || 0,
        refrigeracao_climatizacao: formData.refrigeracao_climatizacao || 0,
        paisagismo: formData.paisagismo || 0,
        comunicacao_visual: formData.comunicacao_visual || 0,
        equipamento_audio_visual: formData.equipamento_audio_visual || 0,
        itens_especiais: formData.itens_especiais || 0,
        execucao: formData.execucao || 0,
        frete_logistica: formData.frete_logistica || 0,
        diversos_operacional: formData.diversos_operacional || 0,
        coeficiente_margem: formData.coeficiente_margem || 0,
      });
    }
  }

  setCustoTotal(form, index: number) {
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
      form.frete_logistica +
      form.diversos_operacional;

    this.budgetForms[index].controls.custo_total.setValue(soma_total, { emitEvent: false });
  }

  setTodasPorcentagens(index: number) {
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
    this.setPorcentgaem("frete_logistica", index);
    this.setPorcentgaem("diversos_operacional", index);
  }

  setTodasComissoesBonificacoes(index: number) {
    this.setComissoesBonificacoes("comissao_vendas", index, 0.05);
    this.setComissoesBonificacoes("bonificacao_projeto_interno", index, 0.03);
    this.setComissoesBonificacoes("bonificacao_orcamento", index, 0.01);
    this.setComissoesBonificacoes("bonificacao_gerente_producao", index, 0.01);
    this.setComissoesBonificacoes("bonificacao_producao", index, 0.01);
    this.setComissoesBonificacoes("bonificacao_detalhamento", index, 0.005);
  }

  setPorcentgaem(field: string, index: number) {
    const control: AbstractControl = this.budgetForms[index].get(field);

    const controlTotal: AbstractControl = this.budgetForms[index].get("custo_total");

    const controlPorcentagem: AbstractControl = this.budgetForms[index].get(field + "_porcentagem");

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

  setTotalEstande(index: number) {
    const controlTotal: AbstractControl = this.budgetForms[index].get("custo_total");

    const controlCoeficienteMargem: AbstractControl = this.budgetForms[index].get("coeficiente_margem");

    const controlTotalEstande: AbstractControl = this.getControlTotalEstande(index);

    const valueTotal = controlTotal.value;

    const coeficienteMargem = controlCoeficienteMargem.value;

    const total = valueTotal * coeficienteMargem;

    controlTotalEstande.setValue(parseFloat(total.toFixed(2)), { emitEvent: false });
  }

  setTotalImposto(index: number) {
    const coeficienteMargem = 0.15;

    const controlImposto: AbstractControl = this.budgetForms[index].get("imposto");

    const totalEstande = this.geTotalEstande(index);

    const total = totalEstande * coeficienteMargem;

    controlImposto.setValue(parseFloat(total.toFixed(2)), { emitEvent: false });
  }
  
  setComissoesBonificacoes(field: string, index: number, coeficienteMargem: number) {
    const controlComissao: AbstractControl = this.budgetForms[index].get(field);

    const totalEstande = this.geTotalEstande(index);

    const total = totalEstande * 0.7 * coeficienteMargem;

    controlComissao.setValue(parseFloat(total.toFixed(2)), { emitEvent: false });
  }

  setTotalGeralEstande(index: number) {
    const controlGeralTotal: AbstractControl = this.budgetForms[index].get("total_geral_estande");

    const totalEstande = this.geTotalEstande(index);

    const totalBonificacaoOrcamento = this.geTotalBonificacaoOrcamento(index);

    const totalBonificacaoGerenteProducao = this.geTotalBonificacaoGerenteProducao(index);

    const totalBonificacaoProducao = this.geTotalBonificacaoProducao(index);
    
    const valorFixo = 3865.55;

    const total = totalEstande + totalBonificacaoOrcamento + totalBonificacaoGerenteProducao + totalBonificacaoProducao + valorFixo;

    if (total == valorFixo) {
      return;
    }

    controlGeralTotal.setValue(parseFloat(total.toFixed(2)), { emitEvent: false });
  }
  
  setTotalLiquidoThink(index: number) {
    const controlLiquidoThink: AbstractControl = this.budgetForms[index].get("liquido_think");

    const totalEstande = this.geTotalEstande(index);

    const custoTotal = this.getCustoTotal(index);

    const imposto = this.getTotalImposto(index);

    const comissaoVendas = this.getTotalComissaoVendas(index);

    const bonificacaoProjetistaInterno = this.getTotalBonificacaoProjetistaInterno(index);

    const total = totalEstande - (custoTotal + imposto + comissaoVendas + bonificacaoProjetistaInterno);

    controlLiquidoThink.setValue(parseFloat(total.toFixed(2)), { emitEvent: false });
  }

  setMargemLucro(index: number) {
    const controlMargemLiquido: AbstractControl = this.budgetForms[index].get("margem_lucro");

    const liquidoThink = this.getTotalLiquidoThink(index);

    const totalEstande = this.geTotalEstande(index);

    if (!totalEstande) {
      return;
    }

    const total = liquidoThink / totalEstande;

    const porcentagem = total * 100;

    controlMargemLiquido.setValue(parseFloat(porcentagem.toFixed(2)), { emitEvent: false });
  }

  getControlTotalEstande(index: number): AbstractControl {
    return this.budgetForms[index].get("total_estande");
  }

  geTotalEstande(index: number): number {
    return this.getControlTotalEstande(index).value;
  }

  geTotalBonificacaoOrcamento(index: number): number {
    return this.budgetForms[index].get("bonificacao_orcamento").value;
  }

  geTotalBonificacaoGerenteProducao(index: number): number {
    return this.budgetForms[index].get("bonificacao_gerente_producao").value;
  }

  geTotalBonificacaoProducao(index: number): number {
    return this.budgetForms[index].get("bonificacao_producao").value;
  }

  getCustoTotal(index: number): number {
    return this.budgetForms[index].get("custo_total").value;
  }

  getTotalImposto(index: number): number {
    return this.budgetForms[index].get("imposto").value;
  }

  getTotalComissaoVendas(index: number): number {
    return this.budgetForms[index].get("comissao_vendas").value;
  }

  getTotalBonificacaoProjetistaInterno(index: number): number {
    return this.budgetForms[index].get("bonificacao_projeto_interno").value;
  }

  getTotalLiquidoThink(index: number): number {
    return this.budgetForms[index].get("liquido_think").value;
  }

  toogleVisibilty(control: AbstractControl) {
    control.setValue(!control.value);
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

    if (
      !this.getTaskByProjectFiles(index) ||
      !this.getTaskByProjectFiles(index).responsible
    ) {
      return;
    }

    return task.updated_by
      ? task.updated_by
      : this.getTaskByProjectFiles(index).responsible.name;
  }

  getLastPersonWhoModifiedDate(index) {
    if (!this.sortedTasks.length) {
      return;
    }

    const task = this.sortedTasks[index];

    if (!task && this.getTaskByProjectFiles(index)) {
      return this.getTaskByProjectFiles(index).updated_at;
    }

    return task.updated_at ? task.updated_at : "";
  }

  sendValues(budgetForm: FormGroup) {
    console.log(budgetForm);
    
    budgetForm.updateValueAndValidity();

    if (ErrorHandler.formIsInvalid(budgetForm)) {
      this.snackBar.open("Por favor, preencha corretamente os campos.", "", {
        duration: 5000,
      });
      return;
    }

    this.taskService.changeValues({...budgetForm.value, task_id: this.taskId}).subscribe(data => {
      this.snackBar.open(data.message, '', {
        duration: data.status ? 1000 : 5000
      })

      if (this.backscreen === 'agenda') {
        this.router.navigate(['schedule'])
        return;
      }

      this.router.navigateByUrl(`/jobs/edit/${this.job.id}?tab=check-in`)
    })
  }

  formatFinalValue(budgetForm: FormGroup) {
    const finalValue = this.finalValue.nativeElement.value;
    budgetForm.get("final_value").setValue(finalValue.replace("R$ ", ""));
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
      return task.job_activity.initial == 1;
    });
    let adds = [];
    this.sortedTasks.filter((parentTask) => {
      let temp = this.job.tasks.filter((task) => {
        return (
          parentTask.job_activity.modification_id == task.job_activity_id ||
          parentTask.job_activity.option_id == task.job_activity_id
        );
      });
      adds = adds.concat(temp.reverse());
    });
    this.sortedTasks = this.sortedTasks.concat(adds).reverse();

    this.sortedTasks.forEach((task, index) => {
      if (task.project_files.length > 0 && this.expandedIndex == null) {
        this.expandedIndex = index;
      }
    });

    console.log(this.sortedTasks);
  }

  loadTaskFromRoute() {
    this.route.queryParams.subscribe((params) => {
      let taskId = params["taskId"];
      this.sortedTasks.forEach((task, index) => {
        if (task.id == taskId) {
          this.expandedIndex = index;
        }
      });
    });
  }

  carregarFuncionarios() {
    this.employeeService
      .employees({
        paginate: false,
        deleted: true,
      })
      .subscribe((dataInfo) => {
        let employees = dataInfo.pagination.data;
        this.attendances = employees.filter((employee) => {
          return (
            employee.department.description === "Atendimento" ||
            employee.department.description === "Diretoria"
          );
        });
      });
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id;
  }
}