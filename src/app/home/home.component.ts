import { Component, OnInit, Type, ViewContainerRef } from '@angular/core';
import { EmployeeService } from 'app/employees/employee.service';
import { Employee } from 'app/employees/employee.model';
import { ClientType } from 'app/clients/client-types/client-type.model';
import { ClientTypeService } from 'app/clients/client-types/client-type.service';
import { ClientStatusService } from 'app/clients/client-status/client-status.service';
import { ClientStatus } from 'app/clients/client-status/client-status.model';
import { Client } from 'app/clients/client.model';
import { ClientService } from 'app/clients/client.service';
import { Observable } from 'rxjs';
import { DataInfo } from 'app/shared/data-info.model';
import { StarsComponent } from 'app/shared/stars/stars.component';
import { AuthService } from 'app/login/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'cb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  headerFilter: HeaderFilter;
  bodyData: BodyData;
  attendances: Employee[];
  clients: Client[];
  clientTypes: ClientType[];
  clientStatus: ClientStatus[];
  dataLoaded: boolean = false

  constructor(
    private employeeService: EmployeeService,
    private clientTypeService: ClientTypeService,
    private clientStatusService: ClientStatusService,
    private router: Router,
    private snackbar: MatSnackBar,
    private clientService: ClientService,
    private authService: AuthService,
  ) { }

  async loadData() {
    this.attendances = await this.employeeService.canInsertClients({
      deleted: true
    }).toPromise();
    this.clientTypes = await this.clientTypeService.types().toPromise();
    this.clientStatus = await this.clientStatusService.status().toPromise();
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

  async ngOnInit() {
    await this.loadData();

    this.headerFilter = {
      getParams: (formValue) => {
        return {
          search: formValue.search,
          attendance: formValue.attendance,
          client_status: formValue.client_status,
          client_type: formValue.client_type,
          rate: formValue.rate,
        }
      },
      filterFields: [
        {
          arrayValues: this.attendances,
          class: 'col-md-3',
          formcontrolname: 'attendance',
          placeholder: 'Atendimento',
          type: 'select',
          optionDescription: 'name',
        },
        {
          arrayValues: this.clientStatus,
          class: 'col-md-3',
          formcontrolname: 'client_type',
          placeholder: 'Tipo',
          type: 'select',
          optionDescription: 'description',
        },
        {
          arrayValues: this.clientTypes,
          class: 'col-md-3',
          formcontrolname: 'client_status',
          placeholder: 'Status',
          type: 'select',
          optionDescription: 'description',
        },
        {
          arrayValues: this.clientTypes,
          class: 'col-md-3 star-input',
          formcontrolname: 'rate',
          placeholder: 'Score',
          type: 'stars',
          starsRate: null,
        },
      ]
    }

    this.bodyData = {
      dataFields: [
        {
          style: { width: '20%' },
          label: 'Nome',
          showData: (client: Client) => { return client.fantasy_name }
        },
        {
          style: { width: '13%' },
          label: 'Tipo',
          showData: (client: Client) => { return client.type.description }
        },
        {
          style: { width: '12%' },
          label: 'Status',
          showData: (client: Client) => { return client.status.description }
        },
        {
          style: { width: '25%' },
          label: 'Atendimento',
          showData: (client: Client) => { return client.employee.name }
        },
        {
          style: { width: '20%' },
          label: 'Score',
          component: StarsComponent,
          afterCreateComponent: (client: Client, stars: StarsComponent) => {
            stars.rate = client.rate
            stars.readonly = true
          }
        },
      ],
      hasMenuButton: true,
      loadData: (params, page) => {
        return this.clientService.clients(params, page)
      },
      menuItems: [
        {
          icon: 'subject',
          label: 'Detalhes',
          actions: {
            click: (client: Client) => {
              return this.router.navigate(['/clients/show', client.id])
            },
            disabled: (client: Client) => {
              console.log(client)
              return !this.permissionVerify('show', client)
            }
          }
        },
        {
          icon: 'mode_edit',
          label: 'Editar',
          actions: {
            click: (client: Client) => {
              return this.router.navigate(['/clients/edit', client.id])
            },
            disabled: (client: Client) => {
              return !this.permissionVerify('edit', client)
            }
          }
        },

        {
          icon: 'delete',
          label: 'Remover',
          removeWhenClickTrue: true,
          actions: {
            click: (client: Client) => {
              return this.delete(client)
            },
            disabled: (client: Client) => {
              return !this.permissionVerify('delete', client)
            }
          }
        },
      ]
    }

    this.dataLoaded = true;
  }

  async delete(client: Client): Promise<boolean> {
    let data = await this.clientService.delete(client.id).toPromise()

    this.snackbar.open(data.message, '', {
      duration: 5000
    })

    return data.status
  }

}

export class FilterField {
  class: string
  placeholder: string
  formcontrolname: string
  arrayValues: Array<any>
  type: string
  optionValue?: string
  optionDescription?: string
  starsRate?: number

  compareWith? = function(var1: Identifiable, var2: Identifiable) {
    return var1.id === var2.id
  }

  showOptionValue? = function(obj) {
    if(this.optionValue != undefined)
      return obj[this.optionValue]

    return obj
  }

  showOptionDescription? = function (obj) {
    if(this.optionDescription != undefined)
      return obj[this.optionDescription]
  }

  constructor(params: FilterField) {
    this.class = params.class
    this.placeholder = params.placeholder
    this.formcontrolname = params.formcontrolname
    this.type = params.type
    this.arrayValues = params.arrayValues
    this.optionDescription = params.optionDescription
    this.optionValue = params.optionValue
    this.starsRate = params.starsRate
  }
}

export class DataField {
  style: {[key:string]: string}
  component?: Type<any>
  label: string

  showData? = function (obj) {
    this.hasData = true;

    if(this.optionDescription != undefined)
      return obj[this.optionDescription]
  }

  afterCreateComponent? = function (obj, instance) {
    return null
  };
}

export class HeaderFilter {
  filterFields: FilterField[];
  getParams: (formValue) => {[key: string]: string};
}

export class BodyData {
  dataFields: DataField[];
  hasMenuButton?: boolean = false
  buttonStyle?: {[key: string]: string} = { width: '5%' };
  menuData?: {[key: string]: string} = {};
  menuItems: ListDataMenuItem[]
  loadData: (params, page: number) => Observable<DataInfo>;
}

export class ListDataMenuItem {
  icon: string;
  label: string;
  removeWhenClickTrue?: boolean = false;
  actions: {
    disabled: (obj) => boolean,
    click: (obj) => Promise<boolean>,
  };
}

export interface Identifiable {
  id: number
}
