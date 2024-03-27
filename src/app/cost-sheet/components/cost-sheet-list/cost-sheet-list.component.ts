import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { CostSheetGroup, CostSheetResult } from "app/cost-sheet/cost-sheet.model";
import { CostSheetService } from "app/cost-sheet/cost-sheet.service";
import { CostSheeFormComponent } from "../cost-sheet-form/cost-sheet-form.component";

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


  constructor(public dialog: MatDialog) { }

  openCostSheetModalForm(): void {
    const dialogRef = this.dialog.open(CostSheeFormComponent, { closeOnNavigation: false, disableClose: true });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Aqui você pode fazer algo com os dados do modal, como salvar em um serviço
        console.log('Os dados do modal:', result);
      }
    });
  }
}
