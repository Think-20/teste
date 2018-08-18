import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { ProviderService } from '../provider.service';
import { Provider } from '../provider.model';

@Component({
  selector: 'cb-provider-list',
  templateUrl: './provider-list.component.html',
  styleUrls: ['./provider-list.component.css'],
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
export class ProviderListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  providers: Provider[] = []
  searching = false

  constructor(
    private fb: FormBuilder,
    private providerService: ProviderService,
    private snackBar: MatSnackBar
  ) { }

  total(providers: Provider[]) {
    return providers.length
  }
  
  score3Plus(providers: Provider[]) {
    return providers.filter((provider) => { return provider.rate >= 3 }).length
  }
  
  score3Minus(providers: Provider[]) {
    return providers.filter((provider) => { return provider.rate < 3 }).length
  }

  lastUpdate(providers: Provider[]) {
    if(providers.length === 0) return

    return providers.reduce((previousValue, currentValue) => {
      return currentValue.updated_at > previousValue.updated_at ? currentValue : previousValue
    })
  }

  ngOnInit() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search
    })

    this.searching = true
    let snackBar = this.snackBar.open('Carregando fornecedores...')
    
    this.providerService.providers().subscribe(providers => {
      this.searching = false
      this.providers = providers
      snackBar.dismiss()
    })

    this.search.valueChanges
      .do(() => this.searching = true)
      .debounceTime(500)
      .subscribe(value => {
        this.providerService.providers(value).subscribe(searchProviders => {
          this.searching = false
          this.providers = searchProviders
        })
    })
  }

  delete(provider: Provider) {
    this.providerService.delete(provider.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if(data.status) {
        this.providers.splice(this.providers.indexOf(provider), 1)
      }
    })
  }
 
}
