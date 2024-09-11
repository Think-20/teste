import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { State } from 'app/address/state.model';
import { CheckInModel } from 'app/check-in/check-in.model';
import { Client } from 'app/clients/client.model';
import { ClientService } from 'app/clients/client.service';
import { Contact } from 'app/contacts/contact.model';
import { Job } from 'app/jobs/job.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'cb-check-in-contact-info',
  templateUrl: './check-in-contact-info.component.html',
  styleUrls: ['./check-in-contact-info.component.css']
})
export class CheckInContactInfoComponent implements OnChanges {
  @Input() job: Job = new Job();
  @Input() checkInModel = new CheckInModel();

  client = new Client();

  get clientContact(): Contact {
    if (this.client && (!this.client.contacts || this.client.contacts.length <= 0)) {
      this.client.contacts = [new Contact()];
    }
    
    return this.client ? this.client.contacts[0] : new Contact();
  }

  get clientContacts(): Contact[] {
    if (!(this.client && this.client.contacts && this.client.contacts.length)) {
      return [];
    }

    const contacts = this.client.contacts;

    return contacts.slice(1, contacts.length);
  }

  agency = new Client();

  get agencyContact(): Contact {
    if (this.agency && (!this.agency.contacts || this.agency.contacts.length <= 0)) {
      this.agency.contacts = [new Contact()];
    }

    return this.agency ? this.agency.contacts[0] : new Contact();
  }

  get agencyContacts(): Contact[] {
    if (!(this.agency && this.agency.contacts && this.agency.contacts.length)) {
      return [];
    }

    const contacts = this.agency.contacts;

    return contacts.slice(1, contacts.length);
  }

  constructor(
    private clientService: ClientService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (Object.keys(changes).includes('job')) {
      if (this.job.client_id) {
        this.clientService.client(this.job.client_id).subscribe(client => {
          this.client = this.buildClient(client);
        });
      }
    
      if (this.job.agency_id) {
        this.clientService.client(this.job.agency_id).subscribe(agency => {
          this.agency = this.buildClient(agency);
        });
      }
    }
  }

  private buildClient(client: Client): Client {
    let state: State = null;
    let contacts: Contact[] = [{
      cellphone: client.mainphone,
      department: null,
      email: null,
      id: null,
      name: client ? client.fantasy_name : '...',
    }];

    if (client && client.city && client.city.state) {
      state = client.city.state;
    }

    if (client && client.contacts && client.contacts.length) {
      contacts = client.contacts.map(x => {
        return {
          cellphone: x.cellphone,
          department: x.department,
          email: x.email,
          id: x.id,
          name: x.name,
        };
      });
    }

    return {
      name: client.name,
      fantasy_name: client.fantasy_name,
      site: client.site,
      client_type: client.type,
      comission: client.comission,
      client_status: client.status,
      employee: client.employee,
      rate: client.rate,
      cnpj: client.cnpj,
      ie: client.ie,
      mainphone: client.mainphone,
      secundaryphone: client.secundaryphone,
      note: client.note,
      external: client.external,
      external_toggle: client.external_toggle,
      street: client.street,
      number: client.number,
      neighborhood: client.neighborhood,
      complement: client.complement,
      cep: client.cep,
      city: client.city,
      state,
      contacts,
      id: client.id
    };
  }

  addClient() {
    this.client.contacts.push({ cellphone: null } as Contact);
  }

  addAgency() {
    this.agency.contacts.push({ cellphone: null } as Contact);
  }

  save(): void {
    const client = {
      ...this.client,
      contacts: [this.clientContact, ...this.clientContacts],
    };

    const agency = {
      ...this.agency,
      contacts: [this.agencyContact, ...this.agencyContacts],
    };

    const clients: Client[] = [];

    if (this.job.client_id) {
      clients.push(client);
    }

    if (this.job.agency_id) {
      clients.push(agency);
    }

    forkJoin([
      this.clientService.edit(client),
      this.clientService.edit(agency),
    ]).subscribe();
  }

}
