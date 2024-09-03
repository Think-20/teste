import { Component, Input } from "@angular/core";
import { FormControl } from '@angular/forms';
import { City } from "app/address/city.model";
import { CityService } from "app/address/city.service";
import { State } from "app/address/state.model";
import { CheckInModel } from "app/check-in/check-in.model";
import { Client } from "app/clients/client.model";
import { Job } from "app/jobs/job.model";

@Component({
  selector: "cb-check-in-billing",
  templateUrl: "./check-in-billing.component.html",
  styleUrls: ["./check-in-billing.component.css"],
})
export class CheckInBillingComponent {
  @Input() job = new Job();
  @Input() checkInModel = new CheckInModel();

  costumer_service_employee = new FormControl(0);
  costumer_service_comission = new FormControl(0);
  costumer_service_employee2 = new FormControl(0);
  costumer_service_comission2 = new FormControl(0);
  creation_employee = new FormControl(0);
  creation_comission = new FormControl(0);
  creation_employee2 = new FormControl(0);
  creation_comission2 = new FormControl(0);
  production_manager_employee = new FormControl(0);
  production_manager_comission = new FormControl(0);
  production_manager_employee2 = new FormControl(0);
  production_manager_comission2 = new FormControl(0);
  budget_employee = new FormControl(0);
  budget_comission = new FormControl(0);
  budget_employee2 = new FormControl(0);
  budget_comission2 = new FormControl(0);
  detailing_employee = new FormControl(0);
  detailing_comission = new FormControl(0);
  detailing_employee2 = new FormControl(0);
  detailing_comission2 = new FormControl(0);
  production_employee = new FormControl(0);
  production_comission = new FormControl(0);
  production_employee2 = new FormControl(0);
  production_comission2 = new FormControl(0);


  get agencies(): Client[] {
    const agencies: Client[] = [];

    if (!this.job) {
      return agencies;
    }

    if (this.job.client) {
      agencies.push(this.job.client);
    }

    if (this.job.agency) {
      agencies.push(this.job.agency);
    }

    return agencies;
  }

  get agency(): Client {
    return this.selectedAgency ? this.selectedAgency : new Client();
  }

  get state(): State {
    return this.city && this.city.state ? this.city.state : new State();
  }

  city: City = new City();

  selectedAgency: Client;

  constructor(private cityService: CityService) {}

  updateAgency(agency: Client): void {
    this.selectedAgency = agency;

    this.loadCity(this.selectedAgency.city_id);
  }

  private loadCity(cityId: number): void {
    this.cityService.citiesById(cityId).subscribe({
      next: (city) => {
        this.city = city;
      },
    });
  }

  validatePercentage(
    event: { target: { value: string } },
    inputElement: HTMLInputElement,
    propertyName: string
  ) {
    let inputValue: string = event.target.value;

    let value = parseFloat(inputValue);

    if (!value || value < 0) {
      value = 0;
    }

    if (value > 100) {
      value = 100;
    }

    inputElement.value = value.toString();

    this.checkInModel[propertyName] = value;

    this.validateComissions(propertyName);
  }

  private validateComissions(propertyName: string): void {
    let propertyToCompare: string;

    if (propertyName.includes('2')) {
      [propertyToCompare,] = propertyName.split('2');
    }

    if (this.checkInModel[propertyToCompare] > this.checkInModel[propertyName]) {
      this.checkInModel[propertyToCompare] = this.checkInModel[propertyToCompare] - this.checkInModel[propertyName];

      return;
    }

    this.checkInModel[propertyToCompare] = this.checkInModel[propertyName] - this.checkInModel[propertyToCompare];
  }
}
