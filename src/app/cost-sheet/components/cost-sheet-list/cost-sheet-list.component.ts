import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Aceite, Aprovacao, CostSheet, CostSheetGroup, CostSheetResult, Negociacao, Solicitante, Vencimento } from "app/cost-sheet/cost-sheet.model";
import { CostSheetService } from "app/cost-sheet/cost-sheet.service";
import { CostSheeFormComponent } from "../cost-sheet-form/cost-sheet-form.component";
import { CostSheetStore } from "app/cost-sheet/cost-sheet.store.service";

@Component({
    selector: 'cb-cost-sheet-list',
    templateUrl: './cost-sheet-list.component.html',
    styleUrls: ['./cost-sheet-list.component.css']
  })
export class CostSheetListComponent {
  @Input() costSheetGroup: CostSheetGroup;

  @Input() costSheetResult: CostSheetResult;

  @Input() index: number;

  @Input() last: boolean;


  constructor(public dialog: MatDialog, private costSheetService: CostSheetService) { }

  openCostSheetModalForm(): void {
    const dialogRef = this.dialog.open(CostSheeFormComponent, { closeOnNavigation: false, disableClose: true });

    dialogRef.afterClosed().subscribe((result: CostSheet) => {
      if (result) {
        
        const costSheet =  this.createObjct(result);    

        console.log(costSheet)
        this.costSheetService.addCostSheet(this.costSheetGroup, costSheet);
      }
    });
  }

  openCostSheetModalEditForm(costSheet: Partial<CostSheet>) {
    const dialogRef = this.dialog.open(CostSheeFormComponent, { closeOnNavigation: false, disableClose: true, data: costSheet });

    dialogRef.afterClosed().subscribe((result: CostSheet) => {
      if (result) {
        
        const costSheet =  this.createObjct(result);    

        console.log(costSheet)
        this.costSheetService.updateCostSheet(this.costSheetGroup, costSheet);
      }
    });
  }

  private createObjct(result: CostSheet): CostSheet {
    let negociacao = new Negociacao();
    let solicitante = new Solicitante();
    let aprovacao = new Aprovacao();
    let aceite = new Aceite();

    if (result.negociacao)
        negociacao = new Negociacao(result.negociacao.id, result.negociacao.nome, result.data_negociacao);
    
    if (result.solicitante)
        solicitante = new Solicitante(result.solicitante.id, result.solicitante.nome, result.data_solicitante);
    
    if (result.aprovacao)
        aprovacao = new Aprovacao(result.aprovacao.id, result.aprovacao.nome, result.data_aprovacao);
    
    if (result.aceite)
        aceite = new Aceite(result.aceite.id, result.aceite.nome, result.data_aceite);

    const costSheet = new CostSheet(
      result.id,
      result.numero,
      result.categoria,
      result.favorecido,
      result.descricao,
      result.quantidade,
      result.unidade,
      result.valor_previsto,
      result.valor_realizado,
      result.valor_previsto_realizado_percentual,
      negociacao,
      solicitante,
      aprovacao,
      aceite,
      result.nf,
      result.condicao,
      new Vencimento(result.data_vencimento, result.parcela_atual, result.total_parcelas),
      result.pagamento
    );

    return costSheet;
  }
}
