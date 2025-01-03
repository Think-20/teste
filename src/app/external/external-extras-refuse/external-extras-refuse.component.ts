import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'cb-external-extras-refuse',
  templateUrl: './external-extras-refuse.component.html',
  styleUrls: ['./external-extras-refuse.component.scss']
})
export class ExternalExtrasRefuseComponent implements OnInit, AfterViewInit {
  @ViewChild('reasonForRejectionField', { static: false })
  reasonForRejectionField: ElementRef<HTMLTextAreaElement>;
  
  debbug = false;
  
  id: number;
  hash: string;
  status: number;

  success = false;
  loading = false;

  reasonForRejection: FormControl;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.id = Number(this.activatedRoute.snapshot.paramMap.get('id') || 0);

    this.hash = this.activatedRoute.snapshot.paramMap.get('hash') || '';

    this.debbug = Boolean(this.activatedRoute.snapshot.queryParamMap.get('debbug'));

    this.reasonForRejection = new FormControl(null);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.reasonForRejectionField.nativeElement.focus();
    });
  }

  refuse(): void {
    if (this.loading || this.success) {
      return;
    }

    this.loading = true;

    const snackBarLoading = this.snackBar.open('Carregando...');

    if (this.debbug) {
      setTimeout(() => this.refuseNext(null, snackBarLoading), 5000);

      return;
    }
    
    const reasonForRejection = this.reasonForRejection.value;

    // this.externalCheckInService.refuse(this.id, this.hash, reasonForRejection).subscribe({
    //   next: (response) => this.refuseNext(response, snackBarLoading),
    //   error: () => this.refuseError(snackBarLoading),
    // });
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

    this.snackBar.open('Falha no processo \"Recusar itens extras\".');
  }

  goBack(): void {
    this.router.navigate(['external/extras', this.id, this.hash]);
  }
}
