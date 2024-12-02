import { ExternalExtrasService } from './external-extras.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { ExtraModel } from 'app/shared/models/extra.model';

@Component({
  selector: 'cb-external-extras',
  templateUrl: './external-extras.component.html',
  styleUrls: ['./external-extras.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalExtrasComponent implements OnInit {
  accepted = false;
  loading = false;

  id: number;
  hash: string;

  extrasList: ExtraModel[] = [];
  
  get total(): number {
    if (!this.extrasList || !this.extrasList.length) {
      return 0;
    }

    if (this.extrasList.length == 1) {
      return this.extrasList[0].value * (this.extrasList[0].quantity || 1);
    }

    return this.extrasList
      .map(x => x.value * (x.quantity || 1))
      .reduce((prv, current) => prv + current);
  }
  

  constructor(
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private externalExtrasService: ExternalExtrasService,
  ) { }

  ngOnInit() {
    this.id = Number(this.activatedRoute.snapshot.paramMap.get('id') || 0);

    this.hash = this.activatedRoute.snapshot.paramMap.get('hash') || '';

    this.loadExtras();
  }
  
  private loadExtras(): void {
    this.externalExtrasService.get(this.id, this.hash).subscribe((response) => {
      this.extrasList = [...response];
      
      this.changeDetectorRef.detectChanges();
    });
  }

  confirm(): void {
    if (this.accepted || this.loading) {
      return;
    }

    this.loading = true;

    let snackBarStateCharging: MatSnackBarRef<SimpleSnackBar> = null;

    this.externalExtrasService.confirm(this.id, this.hash)
      .do(() => snackBarStateCharging = this.snackBar.open('Carregando...'))
      .subscribe({
        next: () => {
          snackBarStateCharging.dismiss();

          this.accepted = true;

          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          snackBarStateCharging.dismiss();

          this.loading = false;

          this.changeDetectorRef.detectChanges();
        }
      });
  }
}
