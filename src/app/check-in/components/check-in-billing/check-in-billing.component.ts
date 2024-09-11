import { Employee } from 'app/employees/employee.model';
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
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
export class CheckInBillingComponent implements OnChanges {
  @Input() job = new Job();
  @Input() employees: Employee[] = [];
  @Input() checkInModel = new CheckInModel();

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
    const index = this.agencies.findIndex(x => x.id === this.checkInModel.billing_client_id);

    if (index >= 0) {
      return this.agencies[index];
    }

    return null;
  }

  get state(): State {
    return this.city && this.city.state ? this.city.state : new State();
  }

  city: City = new City();;

  constructor(
    private cityService: CityService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (Object.keys(changes).includes('checkInModel')) {
      const currentValue: CheckInModel = changes.checkInModel.currentValue;
      const previousValue: CheckInModel = changes.checkInModel.previousValue;

      if (currentValue && previousValue && currentValue.billing_client_id != previousValue.billing_client_id) {
        this.updateAgency(this.agency);
      }
    }
  }

  updateAgency(agency: Client): void {
    if (agency && agency.city_id) {
      this.loadCity(agency.city_id);
    }
  }

  private loadCity(cityId: number): void {
    this.cityService.citiesById(cityId).subscribe({
      next: (city) => {
        this.city = city;
      },
    });
  }
}
