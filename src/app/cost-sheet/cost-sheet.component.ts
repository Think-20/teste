import { Component, Input } from "@angular/core";
import { Job } from "app/jobs/job.model";

@Component({
    selector: 'cb-cost-sheet',
    templateUrl: './cost-sheet.component.html',
    styleUrls: ['./cost-sheet.component.css']
  })
export class CostSheetComponent {
    @Input() job: Job
}
