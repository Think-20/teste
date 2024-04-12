import { Component, Inject, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Aceite, Aprovacao, Atendente, CostSheet, CostSheetEmployee, Favorecido, Negociacao, Solicitante } from "app/cost-sheet/cost-sheet.model";
import { Employee } from "app/employees/employee.model";
import { EmployeeService } from "app/employees/employee.service";
import { Provider } from "app/providers/provider.model";
import { ProviderService } from "app/providers/provider.service";

@Component({
  selector: "cb-cost-sheet-form",
  templateUrl: "./cost-sheet-form.component.html",
  styleUrls: ["./cost-sheet-form.component.css"],
})
export class CostSheeFormComponent implements OnInit {
  @Input() formGroup: FormGroup;

  fornecedores: CostSheetEmployee[] = [];
  negociadores: CostSheetEmployee[] = [];
  solicitantes: CostSheetEmployee[] = [];
  aprovadores: CostSheetEmployee[] = [];
  aceitadores: CostSheetEmployee[] = [];

  costSheet: CostSheet;
  title: string;

  constructor(
    private employeeService: EmployeeService,
    private providerService: ProviderService,
    public dialogRef: MatDialogRef<CostSheeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { costSheet: CostSheet, title: string },
  ) {
    this.title = this.data.title;
    this.costSheet = this.data.costSheet;
  }

  ngOnInit(): void {
    this.createForm();

    this.loadAttendances();

    this.carregarFornecedores();

    if (this.costSheet) {
      this.fillForm();
    }
  }

  createForm(): void {
    this.formGroup = new FormGroup({
      id: new FormControl(null),
      numero: new FormControl(null),
      categoria: new FormControl(null),
      favorecido: new FormControl(null),
      descricao: new FormControl(null),
      quantidade: new FormControl(null),
      unidade: new FormControl(null),
      valor_previsto: new FormControl(null),
      valor_realizado: new FormControl(null),
      negociacao: new FormControl(null),
      solicitante: new FormControl(null),
      aprovacao: new FormControl(null),
      aceite: new FormControl(null),
      nf: new FormControl(null),
      condicao: new FormControl(null),
      pagamento: new FormControl(null),
      data_vencimento: new FormControl(null),
      data_negociacao: new FormControl(null),
      data_solicitante: new FormControl(null),
      data_aprovacao: new FormControl(null),
      data_aceite: new FormControl(null),
      parcela_atual: new FormControl(null),
      total_parcelas: new FormControl(null),
    });
  }

  fillForm() {
    this.formGroup.patchValue({
      ...this.costSheet,
      favorecido: this.costSheet.favorecido,
      negociacao: this.costSheet.negociacao,
      solicitante: this.costSheet.solicitante,
      aprovacao: this.costSheet.aprovacao,
      aceite: this.costSheet.aceite,
      data_vencimento: this.costSheet.vencimento.data,
      data_negociacao: this.costSheet.negociacao.data,
      data_solicitante: this.costSheet.solicitante.data,
      data_aprovacao: this.costSheet.aprovacao.data,
      data_aceite: this.costSheet.aceite.data,
      parcela_atual: this.costSheet.vencimento.parcela_atual,
      total_parcelas: this.costSheet.vencimento.total_parcelas,
    });
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  loadAttendances(): void {
    this.employeeService
      .employees({
        paginate: false,
        deleted: true,
      })
      .subscribe((dataInfo) => {
        const employees = dataInfo.pagination.data;
        
        const producao = employees.filter(employee => employee.department.description === "Produção" || employee.department.description === "Diretoria").map((x) => ({ nome: x.name, id: x.id }));
        
        this.aprovadores = employees.filter(employee => employee.department.description === "Planejamento" || employee.department.description === "Diretoria").map((x) => ({ nome: x.name, id: x.id }));
        this.negociadores = producao;
        this.solicitantes = producao;
        this.aceitadores = producao;
      });
  }

  carregarFornecedores() {
    this.providerService.allProviders().subscribe((response) => {
      const data: Provider[] = response.pagination.data;
      this.fornecedores = data.map((x) => ({ nome: x.fantasy_name, id: x.id }));
    });
  }

  compareEmployee(employee1: CostSheetEmployee, employee2: CostSheetEmployee): boolean {
    return employee1.id === employee2.id;
  }

  salvar() {
    console.log(this.formGroup.value);

    this.dialogRef.close(this.formGroup.value);
  }
}
