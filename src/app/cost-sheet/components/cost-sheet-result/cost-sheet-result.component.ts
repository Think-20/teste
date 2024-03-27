import { Component, Input } from "@angular/core";
import { CostSheetResult } from "app/cost-sheet/cost-sheet.model";

@Component({
    selector: 'cb-cost-sheet-result',
    templateUrl: './cost-sheet-result.component.html',
    styleUrls: ['./cost-sheet-result.component.css']
  })
export class CostSheetResultComponent {
  @Input() costSheetResult: CostSheetResult;
}
