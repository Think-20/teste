import { Component, Input, ViewChild } from "@angular/core";
import { Job } from "app/jobs/job.model";
import { ExtrasGridComponent } from './components/extras-grid/extras-grid.component';

@Component({
  selector: "cb-extras",
  templateUrl: "./extras.component.html",
  styleUrls: ["./extras.component.scss"],
})
export class ExtrasComponent {
  @ViewChild('extrasGrid', { static: false }) extrasGrid!: ExtrasGridComponent;

  @Input() typeForm: string;

  @Input() job = new Job();

  
  get valorTotalExtrasRecebido(): number {
    if (!this.extrasGrid) {
      return 0;
    }

    return this.extrasGrid.valorTotalExtrasRecebido;
  }
  
  get block(): boolean {
    if (this.job && this.job.status && this.job.status.id) {
      return this.job.status.id !== 3 || this.typeForm === "show";
    }

    return false;
  }
}
