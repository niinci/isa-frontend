import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service'; // Pretpostavljamo da AuthService sadrži metodu registerAdmin

@Component({
  selector: 'xp-register-admin',
  templateUrl: './register-admin.component.html',
  styleUrls: ['./register-admin.component.css']
})
export class RegisterAdminComponent implements OnInit {

  adminRegisterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // Koristićemo AuthService za pozivanje API-ja
    private router: Router
  ) {
    this.adminRegisterForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        number: ['', Validators.required],
        city: ['', Validators.required],
        country: ['', Validators.required]
      })
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Ovde možeš dodati logiku za inicijalizaciju ako je potrebno
  }

  passwordMatchValidator(fg: FormGroup) {
    return fg.get('password')?.value === fg.get('confirmPassword')?.value
      ? null
      : { mismatch: true }; // Custom validacija za podudaranje lozinki
  }

  onSubmit(): void {
    if (this.adminRegisterForm.valid) {
      // Izbaci confirmPassword jer ga backend ne očekuje
      const { confirmPassword, ...adminData } = this.adminRegisterForm.value;

      this.authService.registerAdmin(adminData).subscribe({
        next: (res) => {
          console.log('Admin registered successfully', res);
          alert('Admin registered successfully! They can now log in.');
          this.router.navigate(['/']); // Preusmeri na početnu stranicu ili stranicu za prijavu
        },
        error: (err) => {
          console.error('Admin registration failed', err);
          // Prikazivanje specifičnije poruke o grešci sa backend-a
          const errorMessage = err.error?.message || 'Unknown error during registration.';
          alert('Admin registration failed: ' + errorMessage);
        }
      });
    } else {
      // Opciono: Prikazivanje poruke ako forma nije validna
      alert('Please fill in all required fields correctly.');
    }
  }
}