import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { UploadFileService } from '../../shared/upload-file.service';
import { ProjectFile } from '../project-file.model';
import { ProjectFileService } from '../project-file.service';

@Component({
  selector: 'cb-project-file-form',
  templateUrl: './project-file-form.component.html',
  styleUrls: ['./project-file-form.component.css']
})
export class ProjectFileFormComponent implements OnInit {
  @Input() typeForm: string
  projectFileForm: FormGroup

  constructor(
    private formBuilder: FormBuilder,
    private projectFileService: ProjectFileService,
    private uploadFileService: UploadFileService
  ) { }

  ngOnInit() {
    this.projectFileForm = this.formBuilder.group({
      files: this.formBuilder.array([]),
    })
  }

  getFilesControls() {
    return (<FormArray>this.projectFileForm.controls.files).controls
  }

  uploadFile(inputFile: HTMLInputElement) {
    let filenames: string[] = []

    this.uploadFileService.uploadFile(inputFile).subscribe((data) => {
      filenames = data.names
      let inputs = []
      filenames.forEach((filename) => {
       let reader = new FileReader()
        reader.readAsDataURL(inputFile.files[0])
        reader.onloadend = () => {
          this.addFile(filename, reader.result)
        }
      })
    })
  }

  previewFile(projectFile: ProjectFile, filename: string, type: string) {
    this.projectFileService.previewFile(projectFile, type, filename)
  }

  download(projectFile: ProjectFile, filename: string, type: String) {
    this.projectFileService.download(projectFile, type, filename).subscribe((blob) => {
      let fileUrl = URL.createObjectURL(blob)
      //window.open(fileUrl, '_blank')
      let anchor = document.createElement("a");
      anchor.download = filename;
      anchor.href = fileUrl;
      anchor.target = '_blank'
      anchor.click();
    })
  }

  addFile(file?: string, image?: string) {
    const files = <FormArray>this.projectFileForm.controls.files

    files.push(this.formBuilder.group({
      name: this.formBuilder.control({ value: (file ? file : ''), disabled: (this.typeForm === 'show' ? true : false) }),
      image: this.formBuilder.control(image)
    }))
  }

  deleteFile(i) {
    const files = <FormArray>this.projectFileForm.controls.files
    files.removeAt(i)
  }

}
