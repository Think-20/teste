import { Component, Input, OnInit } from "@angular/core";
import { Job } from "app/jobs/job.model";
import { CostSheetGroup } from "./cost-sheet.model";
import { CostSheetService } from "./cost-sheet.service";

@Component({
    selector: 'cb-cost-sheet',
    templateUrl: './cost-sheet.component.html',
    styleUrls: ['./cost-sheet.component.css']
  })
export class CostSheetComponent implements OnInit {
  @Input() job: Job

  costSheetGroups: CostSheetGroup[] = [];

  constructor(private costSheetService: CostSheetService) {}

  ngOnInit(): void {
    this.costSheetService.getCostSheets().subscribe(response => {
      this.costSheetGroups = response;
    })
  }
}
