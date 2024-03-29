import { Component, Inject, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Atendente, CostSheet } from "app/cost-sheet/cost-sheet.model";
import { Employee } from "app/employees/employee.model";
import { EmployeeService } from "app/employees/employee.service";

@Component({
    selector: 'cb-cost-sheet-form',
    templateUrl: './cost-sheet-form.component.html',
    styleUrls: ['./cost-sheet-form.component.css']
  })
export class CostSheeFormComponent implements OnInit {
  attendances: Atendente[]
  @Input() formGroup: FormGroup;
  constructor(
    private employeeService: EmployeeService,
    public dialogRef: MatDialogRef<CostSheeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public costSheet: CostSheet,
    @Inject(MAT_DIALOG_DATA) public title: string,
  ) { }

  ngOnInit(): void {
    
    this.createForm();

    this.loadAttendances();
  }


  createForm(): void {
    this.formGroup = new FormGroup({
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
      parcela_atual: new FormControl(null),
      total_parcelas: new FormControl(null),
    })
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  loadAttendances(): void {
    this.employeeService.employees({
      paginate: false,
      deleted: true
    }).subscribe(dataInfo => {
      
      let employees: Employee[] = dataInfo.pagination.data

      this.attendances = employees.filter(employee => {
        return employee.department.description === 'Atendimento' || employee.department.description === 'Diretoria'
      }).map(x => ({ nome: x.name, id: x.id}))
      
    })
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }

  salvar() {
    console.log(this.formGroup.value)

    this.dialogRef.close(this.formGroup.value);
  }
}
