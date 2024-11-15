import { Component, OnInit, Injectable, Output, ElementRef, Renderer, ViewChild } from '@angular/core';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { Router } from '@angular/router';

import { AuthService } from '../../login/auth.service';
import { User } from '../../user/user.model';
import { API, FRONTEND_VERSION, BACKEND_VERSION } from 'app/app.api';
import { CheckInOrganizationFormComponent } from 'app/check-in/components/check-in-organization-form/check-in-organization-form.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'cb-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
  animations: [
    trigger('rowAppeared', [
      state('ready', style({opacity: 1})),
      transition('void => ready', animate('300ms 0s ease-in', keyframes([
        style({opacity: 0, transform: 'translateX(-30px)', offset: 0}),
        style({opacity: 0.8, transform: 'translateX(10px)', offset: 0.8}),
        style({opacity: 1, transform: 'translateX(0px)', offset: 1})
      ]))),
      transition('ready => void', animate('300ms 0s ease-out', keyframes([
        style({opacity: 1, transform: 'translateX(0px)', offset: 0}),
        style({opacity: 0.8, transform: 'translateX(-10px)', offset: 0.2}),
        style({opacity: 0, transform: 'translateX(30px)', offset: 1})
      ]))),
    ])
  ]
})
@Injectable()
export class SidenavComponent implements OnInit {

  state = 'ready'
  opened: boolean = true
  user: User

  administradores = false
  diretoria = false
  producao = false
  orcamento = false
  criacao = false
  events = false
  planejamento = false
  reports = false
  centroCusto = false
  atendimento = false
  clients = false
  API = API
  FRONTEND_VERSION = FRONTEND_VERSION
  BACKEND_VERSION = BACKEND_VERSION

  constructor(
    public dialog: MatDialog,
    private auth: AuthService,
    private route: Router
  ) { }

  hasNoPermission(user: User, url: string): boolean {
    return user.displays.filter(display => {
        return display.url === url
        && display.access === 'N'
    }).length > 0
  }

  hasNoPermissionDepartament(user: User, url: string, department: string): boolean {
   if (!user) {
    return;
   }

   const userDepartament = user.employee.department.description;

   if (userDepartament === "Diretoria") {
    return this.hasNoPermission(user, url);
   }

    return this.hasNoPermission(user, url) || userDepartament !== department;
  }

  ngOnInit() {
    this.user = this.auth.currentUser()
  }

  toggleMenu() {
    this.opened = this.opened === true ? false : true
  }

  addOrganizadora(): void {
    this.dialog.open(CheckInOrganizationFormComponent, {
      width: '500px',
    });
  }
}
