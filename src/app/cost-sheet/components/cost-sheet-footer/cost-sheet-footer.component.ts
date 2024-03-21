import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CostSheetGroup } from "app/cost-sheet/cost-sheet.model";

@Component({
    selector: 'cb-cost-sheet-footer',
    templateUrl: './cost-sheet-footer.component.html',
    styleUrls: ['./cost-sheet-footer.component.css']
  })
export class CostSheetFooterComponent {
  @Input() costSheetGroup: CostSheetGroup;

  @Output() addCostShet = new EventEmitter<void>();
}
