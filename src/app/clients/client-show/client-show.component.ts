import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { ClientService } from '../client.service';
import { Client } from '../client.model';

@Component({
  selector: 'cb-client-show',
  templateUrl: './client-show.component.html',
  styleUrls: ['./client-show.component.css']
})
export class ClientShowComponent implements OnInit {

  client: Client

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    let snackBar 
    let clientId = this.route.snapshot.params['id']
    snackBar = this.snackBar.open('Carregando cliente...')

    this.clientService.client(clientId)
    .subscribe(client => {
      this.client = client
      snackBar.dismiss()
    })        
  }

}
