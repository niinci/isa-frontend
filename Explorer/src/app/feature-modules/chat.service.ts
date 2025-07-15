import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../infrastructure/auth/model/user.model';

export interface ChatMessageDto {
  id?: number;
  content: string;
  senderUsername: string;
  timestamp?: Date;
  chatGroupId: number;
}

export interface ChatGroup {
  id: number;
  name: string;
  members: any[]; // možeš precizirati tip ako imaš User model
  admin: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://localhost:8080/api/chat'; // prilagodi ako se menja

  constructor(private http: HttpClient) {}

  // --- Poruke ---

  sendMessage(message: ChatMessageDto): Observable<ChatMessageDto> {
    return this.http.post<ChatMessageDto>(`${this.apiUrl}/send`, message);
  }

  getLastMessages(groupId: number, count: number = 10): Observable<ChatMessageDto[]> {
    return this.http.get<ChatMessageDto[]>(`${this.apiUrl}/${groupId}/last-messages`);
  }

  // --- Grupe ---

  getUserGroups(username: string): Observable<ChatGroup[]> {
    return this.http.get<ChatGroup[]>(`${this.apiUrl}/groups/${username}`);
  }

  createGroup(groupName: string, adminUsername: string): Observable<ChatGroup> {
    return this.http.post<ChatGroup>(`${this.apiUrl}/group/create`, null, {
      params: {
        groupName,
        adminUsername
      }
    });
  }

  addUserToGroup(groupId: number, usernameToAdd: string, requestingUser: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/group/${groupId}/add-user`, null, {
      params: {
        usernameToAdd,
        requestingUser
      }
    });
  }

  removeUserFromGroup(groupId: number, usernameToRemove: string, requestingUser: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/group/${groupId}/remove-user`, null, {
      params: {
        usernameToRemove,
        requestingUser
      }
    });
  }

  getUsernameByEmail(email: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/username-by-email`, {
      params: { email },
      responseType: 'text'  // ovo je jako bitno da Angular tretira odgovor kao čisti tekst
    });
  }

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/search`, {
      params: { query }
    });
  }
  
    
}
