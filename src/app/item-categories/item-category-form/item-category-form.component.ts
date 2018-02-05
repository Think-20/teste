import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { ItemCategory } from '../item-category.model';
import { ItemCategoryService } from '../item-category.service';

import { Patterns } from '../../shared/patterns.model';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';

@Component({
  selector: 'cb-item-category-form',
  templateUrl: './item-category-form.component.html',
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
      ]))),
    ])
  ]
})
@Injectable()
export class ItemCategoryFormComponent implements OnInit {

  typeForm: string
  rowAppearedState = 'ready'
  itemCategory: ItemCategory
  itemCategoryForm: FormGroup
  itemCategories: Observable<ItemCategory[]>

  constructor(
    private itemCategoryService: ItemCategoryService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {    
    let snackBarStateCharging
    this.typeForm = this.route.snapshot.url[0].path

    let itemCategoryControl: FormControl = this.formBuilder.control('')
    
    this.itemCategoryForm = this.formBuilder.group({
      description: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]),
      itemCategory: itemCategoryControl
    })

    itemCategoryControl.valueChanges
      .do(itemDescription => {
         snackBarStateCharging = this.snackBar.open('Aguarde...')
      })
      .debounceTime(500)
      .subscribe(itemDescription => { 
        this.itemCategories = this.itemCategoryService.itemCategories(itemDescription)
        Observable.timer(500).subscribe(timer => snackBarStateCharging.dismiss())
      })

    if(this.typeForm === 'edit') {
      let snackBarStateCharging = this.snackBar.open('Carregando categoria de item...')
      let itemCategoryId = parseInt(this.route.snapshot.url[1].path)
      this.itemCategoryService.itemCategory(itemCategoryId).subscribe(itemCategory => {
        snackBarStateCharging.dismiss()
        this.itemCategory = itemCategory
          
        this.itemCategoryForm.controls.description.setValue(this.itemCategory.description)
        this.itemCategoryForm.controls.itemCategory.setValue(this.itemCategory.item_category || '')
      })
    }

  }

  displayItemCategory(itemCategory: ItemCategory) {
    return itemCategory.description
  }

  save(itemCategory: ItemCategory) {
    this.itemCategoryService.save(itemCategory).subscribe(data => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })
    })
  }

  edit(itemCategory: ItemCategory, itemCategoryId: number) {
    itemCategory.id = itemCategoryId
    
    this.itemCategoryService.edit(itemCategory).subscribe(data => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })
    })
  }

}

