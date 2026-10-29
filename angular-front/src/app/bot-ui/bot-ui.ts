import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common'; // ✅ AsyncPipe est bien importé
import { MarkdownModule } from 'ngx-markdown';
import { LoadingService } from '../services/loading';
import { map } from 'rxjs/operators';
import { HttpEventType, HttpDownloadProgressEvent } from '@angular/common/http';

@Component({
  selector: 'app-bot-ui',
  standalone: true,
  // ✅ AsyncPipe et CommonModule sont explicitement déclarés ici
  imports: [FormsModule, AsyncPipe, CommonModule, MarkdownModule],
  templateUrl: './bot-ui.html',
  styleUrl: './bot-ui.css',
})
export class BotUi {
  query: any;
  http = inject(HttpClient);
  response$!: Observable<any>;
  public loadingService = inject(LoadingService);

  askAgent() {
    this.response$ = this.http.get("http://localhost:9999/EBANK-BOT/chat?query=" + this.query + "&conversationId=test-1", {
      responseType: 'text'
    });
  }

  askAgentStream() {
    this.response$ = this.http.get("http://localhost:9999/EBANK-BOT/chatStream?query=" + this.query + "&conversationId=test-1", {
      responseType: 'text',
      observe: 'events',
      reportProgress: true
    }).pipe(map(event => {
      switch (event.type) {
        case HttpEventType.Sent:
          return { 'type': 'Sent' };
        case HttpEventType.DownloadProgress:
          return { type: "Response", content: (event as HttpDownloadProgressEvent).partialText };
        case HttpEventType.Response:
          return { type: "Response", content: event.body };
        default:
          return { type: 'Other', data: event };
      }
    }));
  }
}
