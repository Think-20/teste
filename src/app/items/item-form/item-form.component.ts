import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { MdSnackBar } from '@angular/material';

import { Item } from '../item.model';
import { ItemService } from '../item.service';  

import { ItemCategoryService } from '../../item-categories/item-category.service';
import { CostCategoryService } from '../../cost-categories/cost-category.service';
import { ItemCategory } from '../../item-categories/item-category.model';
import { CostCategory } from '../../cost-categories/cost-category.model';

import { Patterns } from '../../shared/patterns.model';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';

@Component({
  selector: 'cb-item-form',
  templateUrl: './item-form.component.html',
  animations: [
    trigger('rowAppeared', [
      state('ready', style({opaitemCategory: 1})),
      transition('void => ready', animate('300ms 0s ease-in', keyframes([
        style({opaitemCategory: 0, transform: 'translateX(-30px)', offset: 0}),
        style({opaitemCategory: 0.8, transform: 'translateX(10px)', offset: 0.8}),
        style({opaitemCategory: 1, transform: 'translateX(0px)', offset: 1})
      ]))),
      transition('ready => void', animate('300ms 0s ease-out', keyframes([
        style({opaitemCategory: 1, transform: 'translateX(0px)', offset: 0}),
        style({opaitemCategory: 0.8, transform: 'translateX(-10px)', offset: 0.2}),
        style({opaitemCategory: 0, transform: 'translateX(30px)', offset: 1})
      ]))),
    ])
  ]
})
@Injectable()
export class ItemFormComponent implements OnInit {

  @ViewChild('fileInput') fileInput
  typeForm: string
  rowAppearedCostCategory = 'ready'
  item: Item
  itemCategories: Observable<ItemCategory[]>
  costCategories: Observable<CostCategory[]>
  itemForm: FormGroup

  constructor(
    private costCategoryService: CostCategoryService,
    private itemCategoryService: ItemCategoryService,
    private itemService: ItemService,
    private formBuilder: FormBuilder,
    private snackBar: MdSnackBar,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {    
    let snackBarCostCategoryCharging
    this.typeForm = this.route.snapshot.url[0].path

    let costCategoryControl: FormControl = this.formBuilder.control('', [Validators.required])
    let itemCategoryControl: FormControl = this.formBuilder.control('', [Validators.required])
    
    this.itemForm = this.formBuilder.group({
      name: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]),
      description: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(255)
      ]),
      price: this.formBuilder.control('', [
        Validators.required
      ]),
      itemCategory: itemCategoryControl,
      costCategory: costCategoryControl
    })

    costCategoryControl.valueChanges
      .do(costCategoryName => {
         snackBarCostCategoryCharging = this.snackBar.open('Aguarde...')
      })
      .debounceTime(500)
      .subscribe(costCategoryName => { 
        this.costCategories = this.costCategoryService.costCategories(costCategoryName)
        Observable.timer(500).subscribe(timer => snackBarCostCategoryCharging.dismiss())
      })

    itemCategoryControl.valueChanges
      .do(costCategoryName => {
         snackBarCostCategoryCharging = this.snackBar.open('Aguarde...')
      })
      .debounceTime(500)
      .subscribe(itemCategoryName => { 
        this.itemCategories = this.itemCategoryService.itemCategories(itemCategoryName) 
        Observable.timer(500).subscribe(timer => snackBarCostCategoryCharging.dismiss())
      })

    if(this.typeForm === 'edit') {
      let snackBarCostCategoryCharging = this.snackBar.open('Carregando item...')
      let itemId = parseInt(this.route.snapshot.url[1].path)
      this.itemService.item(itemId).subscribe(item => {
        snackBarCostCategoryCharging.dismiss()
        this.item = item
          
        this.itemForm.controls.name.setValue(this.item.name)
        this.itemForm.controls.description.setValue(this.item.description)
        this.itemForm.controls.price.setValue(this.item.price)
      })
    }

  }

  showImage() {
    let fileInput = this.fileInput.nativeElement
    if(fileInput.files && fileInput.files[0]) {
      let file = fileInput.files[0]
      this.itemService.uploadImage(file).subscribe(response => console.log(response.json()))
    }
  }

  displayCostCategory(costCategory: CostCategory) {
    return costCategory.description
  }

  displayItemCategory(itemCategory: ItemCategory) {
    return itemCategory.description
  }

  save(item: Item) {
    this.itemService.save(item).subscribe(data => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })
    })
  }

  edit(item: Item, itemId: number) {
    item.id = itemId
    
    this.itemService.edit(item).subscribe(data => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })
    })
  }

}

