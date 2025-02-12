import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, Inject, PLATFORM_ID } from "@angular/core";

@Component({
  selector: "cb-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}
  
  ngOnInit(): void {
    const http = "http:";
    const https = "https:";

    if (isPlatformBrowser(this.platformId) && window.location.protocol.startsWith(https)) {
      const newUrl = window.location.href.replace(https, http);

      window.location.href = newUrl;
    }
  }
}
