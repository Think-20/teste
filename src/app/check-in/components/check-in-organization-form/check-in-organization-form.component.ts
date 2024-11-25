import { AfterViewInit, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { Client } from 'app/clients/client.model';
import { ClientService } from 'app/clients/client.service';
import { Employee } from 'app/employees/employee.model';
import { AuthService } from 'app/login/auth.service';
import { OrganizationModel } from 'app/shared/models/organization.model';
import { OrganizationService } from 'app/shared/services/organization.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'cb-check-in-organization-form',
  templateUrl: './check-in-organization-form.component.html',
  styleUrls: ['./check-in-organization-form.component.css']
})
export class CheckInOrganizationFormComponent implements AfterViewInit {

  employee: Employee;

  clients: Client[];

  form = new FormGroup({
    client: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [Validators.required]),
    address: new FormControl(null, [Validators.required]),
    city: new FormControl(null, [Validators.required]),
    address_number: new FormControl(null, [Validators.required]),
    site: new FormControl(null, [Validators.minLength(7)]),
  });

  constructor(
    public dialog: MatDialogRef<CheckInOrganizationFormComponent>,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private clientService: ClientService,
    private organizationService: OrganizationService,
  ) { }

  ngAfterViewInit(): void {
    if (this.authService.currentUser().employee.department.description === 'Atendimento') {
      this.employee = this.authService.currentUser().employee;
    }

    this.getClients();
  }

  getClients(): void {
    let snackBarStateCharging: MatSnackBarRef<SimpleSnackBar>;
    
    this.form.get('client').valueChanges
      .do(() => snackBarStateCharging = this.snackBar.open('Aguarde...'))
      .debounceTime(500)
      .subscribe(client => {
        if (typeof client === 'object') {
          snackBarStateCharging.dismiss();

          return;
        }

        this.clientService.clients({
          search: client,
          attendance: this.employee
        }).subscribe(response => {
          this.clients = response.pagination.data.filter((client) => client.type.description === 'Agência');
        });

        Observable.timer(500).subscribe(() => snackBarStateCharging.dismiss());
      });
  }

  displayClient = (client: Client): string => client.fantasy_name;

  close(organization?: OrganizationModel): void {
    if (organization) {
      this.dialog.close(organization);

      return;
    }

    this.dialog.close();
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    let snackBarStateCharging: MatSnackBarRef<SimpleSnackBar>;

    const data = {
      ...this.form.value,
      client: null,
      client_id: this.form.controls.client.value.id
    };

    this.organizationService.save(data)
      .do(() => snackBarStateCharging = this.snackBar.open('Salvando...'))
      .subscribe(response => {
        snackBarStateCharging.dismiss();

        if (response.message) {
          snackBarStateCharging = this.snackBar.open(response.message);
          
          setTimeout(() => snackBarStateCharging.dismiss(), 2000);
        }
        
        if (response.object) {
          this.close(response.object);
        }
      });
  }

}
