import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login/login.component';
import { LayoutComponent } from './layout/layout.component';

import { ClientsComponent } from './clients/clients.component';
import { ClientFormComponent } from './clients/client-form/client-form.component';
import { ClientListComponent } from './clients/client-list/client-list.component';
import { ClientShowComponent } from './clients/client-show/client-show.component';

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

import { AuthGuard } from './login/auth.guard';

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
                path : 'home', component : HomeComponent
            },
            {
                path : 'cost-categories', component : CostCategoriesComponent, children: [
                    {
                        path: '', redirectTo: 'list', pathMatch: 'full'
                    },
                    {
                        path: 'new', component: CostCategoryFormComponent
                    },
                    {
                        path: 'edit/:id', component: CostCategoryFormComponent
                    },
                    {
                        path: 'show/:id', component: CostCategoryShowComponent
                    },
                    {
                        path: 'list', component: CostCategoryListComponent
                    }
                ]
            },
            {
                path : 'item-categories', component : ItemCategoriesComponent, children: [
                    {
                        path: '', redirectTo: 'list', pathMatch: 'full'
                    },
                    {
                        path: 'new', component: ItemCategoryFormComponent
                    },
                    {
                        path: 'edit/:id', component: ItemCategoryFormComponent
                    },
                    {
                        path: 'show/:id', component: ItemCategoryShowComponent
                    },
                    {
                        path: 'list', component: ItemCategoryListComponent
                    }
                ]
            },
            {
                path : 'items', component : ItemsComponent, children: [
                    {
                        path: '', redirectTo: 'list', pathMatch: 'full'
                    },
                    {
                        path: 'new', component: ItemFormComponent
                    },
                    {
                        path: 'edit/:id', component: ItemFormComponent
                    },
                    {
                        path: 'show/:id', component: ItemShowComponent
                    },
                    {
                        path: 'list', component: ItemListComponent
                    }
                ]
            },
            {
                path : 'clients', component : ClientsComponent, children: [
                    {
                        path: '', redirectTo: 'list', pathMatch: 'full'
                    },
                    {
                        path: 'new', component: ClientFormComponent
                    },
                    {
                        path: 'edit/:id', component: ClientFormComponent
                    },
                    {
                        path: 'show/:id', component: ClientShowComponent
                    },
                    {
                        path: 'list', component: ClientListComponent
                    }
                ]
            },
            {
                path : 'providers', component : ProvidersComponent, children: [
                    {
                        path: '', redirectTo: 'list', pathMatch: 'full'
                    },
                    {
                        path: 'new', component: ProviderFormComponent
                    },
                    {
                        path: 'edit/:id', component: ProviderFormComponent
                    },
                    {
                        path: 'show/:id', component: ProviderShowComponent
                    },
                    {
                        path: 'list', component: ProviderListComponent
                    }
                ]
            }
        ],

        canActivate: [AuthGuard]
    }
]