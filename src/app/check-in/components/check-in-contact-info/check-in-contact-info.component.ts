import { Component, Input } from '@angular/core';
import { CheckInModel } from 'app/check-in/check-in.model';
import { Client } from 'app/clients/client.model';
import { Contact } from 'app/contacts/contact.model';
import { Job } from 'app/jobs/job.model';

@Component({
  selector: 'cb-check-in-contact-info',
  templateUrl: './check-in-contact-info.component.html',
  styleUrls: ['./check-in-contact-info.component.css']
})
export class CheckInContactInfoComponent {

  @Input() job: Job = new Job();
  @Input() checkInModel = new CheckInModel();

  get client(): Client {
    return this.job && this.job.client ? this.job.client : new Client();
  }

  get clientContact(): Contact {
    return this.job && this.job.client && this.job.client.contacts.length >= 1 ? this.job.client.contacts[0] : new Contact();
  }

  get clientContacts(): Contact[] {
    if (!(this.job && this.job.client && this.job.client.contacts.length)) {
      return [];
    }

    const contacts = this.job.client.contacts;

    return contacts.slice(1, contacts.length);
  }

  get agency(): Client {
    return this.job && this.job.agency ? this.job.agency : new Client();
  }

  get agencyContact(): Contact {
    return this.job && this.job.agency && this.job.agency.contacts.length >= 1 ? this.job.agency.contacts[0] : new Contact();
  }

  get agencyContacts(): Contact[] {
    if (!(this.job && this.job.agency && this.job.agency.contacts.length)) {
      return [];
    }

    const contacts = this.job.agency.contacts;

    return contacts.slice(1, contacts.length);
  }

  addClient() {
    this.client.contacts.push({ cellphone: null } as Contact);
  }

  addAgency() {
    this.agency.contacts.push({ cellphone: null } as Contact);
  }

}
