import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login/login.component';
import { LayoutComponent } from './layout/layout.component';

import { ClientsComponent } from './clients/clients.component';
import { ClientFormComponent } from './clients/client-form/client-form.component';
import { ClientListComponent } from './clients/client-list/client-list.component';
import { ClientShowComponent } from './clients/client-show/client-show.component';
import { ClientImportComponent } from './clients/client-import/client-import.component';

import { ProvidersComponent } from './providers/providers.component';
import { ProviderFormComponent } from './providers/provider-form/provider-form.component';
import { ProviderListComponent } from './providers/provider-list/provider-list.component';
import { ProviderShowComponent } from './providers/provider-show/provider-show.component';

import { CostCategoryFormComponent } from './cost-categories/cost-category-form/cost-category-form.component';
import { CostCategoryListComponent } from './cost-categories/cost-category-list/cost-category-list.component';
import { CostCategoryShowComponent } from './cost-categories/cost-category-show/cost-category-show.component';
import { CostCategoriesComponent } from './cost-categories/cost-categories.component';

import { ItemCategoryFormComponent } from './item-categories/item-category-form/item-category-form.component';
import { ItemCategoryListComponent } from './item-categories/item-category-list/item-category-list.component';
import { ItemCategoryShowComponent } from './item-categories/item-category-show/item-category-show.component';
import { ItemCategoriesComponent } from './item-categories/item-categories.component';

import { ItemFormComponent } from './items/item-form/item-form.component';
import { ItemListComponent } from './items/item-list/item-list.component';
import { ItemShowComponent } from './items/item-show/item-show.component';
import { ItemsComponent } from './items/items.component';

import { BriefingFormComponent } from './briefings/briefing-form/briefing-form.component';
import { BriefingListComponent } from './briefings/briefing-list/briefing-list.component';
import { BriefingShowComponent } from './briefings/briefing-show/briefing-show.component';
import { BriefingsComponent } from './briefings/briefings.component';

import { TimecardComponent } from './timecard/timecard.component';

import { AuthGuard } from './login/auth.guard';
import { TimecardFormComponent } from './timecard/timecard-form/timecard-form.component';
import { TimecardListComponent } from './timecard/timecard-list/timecard-list.component';
import { TimecardApprovalsComponent } from './timecard/timecard-approvals/timecard-approvals.component';

import { ScheduleComponent } from './schedule/schedule.component';
import { BriefingTabsComponent } from './briefings/briefing-tabs/briefing-tabs.component';

export const ROUTES: Routes = [
    {
        path : 'login', component : LoginComponent
    },
    {
        path: '', component: LayoutComponent, children : [
            {
                path: '', redirectTo: 'home', pathMatch: 'full'
            },
            {
                path : 'home', component : HomeComponent, canActivate: [AuthGuard]
            },
            {
                path : 'cost-categories', component : CostCategoriesComponent, children: [
                    {
                        path: '', redirectTo: 'list', pathMatch: 'full', canActivate: [AuthGuard]
                    },
                    {
                        path: 'new', component: CostCategoryFormComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'edit/:id', component: CostCategoryFormComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'show/:id', component: CostCategoryShowComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'list', component: CostCategoryListComponent, canActivate: [AuthGuard]
                    }
                ]
            },
            {
                path : 'item-categories', component : ItemCategoriesComponent, children: [
                    {
                        path: '', redirectTo: 'list', pathMatch: 'full'
                    },
                    {
                        path: 'new', component: ItemCategoryFormComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'edit/:id', component: ItemCategoryFormComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'show/:id', component: ItemCategoryShowComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'list', component: ItemCategoryListComponent, canActivate: [AuthGuard]
                    }
                ]
            },
            {
                path : 'items', component : ItemsComponent, children: [
                    {
                        path: '', redirectTo: 'list', pathMatch: 'full'
                    },
                    {
                        path: 'new', component: ItemFormComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'edit/:id', component: ItemFormComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'show/:id', component: ItemShowComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'list', component: ItemListComponent, canActivate: [AuthGuard]
                    }
                ]
            },
            {
                path : 'clients', component : ClientsComponent, children: [
                    {
                        path: '', redirectTo: 'list', pathMatch: 'full'
                    },
                    {
                        path: 'new', component: ClientFormComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'edit/:id', component: ClientFormComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'show/:id', component: ClientShowComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'list', component: ClientListComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'import', component: ClientImportComponent, canActivate: [AuthGuard]
                    }
                ]
            },
            {
                path : 'providers', component : ProvidersComponent, children: [
                    {
                        path: '', redirectTo: 'list', pathMatch: 'full'
                    },
                    {
                        path: 'new', component: ProviderFormComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'edit/:id', component: ProviderFormComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'show/:id', component: ProviderShowComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'list', component: ProviderListComponent, canActivate: [AuthGuard]
                    }
                ]
            },
            {
                path : 'briefings', component : BriefingsComponent, children: [
                    {
                        path: '', redirectTo: 'list', pathMatch: 'full'
                    },
                    {
                        path: 'new', component: BriefingTabsComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'new/:available_date', component: BriefingTabsComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'edit/:id', component: BriefingTabsComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'show/:id', component: BriefingTabsComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'list', component: BriefingListComponent, canActivate: [AuthGuard]
                    }
                ]
            },
            {
                path : 'timecard', component : TimecardComponent, children: [
                  {
                      path: '', redirectTo: 'list', pathMatch: 'full'
                  },
                  {
                      path: 'new', component: TimecardFormComponent, canActivate: [AuthGuard]
                  },
                  {
                      path: 'edit/:id', component: TimecardFormComponent, canActivate: [AuthGuard]
                  },
                  {
                      path: 'list', component: TimecardListComponent, canActivate: [AuthGuard]
                  },
                  {
                      path: 'approvals', component: TimecardApprovalsComponent, canActivate: [AuthGuard]
                  }
                ]
            },
            {
                path : 'schedule', component : ScheduleComponent, canActivate: [AuthGuard]
                /*
                children: [
                  {
                      path: '', redirectTo: 'list', pathMatch: 'full'
                  },
                  {
                      path: 'new', component: TimecardFormComponent, canActivate: [AuthGuard]
                  },
                  {
                      path: 'edit/:id', component: TimecardFormComponent, canActivate: [AuthGuard]
                  },
                  {
                      path: 'list', component: TimecardListComponent, canActivate: [AuthGuard]
                  },
                  {
                      path: 'approvals', component: TimecardApprovalsComponent, canActivate: [AuthGuard]
                  }
                ]
                */
            }
        ]
    }
]
