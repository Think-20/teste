import { ExternalExtrasService } from './external-extras.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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

  extras: ExtraModel[] = [];

  
  get total(): number {
    if (!this.extras || !this.extras.length) {
      return 0;
    }

    if (this.extras.length == 1) {
      return this.extras[0].value * (this.extras[0].quantity || 1);
    }

    return this.extras
      .map(x => x.value * (x.quantity || 1))
      .reduce((prv, current) => prv + current);
  }
  

  constructor(
    private snackBar: MatSnackBar,
    readonly activatedRoute: ActivatedRoute,
    private externalExtrasService: ExternalExtrasService,
  ) {
    this.id = (activatedRoute.snapshot.paramMap.get('id') || 0) as number;

    this.hash = activatedRoute.snapshot.paramMap.get('hash') || '';
  }

  ngOnInit() {
    this.loadExtras();
  }
  
  private loadExtras(): void {
    this.externalExtrasService.get(this.id, this.hash).subscribe({
      next: (extras) => {
        if (extras && extras.length > 0) {
          this.extras = extras.filter(x => x.checkin_id === this.id);
        }
      }
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
        },
        error: (error) => {
          snackBarStateCharging.dismiss();

          this.loading = false;
        }
      });
  }
}
