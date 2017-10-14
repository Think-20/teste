import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { MdSnackBar } from '@angular/material';

import { Item } from '../item.model';
import { ItemCategory } from '../../item-categories/item-category.model';
import { CostCategory } from '../../cost-categories/cost-category.model';
import { Measure } from '../../measures/measure.model';
import { Provider } from '../../providers/provider.model';
import { Pricing } from '../../pricings/pricing.model';

import { ItemService } from '../item.service';
import { ItemCategoryService } from '../../item-categories/item-category.service';
import { CostCategoryService } from '../../cost-categories/cost-category.service';
import { MeasureService } from '../../measures/measure.service';
import { ProviderService } from '../../providers/provider.service';

import { ErrorHandler } from '../../shared/error-handler.service';
import { Patterns } from '../../shared/patterns.model';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';

@Component({
  selector: 'cb-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css'],
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
export class ItemFormComponent implements OnInit {

  @ViewChild('fileInput') fileInput
  typeForm: string
  rowAppearedState = 'ready'
  item: Item
  itemForm: FormGroup
  itemCategories: Observable<ItemCategory[]>
  costCategories: Observable<CostCategory[]>
  measures: Observable<Measure[]>
  providers: Observable<Provider[]>
  pricingsArray: FormArray
  imagePath: string = '/assets/images/sem-foto.jpg'

  constructor(
    private itemService: ItemService,
    private itemCategoryService: ItemCategoryService,
    private costCategoryService: CostCategoryService,
    private measureService: MeasureService,
    private providerService: ProviderService,
    private formBuilder: FormBuilder,
    private snackBar: MdSnackBar,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {    
    let snackBarStateCharging
    this.typeForm = this.route.snapshot.url[0].path
    
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
      image: this.formBuilder.control('sem-foto.jpg'),
      item_category: this.formBuilder.control('', [
        Validators.required
      ]),
      cost_category: this.formBuilder.control('', [
        Validators.required
      ]),
      pricings: this.formBuilder.array([])
    })

    this.itemForm.get('item_category').valueChanges.subscribe(itemCategory => {
      this.itemCategories = this.itemCategoryService.itemCategories(itemCategory)
    })

    this.itemForm.get('cost_category').valueChanges.subscribe(costCategory => {
      this.costCategories = this.costCategoryService.costCategories(costCategory)
    })

    if(this.typeForm === 'edit') {
      this.loadItem()
    } else {
      this.addPricing()
    }
  }

  showImage() {
    let fileInput = this.fileInput.nativeElement
    if(fileInput.files && fileInput.files[0]) {
      let file = fileInput._file ? fileInput._file : fileInput.files[0]
      this.itemService.uploadImage(file).subscribe(data => {
        this.imagePath = `http://localhost:8000/assets/images/${data.name}`
        this.itemForm.get('image').setValue(data.name)
      })
    }
  }

  displayProvider(provider: Provider): string {
    return provider.fantasy_name
  }

  displayMeasure(measure: Measure): string {
    return measure.description
  }

  displayItemCategory(itemCategory: ItemCategory): string {
    return itemCategory.description
  }

  displayCostCategory(costCategory: CostCategory): string {
    return costCategory.description
  }

  loadItem() {
    let snackBarStateCharging = this.snackBar.open('Carregando item...')
    let itemId = parseInt(this.route.snapshot.url[1].path)
    this.itemService.item(itemId).subscribe(item => {
      snackBarStateCharging.dismiss()
      this.item = item

      this.itemForm.controls.name.setValue(this.item.name)
      this.itemForm.controls.description.setValue(this.item.description)
      this.imagePath = `http://localhost:8000/assets/images/${this.item.image}`
      this.itemForm.controls.item_category.setValue(this.item.item_category)
      this.itemForm.controls.cost_category.setValue(this.item.cost_category)
      
      this.itemForm.controls.pricings.setValue([])

      for(let pricing of item.pricings) {
        this.addPricing(pricing)
      }
    })
  }

  get pricings() { return this.itemForm.get('pricings'); }

  addPricing(pricing?: Pricing) {
    const pricings = <FormArray>this.itemForm.controls['pricings']
    
    pricings.push(this.formBuilder.group({
      id: this.formBuilder.control(pricing ? pricing.id : '' || ''),
      price: this.formBuilder.control(pricing ? pricing.price : '' || '', [
        Validators.required
      ]),
      measure: this.formBuilder.control(pricing ? pricing.measure : '' || '', [
        Validators.required
      ]),
      provider: this.formBuilder.control(pricing ? pricing.provider : '' || '', [
        Validators.required
      ])
    }))

    pricings.at((pricings.length - 1)).get('measure').valueChanges.subscribe(measure => {
      this.measures = this.measureService.measures(measure)
    })

    pricings.at((pricings.length - 1)).get('provider').valueChanges.subscribe(provider => {
      this.providers = this.providerService.providers(provider)
    })
  }

  deletePricing(i) {
    const pricings = <FormArray>this.itemForm.controls['pricings']
    if(pricings.length > 1) pricings.removeAt(i)
  }

  getPricingsControls(itemForm: FormGroup) {
    return (<FormArray>this.itemForm.get('pricings')).controls
  } 

  save(item: Item) {
    if(ErrorHandler.formIsInvalid(this.itemForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    this.itemService.save(item).subscribe(data => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })
    })
  }

  edit(item: Item, itemId: number) {
    if(ErrorHandler.formIsInvalid(this.itemForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }
    
    item.id = itemId
    
    this.itemService.edit(item).subscribe(data => {
      this.snackBar.open(data.message, '', {
        duration: data.status ? 1000 : 5000
      }).afterDismissed().subscribe(observer => {
        this.loadItem()
      })
    })
  }
}

