import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { CostSheet, CostSheetGroup, CostSheetResult } from "app/cost-sheet/cost-sheet.model";
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

        this.costSheetService.addCostSheet(this.costSheetGroup, costSheet);
      }
    });
  }

  private createObjct(result: CostSheet): CostSheet {
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
      result.negociacao,
      result.solicitante,
      result.aprovacao,
      result.aceite,
      result.nf,
      result.condicao,
      result.vencimento,
      result.pagamento
    );

    return costSheet;
  }
}
