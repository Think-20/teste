import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExternalCheckInService } from './external-check-in.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'cb-external-check-in',
  templateUrl: './external-check-in.component.html',
  styleUrls: ['./external-check-in.component.scss']
})
export class ExternalCheckInComponent implements OnInit, AfterViewInit {
  @ViewChild('reasonForRejectionField', { static: false })
  reasonForRejectionField: ElementRef<HTMLTextAreaElement>;
  
  debbug = false;
  
  id: number;
  hash: string;
  status: number;

  viewBox = false;
  success = false;
  loading = false;

  reasonForRejection: FormControl;

  get statusAccept(): boolean {
    return this.status === 1;
  }

  get statusRefuse(): boolean {
    return this.status === 2;
  }
  
  constructor(
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private externalCheckInService: ExternalCheckInService,
  ) { }

  ngOnInit() {
    this.id = Number(this.activatedRoute.snapshot.paramMap.get('id') || 0);

    this.hash = this.activatedRoute.snapshot.paramMap.get('hash') || '';

    this.status = Number(this.activatedRoute.snapshot.paramMap.get('status') || 0);

    this.debbug = Boolean(this.activatedRoute.snapshot.queryParamMap.get('debbug'));

    if (this.statusAccept) {
      this.accept();
    }

    if (this.statusRefuse) {
      this.reasonForRejection = new FormControl(null);

      this.viewBox = true;
    }
  }

  ngAfterViewInit(): void {
    if (this.statusRefuse) {
      setTimeout(() => {
        this.reasonForRejectionField.nativeElement.focus();
      });
    }
  }

  private accept(): void {
    const snackBarLoading = this.snackBar.open('Carregando...');

    if (this.debbug) {
      setTimeout(() => this.acceptNext(null, snackBarLoading), 1000);

      return;
    }

    this.externalCheckInService.accept(this.id, this.hash).subscribe({
      next: (response) => this.acceptNext(response, snackBarLoading),
      error: () => this.acceptError(snackBarLoading),
    });
  }

  private acceptNext(response: {
    error: string,
    message: string,
  }, snackBarLoading: MatSnackBarRef<SimpleSnackBar>): void {
    if (response && response.error && JSON.parse(response.error)) {
      this.acceptError(snackBarLoading);
      
      return;
    }
    
    snackBarLoading.dismiss();
        
    this.success = true;
    this.viewBox = true;
  }

  private acceptError(snackBarLoading: MatSnackBarRef<SimpleSnackBar>): void {
    snackBarLoading.dismiss();

    this.snackBar.open('Não foi possível confirmar o aceite da proposta.');
  }

  refuse(): void {
    if (!this.statusRefuse) {
      return;
    }

    this.loading = true;

    const snackBarLoading = this.snackBar.open('Carregando...');

    if (this.debbug) {
      setTimeout(() => this.refuseNext(null, snackBarLoading), 5000);

      return;
    }
    
    const reasonForRejection = this.reasonForRejection.value;

    this.externalCheckInService.refuse(this.id, this.hash, reasonForRejection).subscribe({
      next: (response) => this.refuseNext(response, snackBarLoading),
      error: () => this.refuseError(snackBarLoading),
    });
  }

  private refuseNext(response: {
    error: string,
    message: string,
  }, snackBarLoading: MatSnackBarRef<SimpleSnackBar>): void {
    if (response && response.error && JSON.parse(response.error)) {
      this.refuseError(snackBarLoading);

      return;
    }
    
    snackBarLoading.dismiss();

    this.success = true;
    this.loading = false;
  }

  private refuseError(snackBarLoading: MatSnackBarRef<SimpleSnackBar>): void {
    snackBarLoading.dismiss();

    this.loading = false;

    this.snackBar.open('Falha no processo \"Recusar Proposta\".');
  }
}
