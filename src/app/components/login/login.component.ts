import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div
      class="min-h-screen w-full flex overflow-hidden bg-[#0d1117] text-white"
    >
      <!-- IMAGE GAUCHE (desktop uniquement) -->
      <div class="hidden lg:block lg:w-1/2 relative">
        <img
          src="img-login-1.png"
          alt="CineTrack"
          class="absolute inset-0 w-full h-full object-cover"
        />

        <!-- overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
        ></div>

        <!-- branding -->
        <!-- <div class="relative z-10 p-12 h-full flex flex-col justify-end">
          <h1 class="text-5xl font-extrabold mb-4">CineTrack</h1>
          <p class="text-lg text-gray-300 max-w-md">
            Suivez vos films préférés, gérez vos favoris et découvrez les
            nouveautés du cinéma.
          </p>
        </div> -->
      </div>

      <!-- LOGIN DROITE -->
      <div
        class="w-full lg:w-1/2
        flex items-center justify-center
        px-4 sm:px-6"
      >
        <div
          class="w-full max-w-md
          bg-black/40 backdrop-blur-md
          rounded-2xl p-8 shadow-2xl space-y-6"
        >
          <!-- LOGO -->
          <div class="flex justify-center">
            <img src="logo-cinetrack.png" alt="CineTrack" class="w-56" />
          </div>

          <!-- TITRE -->
          <h4 class="text-center text-2xl sm:text-3xl font-semibold">
            Connexion à CineTrack
          </h4>

          <!-- FORM -->
          <form
            [formGroup]="loginForm"
            (ngSubmit)="onSubmit()"
            class="space-y-4"
          >
            <input
              type="email"
              formControlName="email"
              placeholder="Adresse email"
              class="w-full px-4 py-3 rounded-full
              bg-black/70 border border-gray-600
              placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              formControlName="password"
              placeholder="Mot de passe"
              class="w-full px-4 py-3 rounded-full
              bg-black/70 border border-gray-600
              placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <!-- ERREUR -->
            <div *ngIf="errorMessage" class="text-red-500 text-sm text-center">
              {{ errorMessage }}
            </div>

            <!-- ACTIONS -->
            <div class="space-y-3 pt-2">
              <button
                type="submit"
                [disabled]="loginForm.invalid"
                class="w-full py-3 rounded-full
                bg-blue-500 hover:bg-blue-600 transition
                font-semibold disabled:opacity-50"
              >
                Se connecter
              </button>

              <button
                type="button"
                (click)="loginWithGoogle()"
                [disabled]="isLoadingGoogle"
                class="w-full py-3 rounded-full
                bg-white text-black hover:bg-gray-200 transition
                font-semibold flex items-center justify-center gap-2"
              >
                <span
                  *ngIf="isLoadingGoogle"
                  class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"
                ></span>

                <span *ngIf="!isLoadingGoogle"> Continuer avec Google </span>
              </button>
            </div>

            <!-- REGISTER -->
            <div class="text-center text-gray-400 text-sm pt-2">
              Pas de compte ?
              <a
                routerLink="/register"
                class="text-blue-500 hover:text-blue-600 font-medium"
              >
                S'inscrire
              </a>
            </div>
          </form>
        </div>
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
  isLoadingGoogle = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (!this.loginForm.valid) return;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error.code);
      },
    });
  }

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

        if (
          error.code === 'auth/cancelled-popup-request' ||
          error.code === 'auth/popup-closed-by-user'
        ) {
          this.errorMessage = 'Connexion annulée.';
        } else {
          this.errorMessage = this.getErrorMessage(error.code);
        }
      },
    });
  }

  private getErrorMessage(code: string): string {
    switch (code) {
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
