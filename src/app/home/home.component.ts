import { Component, OnInit } from '@angular/core';
import { EmployeeService } from 'app/employees/employee.service';
import { Employee } from 'app/employees/employee.model';
import { ClientType } from 'app/clients/client-types/client-type.model';
import { ClientTypeService } from 'app/clients/client-types/client-type.service';
import { ClientStatusService } from 'app/clients/client-status/client-status.service';
import { ClientStatus } from 'app/clients/client-status/client-status.model';

@Component({
  selector: 'cb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  filterFields: FilterField[];
  attendances: Employee[];
  clientTypes: ClientType[];
  clientStatus: ClientStatus[];
  dataLoaded: boolean = false

  constructor(
    private employeeService: EmployeeService,
    private clientTypeService: ClientTypeService,
    private clientStatusService: ClientStatusService,
  ) { }

  async loadData() {
    this.attendances = await this.employeeService.canInsertClients({
      deleted: true
    }).toPromise();
    this.clientTypes = await this.clientTypeService.types().toPromise();
    this.clientStatus = await this.clientStatusService.status().toPromise();
  }

  async ngOnInit() {
    await this.loadData();

    this.filterFields = [
      mF({
        arrayValues: this.attendances,
        class: 'col-md-3',
        formcontrolname: 'attendance',
        placeholder: 'Atendimento',
        type: 'select',
        optionDescription: 'name',
      }),
      mF({
        arrayValues: this.clientStatus,
        class: 'col-md-3',
        formcontrolname: 'client_type',
        placeholder: 'Tipo',
        type: 'select',
        optionDescription: 'description',
      }),
      mF({
        arrayValues: this.clientTypes,
        class: 'col-md-3',
        formcontrolname: 'client_status',
        placeholder: 'Status',
        type: 'select',
        optionDescription: 'description',
      }),
      mF({
        arrayValues: this.clientTypes,
        class: 'col-md-3 star-input',
        formcontrolname: 'rate',
        placeholder: 'Score',
        type: 'stars',
        starsRate: null,
      }),

    ];

    this.dataLoaded = true;
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

export function mF(params: FilterField): FilterField {
  return new FilterField(params)
}

export interface Identifiable {
  id: number
}
