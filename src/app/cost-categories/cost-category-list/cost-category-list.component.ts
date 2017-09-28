import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MdSnackBar } from '@angular/material';

import { CostCategoryService } from '../cost-category.service';
import { CostCategory } from '../cost-category.model';

@Component({
  selector: 'cb-costCategory-list',
  templateUrl: './cost-category-list.component.html',
  styleUrls: ['./cost-category-list.component.css'],
  animations: [
    trigger('rowAppeared', [
      state('ready', style({opacity: 1})),
      transition('void => ready', animate('300ms 0s ease-in', keyframes([
        style({opacity: 0, transform: 'translateX(-30px)', offset: 0}),
        style({opacity: 0.8, transform: 'translateX(10px)', offset: 0.8}),
        style({opacity: 1, transform: 'translateX(0px)', offset: 1})
      ]))),
      transition('ready => void', animate('300ms 0s ease-out', keyframes([
        style({opacity: 1, transform: 'translateX(0px)', offset: 0}),
        style({opacity: 0.8, transform: 'translateX(-10px)', offset: 0.2}),
        style({opacity: 0, transform: 'translateX(30px)', offset: 1})
      ])))
    ])
  ]
})
@Injectable()
export class CostCategoryListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  costCategories: CostCategory[]

  constructor(
    private fb: FormBuilder,
    private costCategoryService: CostCategoryService,
    private snackBar: MdSnackBar
  ) { }

  ngOnInit() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search
    })

    let snackBar = this.snackBar.open('Carregando categorias de custo...')
    
    this.costCategoryService.costCategories().subscribe(costCategories => {
      this.costCategories = costCategories
      snackBar.dismiss()
    })

    this.search.valueChanges
      .debounceTime(500)
      .subscribe(value => {
        this.costCategoryService.costCategories(value).subscribe(costCategories => this.costCategories = costCategories)
    })
  }

  delete(costCategory: CostCategory) {
    this.costCategoryService.delete(costCategory.id).subscribe(() => {
      this.costCategories.splice(this.costCategories.indexOf(costCategory), 1)
    })
  }
 
}
