import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-video-extractor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './video-extractor.component.html',
})
export class VideoExtractorComponent {
  http = inject(HttpClient);

  url = signal('');
  videoLink = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  extractVideo() {
    if (!this.url()) {
      this.error.set('Please enter a URL');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.videoLink.set(null);

    // NOTE: Using a public CORS proxy for demonstration purposes.
    // This is not suitable for production.
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const targetUrl = this.url();

    this.http.get(proxyUrl + targetUrl, { responseType: 'text' }).subscribe({
      next: (htmlContent) => {
        if (htmlContent) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          const videoElement = doc.querySelector('video source, video[src], [data-video-src]');
          const videoSrc = videoElement?.getAttribute('src') || videoElement?.getAttribute('data-video-src');

          if (videoSrc) {
            const absoluteUrl = new URL(videoSrc, targetUrl).toString();
            this.videoLink.set(absoluteUrl);
          } else {
            this.error.set('Could not find a video on the page.');
          }
        } else {
          this.error.set('Could not fetch the page content.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('An error occurred. The CORS proxy may be down or the URL may be incorrect.');
        console.error(err);
        this.loading.set(false);
      }
    });
  }
}
