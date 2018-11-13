import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ItemCategory } from '../../item-categories/item-category.model';
import { ItemCategoryService } from '../../item-categories/item-category.service';

@Component({
  selector: 'cb-proposal-form',
  templateUrl: './proposal-form.component.html',
  styleUrls: ['./proposal-form.component.css']
})
export class ProposalFormComponent implements OnInit {

  proposalForm: FormGroup
  categories: ItemCategory[] = []

  constructor(
    private formBuilder: FormBuilder,
    private categoryService: ItemCategoryService
  ) { }

  ngOnInit() {
    this.proposalForm = this.formBuilder.group({})
    this.categoryService.itemsGroupByCategory().subscribe((itemCategories) => {
      this.categories = itemCategories
    })
  }

}
