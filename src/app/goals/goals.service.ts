import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { API } from 'app/app.api';
import { AuthService } from 'app/login/auth.service';
import { ErrorHandler } from 'app/shared/error-handler.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class GoalsService {
  searchValue: any = {}
  pageIndex = 0
  layoutGrid: string;
  layoutGrid2: string;

  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }
}