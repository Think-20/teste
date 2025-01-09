import { Component, Input, ViewChild } from "@angular/core";
import { Job } from "app/jobs/job.model";
import { ExtrasGridComponent } from './components/extras-grid/extras-grid.component';
import { CheckInModel } from 'app/check-in/check-in.model';

@Component({
  selector: "cb-extras",
  templateUrl: "./extras.component.html",
  styleUrls: ["./extras.component.scss"],
})
export class ExtrasComponent {
  @ViewChild('extrasGrid', { static: false }) extrasGrid!: ExtrasGridComponent;

  @Input() job = new Job();

  get checkin() {
    return this.job && this.job.checkin ? this.job.checkin : new CheckInModel();
  }
  
  get valorTotalExtrasRecebido(): number {
    if (!this.extrasGrid) {
      return 0;
    }

    return this.extrasGrid.valorTotalExtrasRecebido;
  }
  
}
