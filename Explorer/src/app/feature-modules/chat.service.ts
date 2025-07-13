import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';
import * as SockJS from 'sockjs-client';
import { AuthService } from '../infrastructure/auth/auth.service';

export interface ChatMessage {
  chatGroup: { id: string };
  senderUsername: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private client: Client;
  private messageSubject = new Subject<ChatMessage>();

  constructor(private authService: AuthService) {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/chat-websocket'),
      connectHeaders: {
        Authorization: 'Bearer ' + this.authService.getToken()
      },
      debug: (str) => { console.log(str); },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  
    this.client.onConnect = () => {
      console.log('Connected to WebSocket');
  
      this.client.subscribe('/topic/1', (message: IMessage) => {
        if (message.body) {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          this.messageSubject.next(chatMessage);
        }
      });
    };
  
    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };
  
    this.client.activate();
  }
  
  

  getMessages(): Observable<ChatMessage> {
    return this.messageSubject.asObservable();
  }

  sendMessage(chatMessage: ChatMessage) {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(chatMessage),
      });
    }
  }

  addUser(chatMessage: ChatMessage) {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/chat.addUser',
        body: JSON.stringify(chatMessage),
      });
    }
  }
}
