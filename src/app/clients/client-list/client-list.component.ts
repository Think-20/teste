import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { ClientService } from '../client.service';
import { Client } from '../client.model';

@Component({
  selector: 'cb-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css'],
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
export class ClientListComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  search: FormControl
  clients: Client[] = []
  searching = false

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private snackBar: MatSnackBar
  ) { }

  total(clients: Client[]) {
    return clients.length
  }
  
  statusActive(clients: Client[]) {
    return clients.filter((client) => { return client.status.description == 'Ativo' }).length
  }
  
  statusInactive(clients: Client[]) {
    return clients.filter((client) => { return client.status.description == 'Inativo' }).length
  }
  
  typeAgencia(clients: Client[]) {
    return clients.filter((client) => { return client.type.description == 'Agência' }).length
  }
  
  typeExpositor(clients: Client[]) {
    return clients.filter((client) => { return client.type.description == 'Expositor' }).length
  }
  
  typeAutonomo(clients: Client[]) {
    return clients.filter((client) => { return client.type.description == 'Autônomo' }).length
  }
  
  score3Plus(clients: Client[]) {
    return clients.filter((client) => { return client.rate >= 3 }).length
  }
  
  score3Minus(clients: Client[]) {
    return clients.filter((client) => { return client.rate < 3 }).length
  }

  lastUpdate(clients: Client[]) {
    if(clients.length === 0) return

    return clients.reduce((previousValue, currentValue) => {
      return currentValue.updated_at > previousValue.updated_at ? currentValue : previousValue
    })
  }

  ngOnInit() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search
    })

    this.searching = true
    let snackBar = this.snackBar.open('Carregando clientes...')
    
    this.clientService.clients().subscribe(clients => {
      this.searching = false
      this.clients = clients
      snackBar.dismiss()
    })

    this.search.valueChanges
      .do(() => this.searching = true)
      .debounceTime(500)
      .subscribe(value => {
        this.clientService.clients(value).subscribe(searchClients => {
          this.searching = false
          this.clients = searchClients
        })
    })
  }

  delete(client: Client) {
    this.clientService.delete(client.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if(data.status) {
        this.clients.splice(this.clients.indexOf(client), 1)
      }
    })
  }
 
}
