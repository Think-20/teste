import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { Job } from "app/jobs/job.model";
import { ExtrasGridComponent } from './components/extras-grid/extras-grid.component';
import { ExtraModel } from 'app/shared/models/extra.model';
import { ExtraService } from './extra.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: "cb-extras",
  templateUrl: "./extras.component.html",
  styleUrls: ["./extras.component.scss"],
})
export class ExtrasComponent implements OnInit {
  @ViewChild('extrasGrid', { static: false }) extrasGrid!: ExtrasGridComponent;

  @Input() typeForm: string;

  @Input() job = new Job();

  extras: ExtraModel[] = [];

  loading = false;

  get valorTotalExtrasRecebido(): number {
    if (!this.extrasGrid) {
      return 0;
    }

    return this.extrasGrid.valorTotalExtrasRecebido;
  }
  
  get block(): boolean {
    if (this.job && this.job.status && this.job.status.id) {
      return this.job.status.id !== 3 || this.typeForm === "show";
    }

    return false;
  }

  constructor(
    private snackBar: MatSnackBar,
    private extrasService: ExtraService,
  ) {}

  ngOnInit(): void {
    this.extrasService.get().subscribe((response) => {
      this.extras = response && response.length
        ? response.filter((extra) => extra.job_id === this.job.id)
        : [];
    });
  }

  addExtra(): void {
    let message = this.snackBar.open('Adicionando nova versão de extra...');

    this.loading = true;

    this.extrasService.post({
      job_id: this.job.id,
      approval: 0,
      accept_client: 0,
    }).subscribe({
      next: (response) => {
        response.object.obs = null;

        this.extras.unshift(response.object);

        message.dismiss();

        this.loading = false;
      },
      error: () => {
        message.dismiss();

        this.loading = false;
      }
    });
  }
}
