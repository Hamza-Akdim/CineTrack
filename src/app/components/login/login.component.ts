import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
   <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#05070b] to-[#0d1117] text-white px-4">

      <div class="w-full max-w-md bg-black/40 backdrop-blur-sm rounded-xl p-8 shadow-lg space-y-6">

        <!-- LOGO -->
        <div class="flex justify-center mb-4">
          <img src="logo-cinetrack.png" alt="CineTrack" class="w-36 md:w-40" />
        </div>

        <!-- TITRE -->
        <h2 class="text-center text-2xl md:text-3xl font-extrabold">Connexion à CineTrack</h2>

        <!-- FORMULAIRE -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">

          <input
            type="email"
            formControlName="email"
            placeholder="Adresse email"
            class="w-full px-4 py-3 rounded-full bg-black/70 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <input
            type="password"
            formControlName="password"
            placeholder="Mot de passe"
            class="w-full px-4 py-3 rounded-full bg-black/70 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <!-- ERREUR -->
          <div *ngIf="errorMessage" class="text-red-500 text-sm text-center">
            {{ errorMessage }}
          </div>

          <!-- BOUTONS -->
          <div class="space-y-3 mt-2">
            <button
              type="submit"
              [disabled]="loginForm.invalid"
              class="w-full py-3 rounded-full bg-blue-500 hover:bg-blue-600 transition font-medium disabled:opacity-50"
            >
              Se connecter
            </button>

            <button
              type="button"
              (click)="loginWithGoogle()"
              [disabled]="isLoadingGoogle"
              class="w-full py-3 rounded-full bg-white text-black hover:bg-gray-200 transition font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span *ngIf="isLoadingGoogle" class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
              <span *ngIf="!isLoadingGoogle">Continuer avec Google</span>
            </button>
          </div>

          <!-- REGISTER -->
          <div class="text-center mt-4 text-gray-400">
            Pas de compte ?
            <a routerLink="/register" class="text-blue-500 hover:text-blue-600 font-medium">S'inscrire</a>
          </div>

        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error.code);
        },
      });
    }
  }

  isLoadingGoogle = false;

  loginWithGoogle() {
    if (this.isLoadingGoogle) return;

    this.isLoadingGoogle = true;
    this.errorMessage = '';

    this.authService.loginWithGoogle().subscribe({
      next: () => {
        this.isLoadingGoogle = false;
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoadingGoogle = false;
        console.error(' LoginComponent: Observable error():', {
          code: error.code,
          message: error.message,
          fullError: error,
        });

        // Handle popup closed by user or concurrent requests specially
        if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
          this.errorMessage = 'Connexion annulée.';
        } else {
          this.errorMessage = this.getErrorMessage(error.code);
        }
      }
    });
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec cette adresse email.';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect.';
      case 'auth/invalid-email':
        return 'Adresse email invalide.';
      default:
        return 'Erreur de connexion. Veuillez réessayer.';
    }
  }
}
