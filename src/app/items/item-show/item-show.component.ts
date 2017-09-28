import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MdSnackBar } from '@angular/material';

import { ItemService } from '../item.service';
import { Item } from '../item.model';

@Component({
  selector: 'cb-item-show',
  templateUrl: './item-show.component.html'
})
export class ItemShowComponent implements OnInit {

  item: Item

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private snackBar: MdSnackBar
  ) { }

  ngOnInit() {
    let snackBar 
    let itemId = this.route.snapshot.params['id']
    snackBar = this.snackBar.open('Carregando item...')

    this.itemService.item(itemId)
    .subscribe(item => {
      this.item = item
      snackBar.dismiss()
    })        
  }

}
