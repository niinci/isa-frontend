import { Component, OnInit } from '@angular/core';
import { ChatService, ChatMessage } from '../chat.service';

@Component({
  selector: 'xp-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  messages: ChatMessage[] = [];
  newMessage: string = '';
  username: string = 'User' + Math.floor(Math.random() * 1000);
  chatGroupId: string = '1';  // moze da se menja u zavisnosti od chata

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.getMessages().subscribe(message => {
      this.messages.push(message);
    });

    // Dodaj korisnika na chat grupu
    this.chatService.addUser({
      chatGroup: { id: this.chatGroupId },
      senderUsername: this.username,
      content: ''
    });
  }

  send() {
    if (this.newMessage.trim().length === 0) return;

    const chatMessage: ChatMessage = {
      chatGroup: { id: this.chatGroupId },
      senderUsername: this.username,
      content: this.newMessage
    };

    this.chatService.sendMessage(chatMessage);
    this.newMessage = '';
  }
}
