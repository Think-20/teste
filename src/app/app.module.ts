import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { 
  MdTableModule, MdProgressBarModule, MdCardModule, MdInputModule, MdSelectModule, 
  MdButtonModule, MdIconModule, MdTabsModule, MdAutocompleteModule, MdChipsModule,
  MdSnackBar, MdSnackBarModule, MdMenuModule, MD_PLACEHOLDER_GLOBAL_OPTIONS
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ROUTES } from './app.routes';

import { HeaderModule } from './header/header.module';
import { LoginModule } from './login/login.module'; 
import { AppComponent } from './app.component';
import { MaskDirective } from './shared/mask.directive';

import { HomeComponent } from './home/home.component';
import { NotificationBarComponent } from './notification-bar/notification-bar.component';
import { MeasureComponent } from './measure/measure.component';
import { MeasureService } from './measure/measure.service';
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

import { ClientFormComponent } from './clients/client-form/client-form.component';
import { ClientListComponent } from './clients/client-list/client-list.component';
import { ClientShowComponent } from './clients/client-show/client-show.component';
import { ClientsComponent } from './clients/clients.component';
import { ClientService } from './clients/client.service';

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

import { ItemFormComponent } from './items/item-form/item-form.component';
import { ItemListComponent } from './items/item-list/item-list.component';
import { ItemShowComponent } from './items/item-show/item-show.component';
import { ItemsComponent } from './items/items.component';
import { ItemService } from './items/item.service';
import { StarsComponent } from './shared/stars/stars.component';

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
    
    CostCategoriesComponent,
    CostCategoryFormComponent,
    CostCategoryListComponent,
    CostCategoryShowComponent,
    
    ItemCategoriesComponent,
    ItemCategoryFormComponent,
    ItemCategoryListComponent,
    ItemCategoryShowComponent,
    
    ItemsComponent,
    ItemFormComponent,
    ItemListComponent,
    ItemShowComponent,
    StarsComponent
  ],
  imports: [
    BrowserModule,
    HeaderModule,
    LoginModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(ROUTES),

    MdTableModule,
    MdProgressBarModule,
    MdCardModule,
    MdInputModule,
    MdSelectModule,
    MdButtonModule,
    MdIconModule,
    MdTabsModule,
    MdAutocompleteModule,
    MdChipsModule,
    MdSnackBarModule,
    MdMenuModule
  ],
  providers: [
    ClientService,
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

    MdSnackBar,
    {provide: MD_PLACEHOLDER_GLOBAL_OPTIONS, useValue: { float: 'auto' }},
    {provide: LOCALE_ID, useValue: 'pt-BR'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
