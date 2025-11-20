import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer un compte CineTrack
          </h2>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <input
                formControlName="displayName"
                type="text"
                class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nom d'affichage"
              />
            </div>
            <div>
              <input
                formControlName="email"
                type="email"
                class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Adresse email"
              />
            </div>
            <div>
              <input
                formControlName="password"
                type="password"
                class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Mot de passe (min 6 caractères)"
              />
            </div>
            <div>
              <input
                formControlName="confirmPassword"
                type="password"
                class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Confirmer le mot de passe"
              />
            </div>
          </div>

          @if (registerForm.get('confirmPassword')?.touched && passwordsDoNotMatch()) {
            <div class="text-red-600 text-sm">
              Les mots de passe ne correspondent pas.
            </div>
          }

          <div>
            <button
              type="submit"
              [disabled]="registerForm.invalid || passwordsDoNotMatch()"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              S'inscrire
            </button>
          </div>

          <div class="text-center">
            <a routerLink="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              Déjà un compte ? Se connecter
            </a>
          </div>

          @if (errorMessage) {
            <div class="text-red-600 text-sm text-center">
              {{ errorMessage }}
            </div>
          }
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  errorMessage = '';

  constructor() {
    this.registerForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  passwordsDoNotMatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return password !== confirmPassword;
  }

  onSubmit() {
    if (this.registerForm.valid && !this.passwordsDoNotMatch()) {
      const { email, password, displayName } = this.registerForm.value;
      
      this.authService.register(email, password, displayName).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error.code);
        }
      });
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée.';
      case 'auth/weak-password':
        return 'Le mot de passe est trop faible.';
      case 'auth/invalid-email':
        return 'Adresse email invalide.';
      default:
        return 'Erreur lors de l\'inscription. Veuillez réessayer.';
    }
  }
}