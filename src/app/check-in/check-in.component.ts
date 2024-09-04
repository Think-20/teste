import { CheckInModel } from "app/check-in/check-in.model";
import { AfterViewInit, Component, Input } from "@angular/core";
import { Job } from "app/jobs/job.model";
import { CheckInService } from "./check-in.service";

@Component({
  selector: "cb-check-in",
  templateUrl: "./check-in.component.html",
  styleUrls: ["./check-in.component.css"],
})
export class CheckInComponent implements AfterViewInit {
  @Input() job: Job = new Job();

  checkInModel: CheckInModel = new CheckInModel();

  constructor(private checkInService: CheckInService) {}

  ngAfterViewInit() {
    this.getCheckInModel();
  }

  private getCheckInModel(): void {
    if (this.job.checkin) {
      this.checkInModel = this.job.checkin;

      return;
    }

    this.checkInModel.job_id = this.job.id;

    this.save();
  }

  save(): void {
    (this.job.checkin
      ? this.checkInService.put(this.checkInModel)
      : this.checkInService.post(this.checkInModel)
    ).subscribe({
      next: (response) => {
        if (response.object) {
          this.checkInModel = response.object;

          this.job.checkin = this.checkInModel;
        }
      },
    });
  }
}
