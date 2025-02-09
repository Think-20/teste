import { Http } from "@angular/http";
import { Injectable } from "@angular/core";
import { API } from "app/app.api";
import { AuthService } from "app/login/auth.service";
import { Task } from "app/schedule/task.model";
import { ErrorHandler } from "app/shared/error-handler.service";
import { FileUploadServiceInterface } from "app/shared/file-upload/file-upload-service.interface";
import { FileUploadInterface } from "app/shared/file-upload/file-upload.interface";
import { Observable } from "rxjs";
import { BriefingFile } from "./briefing-file.model";
import { MatSnackBar } from "@angular/material";

@Injectable()
export class BriefingService implements FileUploadServiceInterface {
  data: BriefingFile = new BriefingFile();
  task: Task = null;

  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {}

  create(): FileUploadInterface {
    return new BriefingFile();
  }

  delete(id: number): Observable<any> {
    let url = `briefing-files/remove/${id}`;

    return this.http
      .delete(`${API}/${url}`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });
        return ErrorHandler.capture(err);
      });
  }

  saveMultipleUrl(): string {
    return "briefing-files/save-multiple";
  }

  downloadUrl(briefingFile: FileUploadInterface) {
    return `briefing-files/download/${briefingFile.id}`;
  }

  viewUrl(briefingFile: FileUploadInterface) {
    return `${API}/briefing-files/view/${briefingFile.id}`;
  }

  previewFileUrl(briefingFile: FileUploadInterface) {
    return `briefing-files/download/${
      briefingFile.id
    }?access_token=${this.auth.token()}&user_id=${this.auth.currentUser().id}`;
  }

  downloadAllUrl(task: Task) {
    return `briefing-files/download-all/${
      task.id
    }?access_token=${this.auth.token()}&user_id=${this.auth.currentUser().id}`;
  }
}
