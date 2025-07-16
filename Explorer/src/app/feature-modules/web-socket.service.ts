import { Injectable } from '@angular/core';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import { ChatMessageDto } from './chat.service';
import * as SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private stompClient: Client;
  private messageSubjects: { [groupId: number]: Subject<ChatMessageDto> } = {};

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/chat-websocket'),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket connected');
        // Pretplate će se raditi kada korisnik izabere grupu
      }
    });

    this.stompClient.activate();
  }

  public subscribeToGroupMessages(groupId: number): Observable<ChatMessageDto> {
    if (!this.messageSubjects[groupId]) {
      this.messageSubjects[groupId] = new Subject<ChatMessageDto>();

      this.stompClient.subscribe(`/topic/group/${groupId}`, (message: IMessage) => {
        const chatMessage = JSON.parse(message.body) as ChatMessageDto;
        this.messageSubjects[groupId].next(chatMessage);
      });
    }

    return this.messageSubjects[groupId].asObservable();
  }

  public sendMessage(message: ChatMessageDto): void {
    this.stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(message)
    });
  }
}
