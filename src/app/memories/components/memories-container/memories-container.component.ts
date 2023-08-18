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

  memories: MemoryGroup = {};
  isButtonPressed: boolean[] = [];
  showOnlyUnread: boolean = false;

  constructor(
    private snackBar: MatSnackBar,
    private memoriesService: MemoriesService
  ) { }

  ngOnInit() {
    this.load();
  }

  load(): void {
    const snackBar = this.snackBar.open('Carregando tarefas...')

    this.memoriesService.getMemories(this.showOnlyUnread).subscribe(dataInfo => {
      this.memories = dataInfo || {};
      snackBar.dismiss();
    })
  }

  toggleShowOnlyUnread(): void {
    this.showOnlyUnread = !this.showOnlyUnread;
    this.isButtonPressed = this.isButtonPressed.map(_ => false);
    this.closeAllCollapses();
    this.load();
  }

  closeAllCollapses(): void {
    this.collapses.forEach(collapse => {
      collapse.nativeElement.classList.remove('show');
    });
  }

  onSwitchChange(memory: Memory, groupName: string): void {

    this.memoriesService.updateReadMemory(memory.id).subscribe(() => {
      memory.read = 1;
      const group = this.memories[groupName];
      if (group && this.showOnlyUnread === true) {
        const index = group.findIndex(item => item.id === memory.id);
        if (index !== -1) {
          group.splice(index, 1);
    }
  }
    });
  }

  getObjectKeys(obj: MemoryGroup): string[] {
    return Object.keys(obj);
  }

  toggleButtonPress(index: number): void {
    this.isButtonPressed[index] = !this.isButtonPressed[index];
  }

  applyMask(str: string): string {
    const words = str.split(' ');

    for (let i = 0; i < words.length; i++) {
      if (/^\d$/.test(words[i])) { // Verifica se a palavra é um dígito único
        words[i] = '0' + words[i]; // Incrementa 0 à frente do dígito
      }
    }

    const firstWord = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    words[0] = firstWord;

    return words.join(' ');
  }
}
