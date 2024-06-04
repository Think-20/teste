import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material";
import { Observable } from "rxjs";
import { ClientTypeService } from "app/clients/client-types/client-type.service";
import { ClientType } from "app/clients/client-types/client-type.model";
import {
  InactiveTime,
  EClientType,
} from "./customer-notification-inactivation.model";
import { CustomeNotificationInactivationService } from "./customer-notification-inactivation.service";

@Component({
  selector: "cb-customer-notification-inactivation",
  templateUrl: "./customer-notification-inactivation.component.html",
  styleUrls: ["./customer-notification-inactivation.component.css"],
})
export class CustomeNotificationInactivationComponente implements OnInit {
  clientTypes: ClientType[];
  public inactiveTimeForm: FormGroup;

  inactiveTimes: InactiveTime[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private clientTypeService: ClientTypeService,
    private snackBar: MatSnackBar,
    private customeNotificationInactivationService: CustomeNotificationInactivationService
  ) {}

  ngOnInit() {
    this.loadClientTypes();
    this.loadInactiveTimes();
  }

  loadInactiveTimes() {
    this.customeNotificationInactivationService.get().subscribe((response) => {
      this.inactiveTimes = response;

      this.createForm();
    });
  }

  loadClientTypes() {
    let snackBar = this.snackBar.open("Carregando metas...");

    this.clientTypeService.types().subscribe(
      (response) => {
        this.clientTypes = response.filter(
          (x) => x.id !== EClientType.Autonomo
        );

        this.createForm();

        snackBar.dismiss();
      },
      () => snackBar.dismiss()
    );
  }

  createForm() {
    this.inactiveTimeForm = this.formBuilder.group({});

    this.inactiveTimes.forEach((type) => {
      this.inactiveTimeForm.addControl(
        `type--${type.id}`,
        this.formBuilder.control(type.type)
      );
      this.inactiveTimeForm.addControl(
        `notification_time--${type.id}`,
        this.formBuilder.control(type.notification_time)
      );
      this.inactiveTimeForm.addControl(
        `inactive_time--${type.id}`,
        this.formBuilder.control(type.inactive_time)
      );

      const control =
        this.inactiveTimeForm.controls[`notification_time--${type.id}`];
      const control2 =
        this.inactiveTimeForm.controls[`inactive_time--${type.id}`];

      control.valueChanges
        .do(() => {
          console.log("Aguarde...");
        })
        .debounceTime(1000)
        .subscribe((data) => {
          if (!data) {
            this.snackBar.open("Por favor informe o tempo para notificação!");
            this.dismissSnackBar();
            return;
          }

          const notification_time = control.value;
          const inactive_time = control2.value;

          this.createUpdate(type, notification_time, inactive_time);
        });

      control2.valueChanges
        .do(() => {
          console.log("Aguarde...");
        })
        .debounceTime(1000)
        .subscribe((data) => {
          if (!data) {
            this.snackBar.open("Por favor informe o tempo para inativação!");
            this.dismissSnackBar();
            return;
          }

          const notification_time = control.value;
          const inactive_time = control2.value;

          this.createUpdate(type, notification_time, inactive_time);
        });
    });
  }

  createUpdate(
    inactiveTime: InactiveTime,
    notification_time: number,
    inactive_time: number
  ) {
    const data: InactiveTime = {
      id: inactiveTime.id,
      type: inactiveTime.type,
      notification_time: notification_time,
      inactive_time: inactive_time,
    };

    if (data.id) this.update(data);
    else this.create(data);
  }

  update(data: InactiveTime) {
    this.customeNotificationInactivationService
      .update(data)
      .subscribe((response) => {
        this.snackBar.open(response.message);
        this.dismissSnackBar();
      });
  }

  create(data: InactiveTime) {
    this.customeNotificationInactivationService
      .post(data)
      .subscribe((response) => {
        this.snackBar.open(response.message);
        this.dismissSnackBar();
      });
  }

  dismissSnackBar() {
    Observable.timer(1000).subscribe(() => this.snackBar.dismiss());
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const keyCode = event.which || event.keyCode;
    const keyValue = String.fromCharCode(keyCode);

    if (!/^[0-9.,]$/.test(keyValue) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
  }
}
