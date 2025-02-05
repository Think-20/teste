import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "cb-developing",
  templateUrl: "./developing.component.html",
  styleUrls: ["./developing.component.scss"],
})
export class DevelopingComponent implements OnInit {
  @Input() text = "Em desenvolvimento...";
  
  svg: string;

  ngOnInit(): void {
    this.svg = `assets/images/svgs/developing-${Math.floor(Math.random() * 6) + 1}.svg`;
  }
}
