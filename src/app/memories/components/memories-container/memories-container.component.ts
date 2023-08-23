import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Memory, MemoryGroup } from 'app/memories/memories.model';
import { MemoriesService } from 'app/memories/memories.service';

@Component({
  selector: 'app-memories-container',
  templateUrl: './memories-container.component.html',
  styleUrls: ['./memories-container.component.css']
})
export class MemoriesContainerComponent implements OnInit {

  @ViewChildren('collapse') collapses: QueryList<ElementRef>;

  memories: any = {};

  constructor(
    private snackBar: MatSnackBar,
    private memoriesService: MemoriesService
  ) { }

  ngOnInit() {
    this.load();
  }

  load(): void {
    const snackBar = this.snackBar.open('Carregando tarefas...')

    this.memoriesService.getMemories().subscribe(dataInfo => {
      this.memories = dataInfo || {};
      console.log(this.memories)
      snackBar.dismiss();
    })
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
