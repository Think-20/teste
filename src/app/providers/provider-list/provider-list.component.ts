import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { ProviderService } from '../provider.service';
import { Provider } from '../provider.model';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'cb-provider-list',
  templateUrl: './provider-list.component.html',
  styleUrls: ['./provider-list.component.css'],
  animations: [
    trigger('rowAppeared', [
      state('ready', style({ opacity: 1 })),
      transition('void => ready', animate('300ms 0s ease-in', keyframes([
        style({ opacity: 0, transform: 'translateX(-30px)', offset: 0 }),
        style({ opacity: 0.8, transform: 'translateX(10px)', offset: 0.8 }),
        style({ opacity: 1, transform: 'translateX(0px)', offset: 1 })
      ]))),
      transition('ready => void', animate('300ms 0s ease-out', keyframes([
        style({ opacity: 1, transform: 'translateX(0px)', offset: 0 }),
        style({ opacity: 0.8, transform: 'translateX(-10px)', offset: 0.2 }),
        style({ opacity: 0, transform: 'translateX(30px)', offset: 1 })
      ])))
    ])
  ]
})
@Injectable()
export class ProviderListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  formCopy: FormGroup
  search: FormControl
  providers: Provider[] = []
  pageIndex: number
  params = {}
  hasFilterActive = false
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
    if (providers.length === 0) return

    return providers.reduce((previousValue, currentValue) => {
      return currentValue.updated_at > previousValue.updated_at ? currentValue : previousValue
    })
  }

  ngOnInit() {
    this.pageIndex = this.providerService.pageIndex

    this.createForm()
    this.loadInitialData()
  }

  createForm() {
    this.search = this.fb.control('')
    this.formCopy = this.fb.group({
      search: this.search,
    })

    this.searchForm = Object.create(this.formCopy)

    if (JSON.stringify(this.providerService.searchValue) == JSON.stringify({})) {
      //this.providerService.searchValue = this.searchForm.value
      this.providerService.searchValue = ''
    } else {
      //this.searchForm.setValue(this.providerService.searchValue)
      this.searchForm.controls.search.setValue(this.providerService.searchValue)
    }

    this.searchForm.valueChanges
      .pipe(distinctUntilChanged())
      .debounceTime(500)
      .subscribe((searchValue) => {
        let controls = this.searchForm.controls

        /*
        this.params = {
          search: controls.search.value,
        }

        this.loadProviders(this.params, 1)
        */
        this.loadProviders(controls.search.value, 1)

        this.pageIndex = 0
        this.providerService.pageIndex = 0
        //this.providerService.searchValue = searchValue
        this.providerService.searchValue = controls.search.value
        this.updateFilterActive()
      })
  }

  updateFilterActive() {
    /*
    if (JSON.stringify(this.providerService.searchValue) === JSON.stringify(this.formCopy.value)) {
      this.hasFilterActive = false
    } else {
      this.hasFilterActive = true
    }
    */
    if (this.providerService.searchValue == '') {
      this.hasFilterActive = false
    } else {
      this.hasFilterActive = true
    }
  }

  clearFilter() {
    this.providerService.searchValue = ''
    this.providerService.pageIndex = 0
    this.pageIndex = 0
    this.createForm()
    this.loadInitialData()
  }

  loadInitialData() {
    /*
    if (JSON.stringify(this.providerService.searchValue) === JSON.stringify(this.formCopy.value)) {
      this.loadProviders({}, this.pageIndex + 1)
    } else {
      this.loadProviders(this.providerService.searchValue, this.providerService.pageIndex + 1)
    }
    */

    if (this.providerService.searchValue == '') {
      this.loadProviders('', this.pageIndex + 1)
    } else {
      this.loadProviders(this.providerService.searchValue, this.providerService.pageIndex + 1)
    }

    this.updateFilterActive()
  }

  loadProviders(params, page: number) {
    this.searching = true
    let snackBar = this.snackBar.open('Carregando fornecedores...')

    this.providerService.providers(params).subscribe(providers => {
      this.searching = false
      this.providers = providers
      snackBar.dismiss()
    })
  }

  delete(provider: Provider) {
    this.providerService.delete(provider.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if (data.status) {
        this.providers.splice(this.providers.indexOf(provider), 1)
      }
    })
  }

}
