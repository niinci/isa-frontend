import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ChatGroup, ChatMessageDto, ChatService } from '../chat.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {

  groups: ChatGroup[] = [];
  selectedGroup?: ChatGroup;
  messages: ChatMessageDto[] = [];
  newMessage: string = '';
  currentUsername: string = '';
  usernameToAdd: string = '';
  usernameToRemove: string = '';
  newGroupName: string = '';  // za unos naziva nove grupe

    // Za autocomplete prilikom dodavanja korisnika
  searchedUsers: User[] = [];
  showUserSearchDropdown = false;
  // Za listu članova grupe kod uklanjanja korisnika
  groupMembersForRemoval: User[] = [];


  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(private chatService: ChatService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      const email = user.email || user.username;
  
      // Dodatno logovanje za praćenje šta se šalje
      console.log('Korisnički email ili username za dobijanje username-a:', email);
  
      if (!email) {
        console.error('Nema email-a ni username-a za trenutnog korisnika, ne mogu da dobijem username');
        return;
      }
  
      this.chatService.getUsernameByEmail(email).subscribe(username => {
        console.log('Username dobijen sa backend-a:', username);
        this.currentUsername = username;
        this.loadGroups();
      }, err => {
        console.error('Ne mogu da dobijem username za email:', email, 'Greška:', err);
      });
    });
  }
  
  

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadGroups(): void {
    this.chatService.getUserGroups(this.currentUsername).subscribe(groups => {
      this.groups = groups;  // sve grupe korisnika
      console.log('Grupe učitane:', groups);
    }, err => {
      console.error('Greška pri učitavanju grupa:', err);
    });
  }
  

  selectGroup(group: ChatGroup): void {
    this.selectedGroup = group;
    this.loadMessages(group.id);
    this.loadGroupMembersForRemoval();  // nova funkcija za listu članova
  }
   

  loadMessages(groupId: number): void {
    this.chatService.getLastMessages(groupId, 10).subscribe(messages => {
      this.messages = messages.reverse(); // kronološki prikaz
      console.log(`Poruke za grupu ${groupId}:`, this.messages);
    }, err => {
      console.error('Greška pri učitavanju poruka:', err);
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedGroup) return;

    const message: ChatMessageDto = {
      content: this.newMessage.trim(),
      senderUsername: this.currentUsername,
      chatGroupId: this.selectedGroup.id
    };

    this.chatService.sendMessage(message).subscribe(sent => {
      this.messages.push(sent);
      this.newMessage = '';
      this.scrollToBottom();
      console.log('Poslata poruka:', sent);
    }, err => {
      console.error('Greška pri slanju poruke:', err);
    });
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  public get userIsAdmin(): boolean {
    return this.authService.isAdmin();
  }
  

  addUserToGroup(): void {
    if (!this.selectedGroup || !this.usernameToAdd.trim()) return;
  
    this.chatService.addUserToGroup(this.selectedGroup.id, this.usernameToAdd.trim(), this.currentUsername)
      .subscribe(() => {
        alert(`Корисник ${this.usernameToAdd} је додат у групу.`);
        this.usernameToAdd = '';
  
        this.loadGroups();
  
        // Automatski selektuj tu grupu (po id-u)
        // Napravi malu pauzu da loadGroups završi (ili koristi rxjs)
        setTimeout(() => {
          // Pronađi grupu u listi po id-u i selektuj je
          const addedGroup = this.groups.find(g => g.id === this.selectedGroup!.id);
          if (addedGroup) {
            this.selectGroup(addedGroup);
          }
        }, 500);
  
      }, err => {
        alert('Грешка приликом додавања корисника: ' + err.message);
        console.error('Greška pri dodavanju korisnika:', err);
      });
  }
  

  removeUserFromGroup(): void {
    if (!this.selectedGroup || !this.usernameToRemove.trim()) return;
  
    const username = this.usernameToRemove.trim();
  
    this.chatService.removeUserFromGroup(this.selectedGroup.id, username, this.currentUsername)
      .subscribe(() => {
        alert(`Корисник ${username} је уклоњен из групе.`);
        this.usernameToRemove = '';
  
        // Ažuriraj članove u selectedGroup direktno
        if (this.selectedGroup?.members) {
          this.selectedGroup.members = this.selectedGroup.members.filter(m => m.username !== username);
        }
        
        // Ažuriraj listu za uklanjanje u UI
        this.loadGroupMembersForRemoval();
  
        // Možeš po potrebi osvežiti celu listu grupa
        this.loadGroups();
  
      }, err => {
        alert('Грешка приликом уклањања корисника: ' + err.message);
        console.error('Greška pri uklanjanju korisnika:', err);
      });
  }
  
  removeUser(user: User) {
    if (!this.selectedGroup) return;
  
    this.chatService.removeUserFromGroup(this.selectedGroup.id, user.username, this.currentUsername)
      .subscribe(() => {
        alert(`Корисник ${user.username} је уклоњен из групе.`);
        
        // Ažuriraj članove u selectedGroup direktno
        if (this.selectedGroup?.members) {
          this.selectedGroup.members = this.selectedGroup.members.filter(m => m.username !== user.username);
        }
        
        // Ažuriraj listu za uklanjanje u UI
        this.loadGroupMembersForRemoval();
  
        // Osveži grupe ako je potrebno
        this.loadGroups();
  
      }, err => {
        alert('Грешка приликом уклањања корисника: ' + err.message);
        console.error('Greška pri uklanjanju korisnika:', err);
      });
  }
  
  

    createGroup(): void {
      if (!this.newGroupName.trim()) return;
  
      this.chatService.createGroup(this.newGroupName.trim(), this.currentUsername).subscribe(newGroup => {
        alert(`Група '${newGroup.name}' је успешно креирана.`);
        this.groups.push(newGroup);    // dodajemo novu grupu u listu
        this.newGroupName = '';         // resetujemo input
      }, err => {
        alert('Грешка приликом креирања групе: ' + err.message);
        console.error('Greška pri kreiranju grupe:', err);
      });
    }
    searchUsersForAdd() {
      const query = this.usernameToAdd.trim();
      if (query.length < 2) {
        this.searchedUsers = [];
        this.showUserSearchDropdown = false;
        return;
      }
      this.chatService.searchUsers(query).subscribe(users => {
        // filter da ne prikazuje već postojeće članove grupe
        this.searchedUsers = users.filter(u => 
          !this.selectedGroup?.members.some(m => m.username === u.username)
        );
        this.showUserSearchDropdown = this.searchedUsers.length > 0;
      });
    }
    
    selectUserToAdd(user: User) {
      this.usernameToAdd = user.username;
      this.showUserSearchDropdown = false;
    }

    loadGroupMembersForRemoval() {
      if (!this.selectedGroup) {
        this.groupMembersForRemoval = [];
        return;
      }
      this.groupMembersForRemoval = [...this.selectedGroup.members];
    }
    
}

