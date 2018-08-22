import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';

import { ClientService } from '../client.service';
import { Client } from '../client.model';
import { AuthService } from '../../login/auth.service';
import { Pagination } from '../../shared/pagination.model';
import { EmployeeService } from '../../employees/employee.service';
import { Employee } from '../../employees/employee.model';
import { DataInfo } from '../../shared/data-info.model';
import { ClientType } from '../client-types/client-type.model';
import { ClientStatus } from '../client-status/client-status.model';
import { ClientStatusService } from '../client-status/client-status.service';
import { ClientTypeService } from '../client-types/client-type.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operator/debounceTime';

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
  clientTypes: ClientType[]
  clientStatus: ClientStatus[]
  attendances: Employee[]
  searching = false
  filter: boolean = false
  pagination: Pagination
  dataInfo: DataInfo

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private clientStatusService: ClientStatusService,
    private clientTypeService: ClientTypeService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  total(clients: Client[]) {
    return clients.length
  }

  permissionVerify(module: string, client: Client): boolean {
    let access: boolean
    let employee = this.authService.currentUser().employee
    switch(module) {
      case 'show': {
        access = client.employee.id != employee.id ? this.authService.hasAccess('clients/get/{id}') : true
        break
      }
      case 'edit': {
        access = client.employee.id != employee.id ? this.authService.hasAccess('client/edit') : true
        break
      }
      case 'delete': {
        access = client.employee.id != employee.id ? this.authService.hasAccess('client/remove/{id}') : true
        break
      }
      default: {
        access = false
        break
      }
    }
    return access
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

  ngOnInit() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search,
      attendance: this.fb.control(''),
      client_status: this.fb.control(''),
      rate: this.fb.control(''),
      client_type: this.fb.control('')
    })

    this.loadClients()

    this.clientTypeService.types().subscribe((clientTypes) => {
      this.clientTypes = clientTypes
    })

    this.clientStatusService.status().subscribe((clientStatus) => {
      this.clientStatus = clientStatus
    })

    this.employeeService.canInsertClients().subscribe((attendances) => {
      this.attendances = attendances
    })

    this.searchForm.valueChanges
    .pipe(distinctUntilChanged())
    .debounceTime(500)
    .subscribe(() => {
      let controls = this.searchForm.controls
      this.loadClients({
        search: controls.search.value,
        attendance: controls.attendance.value,
        client_status: controls.client_status.value,
        client_type: controls.client_type.value,
        rate: controls.rate.value,
      })
    })
  }

  loadClients(params = {}) {
    this.searching = true
    let snackBar = this.snackBar.open('Carregando clientes...')

    this.clientService.clients(params).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.clients = <Client[]> this.pagination.data
      snackBar.dismiss()
    })
  }

  filterToggle() {
    this.filter = this.filter ? false : true
  }

  filterForm() {
    this.searching = true
    this.clientService.clients(this.searchForm.value).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.clients = <Client[]> this.pagination.data
    })
  }

  compareClientType(clientType1: ClientType, clientType2: ClientType) {
    return clientType1.id === clientType2.id
  }

  compareClientStatus(clientStatus1: ClientStatus, clientStatus2: ClientStatus) {
    return clientStatus1.id === clientStatus2.id
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id
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

  changePage($event) {
    this.searching = true
    this.clients = []
    this.clientService.clients(this.searchForm.value, ($event.pageIndex + 1)).subscribe(dataInfo => {
      this.searching = false
      this.dataInfo = dataInfo
      this.pagination = dataInfo.pagination
      this.clients = <Client[]> this.pagination.data
    })
  }

}
