import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MdSnackBar } from '@angular/material';

import { AuthService } from './auth.service';
 
@Injectable()
export class AuthGuard implements CanActivate {
    
    constructor(
        private router: Router,
        private auth: AuthService,
        private snackBar: MdSnackBar
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ) {
        let iterativeRoute = route
        let user = this.auth.currentUser()
        let originalRoute = '/' + iterativeRoute.routeConfig.path

        while(iterativeRoute.parent !== null 
            && iterativeRoute.parent.routeConfig !== null 
            && iterativeRoute.parent.routeConfig.path != '') 
        {
            iterativeRoute = iterativeRoute.parent
            originalRoute = '/' + iterativeRoute.routeConfig.path + originalRoute
        }

        if(user === null) {
            this.snackBar.open('Desculpe, sua sessão expirou.', '', { duration: 3000 })
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } })
            return false;
        }

        let foundDisplays = user.displays.filter(display => {
            return display.url === originalRoute && display.access === 'N'
        })
        
        if(foundDisplays.length > 0) {
            this.snackBar.open('Desculpe, você não tem permissão de acesso para essa funcionalidade.', '', { duration: 3000 })
            return false;
        }

        return true;
    }

}