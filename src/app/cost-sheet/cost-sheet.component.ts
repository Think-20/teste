import { Component, Input, OnInit } from "@angular/core";
import { Job } from "app/jobs/job.model";
import { CostSheetGroup, CostSheetResult } from "./cost-sheet.model";
import { CostSheetService } from "./cost-sheet.service";
import { CostSheetStore } from "./cost-sheet.store.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "cb-cost-sheet",
  templateUrl: "./cost-sheet.component.html",
  styleUrls: ["./cost-sheet.component.css"],
})
export class CostSheetComponent implements OnInit {
  onDestroy$ = new Subject<void>();
  @Input() job: Job;

  costSheetGroups$ = this.costSheetStore
    .getCostSheetGroups()
    .pipe(takeUntil(this.onDestroy$));

  costSheetResult: CostSheetResult;

  constructor(
    private costSheetService: CostSheetService,
    private costSheetStore: CostSheetStore
  ) {}

  ngOnInit(): void {
    this.costSheetService.getCostSheets().subscribe((response) => {
      this.costSheetResult = response.costSheetResult;
    });
  }
}
