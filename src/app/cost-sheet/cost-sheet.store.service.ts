import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { CostSheetGroup } from "./cost-sheet.model";

@Injectable()
export class CostSheetStore {
  private costSheetGroups$ = new BehaviorSubject<Partial<CostSheetGroup>[]>([]);

  constructor() {}

  getCostSheetGroups(): Observable<Partial<CostSheetGroup>[]> {
    return this.costSheetGroups$.asObservable();
  }

  setCostSheetGroups(costSheetGroups: Partial<CostSheetGroup>[]): void {
    this.costSheetGroups$.next(costSheetGroups);
  }
}
