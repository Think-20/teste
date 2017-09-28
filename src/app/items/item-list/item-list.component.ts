import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MdSnackBar } from '@angular/material';

import { ItemService } from '../item.service';
import { Item } from '../item.model';

@Component({
  selector: 'cb-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
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
export class ItemListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  items: Item[]

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private snackBar: MdSnackBar
  ) { }

  ngOnInit() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search
    })

    let snackBar = this.snackBar.open('Carregando itens...')
    
    this.itemService.items().subscribe(items => {
      this.items = items
      snackBar.dismiss()
    })

    this.search.valueChanges
      .debounceTime(500)
      .subscribe(value => {
        this.itemService.items(value).subscribe(items => this.items = items)
    })
  }

  delete(item: Item) {
    this.itemService.delete(item.id).subscribe(() => {
      this.items.splice(this.items.indexOf(item), 1)
    })
  }
 
}
