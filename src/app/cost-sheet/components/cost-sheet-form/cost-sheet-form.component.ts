import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { CostSheet } from "app/cost-sheet/cost-sheet.model";

@Component({
    selector: 'cb-cost-sheet-form',
    templateUrl: './cost-sheet-form.component.html',
    styleUrls: ['./cost-sheet-form.component.css']
  })
export class CostSheeFormComponent {

  constructor(
    public dialogRef: MatDialogRef<CostSheeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CostSheet
  ) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
