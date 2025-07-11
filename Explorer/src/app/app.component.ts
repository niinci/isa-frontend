import { Component, OnInit } from '@angular/core';
import { AuthService } from './infrastructure/auth/auth.service';
import { FormGroup, FormControl } from "@angular/forms";
import { Validators } from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Explorer';

  constructor(
    private authService: AuthService,
  ) {}


  ngOnInit(): void {
    this.checkIfUserExists();
  }

  private checkIfUserExists(): void {
    this.authService.checkIfUserExists();
  }
}
