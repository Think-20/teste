import { Employee } from 'app/employees/employee.model';
import { AfterViewInit, Component, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import { City } from "app/address/city.model";
import { CityService } from "app/address/city.service";
import { State } from "app/address/state.model";
import { CheckInModel } from "app/check-in/check-in.model";
import { Client } from "app/clients/client.model";
import { Job } from "app/jobs/job.model";
import { Observable, of, Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { takeUntil } from 'rxjs/operators';
import { StateService } from 'app/address/state.service';

@Component({
  selector: "cb-check-in-billing",
  templateUrl: "./check-in-billing.component.html",
  styleUrls: ["./check-in-billing.component.css"],
})
export class CheckInBillingComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() job = new Job();
  @Input() employees: Employee[] = [];
  @Input() checkInModel = new CheckInModel();

  states: Observable<State[]>;

  cities: Observable<City[]>;

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

  cityControl = new FormControl();

  stateControl = new FormControl();

  private onDestroy$ = new Subject<void>();

  constructor(
    private snackBar: MatSnackBar,
    private cityService: CityService,
    private stateService: StateService,
  ) {}

  ngAfterViewInit(): void {
    this.observerCity();
    this.observerState();
  }

  private observerCity = (): void => {
    let snackBarStateCharging: MatSnackBarRef<SimpleSnackBar> = null;

    this.cityControl.valueChanges
      .debounceTime(500)
      .do(() => snackBarStateCharging = this.snackBar.open('Aguarde...'))
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(cityName => {
        if (!this.stateControl.value || !cityName) {
          this.cities = of([]);
          
          snackBarStateCharging.dismiss();

          return;
        }

        let stateId = this.stateControl.value.id || this.stateControl.value;

        this.cities = this.cityService.cities(stateId, cityName);

        snackBarStateCharging.dismiss();
      }, () => {
        snackBarStateCharging.dismiss();
      });
  }

  private observerState = (): void => {
    let snackBarStateCharging: MatSnackBarRef<SimpleSnackBar> = null;

    this.stateControl.valueChanges
      .debounceTime(500)
      .do(() => snackBarStateCharging = this.snackBar.open('Aguarde...'))
      .subscribe(stateName => {
        this.states = this.stateService.states(stateName);

        snackBarStateCharging.dismiss();
      }, () => {
        snackBarStateCharging.dismiss();
      });
  }

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

  displayState = (state: State) => state ? state.name : null;

  displayCity = (city: City) => city ? city.name : null;

  private loadCity(cityId: number): void {
    this.cityService.citiesById(cityId).subscribe({
      next: (city) => {
        this.cityControl.setValue(city);

        this.stateControl.setValue(city.state);
      },
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
