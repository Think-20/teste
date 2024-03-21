import { Component, Input } from "@angular/core";
import { CostSheetGroup } from "app/cost-sheet/cost-sheet.model";

@Component({
    selector: 'cb-cost-sheet-header',
    templateUrl: './cost-sheet-header.component.html',
    styleUrls: ['./cost-sheet-header.component.css']
  })
export class CostSheetHeaderComponent {

  @Input() costSheetGroup: CostSheetGroup;

}
