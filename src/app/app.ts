import { Component, signal } from "@angular/core";
import { VideoExtractorComponent } from './components/video-extractor/video-extractor.component';

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  imports: [VideoExtractorComponent]
})
export class App {
  protected readonly title = signal("JustTheVideo");
}
