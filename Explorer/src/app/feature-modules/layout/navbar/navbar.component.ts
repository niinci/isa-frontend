import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { UserAccountService } from 'src/app/user-account.service';

@Component({
  selector: 'xp-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit {

  user: User | undefined;
  showDropdown: string | null = null;
  searchName: string = '';
  showSearchInput: boolean = false;
  filteredUsers: User[] = [];

  private searchTerms = new Subject<string>();

  constructor(
    public authService: AuthService,
    private userAccountService: UserAccountService,
    private router: Router,
    private route: ActivatedRoute,   // <--- dodaj ovo
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => this.user = user);

    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => term ? this.userAccountService.searchByUsername(term) : of([])),
      catchError(() => of([]))
    ).subscribe(users => {
      this.filteredUsers = users;
    });
  }

  toggleDropdown(menu: string) {
    this.showDropdown = this.showDropdown === menu ? null : menu;
  }

  onLogout(): void {
    this.authService.logout();
  }

  toggleSearchInput(): void {
    this.showSearchInput = !this.showSearchInput;
    if (this.showSearchInput) {
      setTimeout(() => {
        const input = document.querySelector('.navbar-search-input') as HTMLInputElement;
        if (input) input.focus();
      }, 0);
    } else {
      this.filteredUsers = [];
      this.searchName = '';
    }
  }

  selectUser(user: any) {
    this.router.navigate(['/profile'], { queryParams: { userId: user.id } });
  }
  
  

  onSearchNameChange(term: string): void {
    this.searchTerms.next(term);
  }

  onSearchInput(): void {
    const term = this.searchName.trim();
  
    if (term.length < 2) {
      this.filteredUsers = [];
      return;
    }
  
    this.userAccountService.searchByUsername(term).subscribe({
      next: (users: User[]) => {
        this.filteredUsers = users;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.filteredUsers = [];
      }
    });
  }
  
  onAccountIconClick() {
    const currentUserId = this.authService.getCurrentUserId();
  
    const routeUserIdParam = this.route.snapshot.queryParamMap.get('userId');
    const routeUserId = routeUserIdParam ? Number(routeUserIdParam) : null;
  
    if (routeUserId === currentUserId || !routeUserId) {
      // Ako već gledaš svoj profil ili nema userId u ruti, idi na /profile bez parametara
      this.router.navigate(['/profile']);
    } else {
      // Ako gledaš tuđi profil, prebaci na svoj
      this.router.navigate(['/profile']);
    }
  }
  
  
  
  
    
  
}
