import { Component, Inject, Input } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-confirm-dialog",
  templateUrl: "./confirm-dialog.component.html",
  styleUrls: ["./confirm-dialog.component.css"],
})
export class ConfirmDialogComponent {
  @Input() data: ConfirmDialogData = {
    title: 'Confirmação de exclusão',
    message: 'Tem certeza de que deseja excluir este registro?'
  };

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public inputData: ConfirmDialogData
  ) {

    this.data = { ...this.data, ...inputData };
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }

  onCancelClick(): void {
    this.dialogRef.close(false);
  }
}

export interface ConfirmDialogData {
  title: string;
  message: string;
}
