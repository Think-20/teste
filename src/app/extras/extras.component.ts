import { Component, Input, ViewChild } from "@angular/core";
import { Job } from "app/jobs/job.model";
import { ExtrasGridComponent } from './components/extras-grid/extras-grid.component';

@Component({
  selector: "cb-extras",
  templateUrl: "./extras.component.html",
  styleUrls: ["./extras.component.css"],
})
export class ExtrasComponent {
  @ViewChild('extrasGrid', { static: false }) extrasGrid!: ExtrasGridComponent;

  @Input() job = new Job();

  
  get valorTotalExtrasRecebido(): number {
    if (!this.extrasGrid) {
      return 0;
    }

    return this.extrasGrid.valorTotalExtrasRecebido;
  }
  
}
