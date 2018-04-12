import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import {
  MatDialog, MatDialogModule, MatSlideToggleModule, MatSlideToggle,
  MatTableModule, MatProgressBarModule, MatCardModule, MatInputModule, MatSelectModule,
  MatButtonModule, MatIconModule, MatTabsModule, MatAutocompleteModule, MatChipsModule,
  MatSnackBar, MatSnackBarModule, MatMenuModule, MD_PLACEHOLDER_GLOBAL_OPTIONS,
  MatDatepickerModule, MAT_DATE_LOCALE, CompatibilityModule, NoConflictStyleCompatibilityMode,
  MatNativeDateModule, MatPaginatorModule, MatPaginatorIntl, MatTooltipModule
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ROUTES } from './app.routes';

import { HeaderModule } from './header/header.module';
import { LoginModule } from './login/login.module';
import { AppComponent } from './app.component';
import { MaskDirective } from './shared/mask.directive';

import { HomeComponent } from './home/home.component';
import { NotificationBarComponent } from './notification-bar/notification-bar.component';
import { MeasureComponent } from './measures/measure.component';
import { MeasureService } from './measures/measure.service';
import { FinalityComponent } from './finality/finality.component';
import { FinalityService } from './finality/finality.service';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { PurchaseOrderService } from './purchase-order/purchase-order.service';
import { UserComponent } from './user/user.component';
import { DepartmentComponent } from './department/department.component';
import { LayoutComponent } from './layout/layout.component';
import { StateService } from './address/state.service';
import { CityService } from './address/city.service';
import { ClientTypeService } from './clients/client-types/client-type.service';
import { ClientStatusService } from './clients/client-status/client-status.service';
import { EmployeeService } from './employees/employee.service';
import { BriefingService } from './briefings/briefing.service';

import { ClientFormComponent } from './clients/client-form/client-form.component';
import { ClientListComponent } from './clients/client-list/client-list.component';
import { ClientShowComponent } from './clients/client-show/client-show.component';
import { ClientImportComponent } from './clients/client-import/client-import.component';
import { ClientsComponent } from './clients/clients.component';
import { ClientService } from './clients/client.service';

import { ProviderFormComponent } from './providers/provider-form/provider-form.component';
import { ProviderListComponent } from './providers/provider-list/provider-list.component';
import { ProviderShowComponent } from './providers/provider-show/provider-show.component';
import { ProvidersComponent } from './providers/providers.component';
import { ProviderService } from './providers/provider.service';

import { BankAccountTypeService } from './bank-account-types/bank-account-type.service';
import { BankService } from './banks/bank.service';
import { PersonTypeService } from './person-types/person-type.service';

import { CostCategoryFormComponent } from './cost-categories/cost-category-form/cost-category-form.component';
import { CostCategoryListComponent } from './cost-categories/cost-category-list/cost-category-list.component';
import { CostCategoryShowComponent } from './cost-categories/cost-category-show/cost-category-show.component';
import { CostCategoriesComponent } from './cost-categories/cost-categories.component';
import { CostCategoryService } from './cost-categories/cost-category.service';

import { ItemCategoryFormComponent } from './item-categories/item-category-form/item-category-form.component';
import { ItemCategoryListComponent } from './item-categories/item-category-list/item-category-list.component';
import { ItemCategoryShowComponent } from './item-categories/item-category-show/item-category-show.component';
import { ItemCategoriesComponent } from './item-categories/item-categories.component';
import { ItemCategoryService } from './item-categories/item-category.service';

import { BriefingFormComponent } from './briefings/briefing-form/briefing-form.component';
import { BriefingListComponent } from './briefings/briefing-list/briefing-list.component';
import { BriefingShowComponent } from './briefings/briefing-show/briefing-show.component';
import { BriefingsComponent } from './briefings/briefings.component';

import { StandFormComponent } from './stand/stand-form/stand-form.component';
import { StandItemFormComponent } from './stand/stand-items/stand-item-form/stand-item-form.component';

import { JobService } from './jobs/job.service';
import { JobTypeService } from './job-types/job-type.service';
import { BriefingCompetitionService } from './briefing-competitions/briefing-competition.service';

import { ItemFormComponent } from './items/item-form/item-form.component';
import { ItemListComponent } from './items/item-list/item-list.component';
import { ItemShowComponent } from './items/item-show/item-show.component';
import { ItemsComponent } from './items/items.component';
import { ItemService } from './items/item.service';

import { StarsComponent } from './shared/stars/stars.component';
import { UploadFileService } from './shared/upload-file.service';
import { BriefingSpecialPresentationService } from 'app/briefing-special-presentations/briefing-special-presentation.service';
import { BriefingPresentationService } from 'app/briefing-presentations/briefing-presentation.service';
import { StandConfigurationService } from 'app/stand-configurations/stand-configuration.service';
import { StandGenreService } from 'app/stand-genres/stand-genre.service';
import { StandItemService } from 'app/stand/stand-items/stand-item.service';
import { PaginatorIntl } from 'app/shared/paginator-intl.model';
import { TimecardComponent } from './timecard/timecard.component';
import { TimecardService } from './timecard/timecard.service';
import { TimecardFormComponent } from './timecard/timecard-form/timecard-form.component';
import { TimecardListComponent } from './timecard/timecard-list/timecard-list.component';
import { TimecardApprovalsComponent } from './timecard/timecard-approvals/timecard-approvals.component';
import { TimecardPlaceService } from './timecard/timecard-place/timecard-place.service';

@NgModule({
  declarations: [
    MaskDirective,

    AppComponent,
    HomeComponent,
    NotificationBarComponent,
    MeasureComponent,
    FinalityComponent,
    PurchaseOrderComponent,
    UserComponent,
    DepartmentComponent,
    LayoutComponent,

    ClientsComponent,
    ClientFormComponent,
    ClientListComponent,
    ClientShowComponent,

    ProvidersComponent,
    ProviderFormComponent,
    ProviderListComponent,
    ProviderShowComponent,

    CostCategoriesComponent,
    CostCategoryFormComponent,
    CostCategoryListComponent,
    CostCategoryShowComponent,

    ItemCategoriesComponent,
    ItemCategoryFormComponent,
    ItemCategoryListComponent,
    ItemCategoryShowComponent,

    BriefingsComponent,
    BriefingFormComponent,
    BriefingListComponent,
    BriefingShowComponent,

    StandFormComponent,
    StandItemFormComponent,

    ItemsComponent,
    ItemFormComponent,
    ItemListComponent,
    ItemShowComponent,
    StarsComponent,
    ClientImportComponent,

    TimecardComponent,
    TimecardFormComponent,
    TimecardListComponent,
    TimecardApprovalsComponent
  ],
  imports: [
    BrowserModule,
    CompatibilityModule,
    NoConflictStyleCompatibilityMode,
    MatNativeDateModule,
    HeaderModule,
    LoginModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(ROUTES),

    MatTableModule,
    MatProgressBarModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatPaginatorModule,
    MatTooltipModule
  ],
  providers: [
    ClientService,
    ProviderService,
    BankAccountTypeService,
    BankService,
    PersonTypeService,
    CostCategoryService,
    ItemService,
    ItemCategoryService,
    PurchaseOrderService,
    MeasureService,
    FinalityService,
    CityService,
    StateService,
    ClientStatusService,
    ClientTypeService,
    EmployeeService,
    BriefingService,
    JobService,
    JobTypeService,
    BriefingCompetitionService,
    BriefingPresentationService,
    BriefingSpecialPresentationService,
    StandConfigurationService,
    StandGenreService,
    UploadFileService,
    StandItemService,
    TimecardService,
    TimecardPlaceService,

    MatDialog,
    MatSnackBar,
    MatSlideToggle,
    {provide: MD_PLACEHOLDER_GLOBAL_OPTIONS, useValue: { float: 'auto' }},
    {provide: LOCALE_ID, useValue: 'pt-BR'},
    {provide: MAT_DATE_LOCALE, useValue: 'pt-BR'},
    {provide: MatPaginatorIntl, useClass: PaginatorIntl}
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    StandItemFormComponent
  ]
})
export class AppModule { }
