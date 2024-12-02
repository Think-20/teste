import { OrganizationService } from 'app/shared/services/organization.service';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { OrganizationModel } from 'app/shared/models/organization.model';
import { OrganizationFormComponent } from './components/check-in-organization-form/organization-form.component';

@Component({
  selector: 'cb-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css'],
  animations: [
    trigger('rowAppeared', [
      state('ready', style({ opacity: 1 })),
      transition('void => ready', animate('300ms 0s ease-in', keyframes([
        style({ opacity: 0, transform: 'translateX(-30px)', offset: 0 }),
        style({ opacity: 0.8, transform: 'translateX(10px)', offset: 0.8 }),
        style({ opacity: 1, transform: 'translateX(0px)', offset: 1 })
      ]))),
      transition('ready => void', animate('300ms 0s ease-out', keyframes([
        style({ opacity: 1, transform: 'translateX(0px)', offset: 0 }),
        style({ opacity: 0.8, transform: 'translateX(-10px)', offset: 0.2 }),
        style({ opacity: 0, transform: 'translateX(30px)', offset: 1 })
      ])))
    ])
  ]
})
export class OrganizationComponent implements AfterViewInit {
  rowAppearedState = 'ready';

  search: string;

  organizations: OrganizationModel[] = [];
  organizationsFiltered: OrganizationModel[] = [];
  
  loading = true;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private organizationService: OrganizationService,
  ) { }

  ngAfterViewInit(): void {
    this.loadOrganizations();
  }

  private loadOrganizations(): void {
    this.loading = true;

    let snackBar = this.snackBar.open('Carregando organizadoras...')

    this.organizationService.organizations().subscribe(response => {
      this.organizations = response;

      this.filter();
      
      this.loading = false;

      snackBar.dismiss();
    });
  }

  filter(): void {
    if (!this.search || !this.organizations || this.organizations.length === 0) {
      this.organizationsFiltered = [...this.organizations];

      return;
    }

    const search = this.search.toLowerCase().trim();

    const organizations = this.organizations.filter(o => {
      return (o.name && o.name.toLowerCase().includes(search))
        || (o.address && o.address.toLowerCase().includes(search))
        || (o.address_number && o.address_number.toString().toLowerCase().includes(search))
        || (o.city && o.city.toString().toLowerCase().includes(search))
        || (o.site && o.site.toString().toLowerCase().includes(search));
    });

    this.organizationsFiltered = [...organizations];
  }

  add(): void {
    const modal = this.dialog.open(OrganizationFormComponent, {
      width: '500px',
    });

    modal.afterClosed().subscribe((result?: OrganizationModel) => {
      if (result) {
        this.loadOrganizations();
      }
    });
  }

  edit(organization: OrganizationModel): void {
    const modal = this.dialog.open(OrganizationFormComponent, {
      width: '500px',
    });

    modal.componentInstance.edit(organization);

    modal.afterClosed().subscribe((result?: OrganizationModel) => {
      if (result) {
        const index = this.organizations.findIndex(o => o.id === result.id);

        if (index !== -1) {
          this.organizations[index] = { ...result };
        }
      }
    });
  }

  delete(organization: OrganizationModel) {
    this.organizationService.delete(organization.id).subscribe((data) => {
      this.snackBar.open(data.message, '', { duration: 5000 });

      if (data.status) {
        this.organizations.splice(this.organizations.indexOf(organization), 1)
      }
    });
  }

  trackByOrganizationId(index: number, organization: OrganizationModel): number {
    return organization.id;
  }
}
