import { Component, Input } from "@angular/core";

@Component({
    selector: 'cb-cost-sheet-item',
    templateUrl: './cost-sheet-item.component.html',
    styleUrls: ['./cost-sheet-item.component.css']
  })
export class CostSheetItemComponent {

  @Input() item;

  items = [ 
    { value: 'value', description: 'description' } ,
    { value: 'value', description: 'description' } ,
    { value: 'value', description: 'description' } ,
    { value: 'value', description: 'description' } ,
  ];

  
  compare(job1: any, job2: any) {
    return job1.id === job2.id
  }
}
