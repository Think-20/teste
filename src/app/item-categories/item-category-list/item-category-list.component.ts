import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { ItemCategoryService } from '../item-category.service';
import { ItemCategory } from '../item-category.model';

@Component({
  selector: 'cb-itemCategory-list',
  templateUrl: './item-category-list.component.html',
  styleUrls: ['./item-category-list.component.css'],
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
export class ItemCategoryListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  itemCategories: ItemCategory[] = []
  searching = false

  constructor(
    private fb: FormBuilder,
    private itemCategoryService: ItemCategoryService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search
    })

    let snackBar = this.snackBar.open('Carregando categorias de item...')

    this.itemCategoryService.itemCategories().subscribe(itemCategories => {
      this.itemCategories = itemCategories
      snackBar.dismiss()
    })

    this.search.valueChanges
      .debounceTime(500)
      .subscribe(value => {
        this.itemCategoryService.itemCategories(value).subscribe(itemCategories => this.itemCategories = itemCategories)
    })
  }

  delete(itemCategory: ItemCategory) {
    this.itemCategoryService.delete(itemCategory.id).subscribe(() => {
      this.itemCategories.splice(this.itemCategories.indexOf(itemCategory), 1)
    })
  }

}
