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
      class="min-h-screen w-full
         bg-gradient-to-b from-black via-[#140000] to-black
         text-white"
    >
      <!-- HEADER -->
      <header class="w-full px-6 py-6 border-b border-gray-800">
        <div
          class="max-w-6xl mx-auto
           flex justify-center sm:justify-start"
        >
          <img src="logo-cinetrack.png" alt="CineTrack" class="w-40 sm:w-56" />
        </div>
      </header>

      <!-- CONTENT -->
      <div class="flex justify-center px-4 py-10">
        <!-- CARD -->
        <div class="w-full max-w-md bg-black/80 p-8 sm:p-10 space-y-6">
          <h3 class="text-2xl sm:text-3xl font-bold">Se connecter</h3>
          <!-- FORM -->
          <form
            [formGroup]="loginForm"
            (ngSubmit)="onSubmit()"
            class="space-y-4"
          >
            <input
              type="email"
              formControlName="email"
              placeholder="Email ou numéro de téléphone"
              class="w-full px-4 py-4
               bg-[#333] text-white
               placeholder-gray-400
               focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="password"
              formControlName="password"
              placeholder="Mot de passe"
              class="w-full px-4 py-4
               bg-[#333] text-white
               placeholder-gray-400
               focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <!-- FORGOT PASSWORD -->
            <div class="text-right">
              <button
                type="button"
                (click)="resetPassword()"
                class="text-sm text-gray-400 hover:text-blue-500 transition"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <!-- ERROR -->
            <div *ngIf="errorMessage" class="text-blue-500 text-sm">
              {{ errorMessage }}
            </div>

            <!-- SUBMIT -->
            <button
              type="submit"
              [disabled]="loginForm.invalid"
              class="w-full py-4
               bg-blue-600 hover:bg-blue-700
               font-semibold transition
               disabled:opacity-50"
            >
              Continuer
            </button>

            <!-- OR SEPARATOR -->
            <div class="flex items-center gap-3 py-2">
              <div class="flex-1 h-px bg-gray-600"></div>
              <span class="text-sm text-gray-400">OU</span>
              <div class="flex-1 h-px bg-gray-600"></div>
            </div>

            <!-- GOOGLE BUTTON -->
            <button
              type="button"
              (click)="loginWithGoogle()"
              [disabled]="isLoadingGoogle"
              class="w-full py-4
         bg-[#333] hover:bg-[#444]
         text-white font-semibold
         transition
         flex items-center justify-center gap-3
         disabled:opacity-50"
            >
              <!-- LOADER -->
              <span
                *ngIf="isLoadingGoogle"
                class="w-4 h-4 border-2 border-white/30 border-t-white
           rounded-full animate-spin"
              ></span>

              <!-- ICON -->
              <img
                *ngIf="!isLoadingGoogle"
                src="google-icon.png"
                alt="Google"
                class="w-5 h-5"
              />

              <span *ngIf="!isLoadingGoogle"> Continuer avec Google </span>
            </button>
          </form>

          <!-- FOOTER -->
          <div class="text-gray-400 text-sm pt-4">
            Nouveau sur CineTrack ?
            <a
              routerLink="/register"
              class="text-white hover:underline font-medium"
            >
              Inscrivez-vous
            </a>
          </div>
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

  resetPassword() {
    const email = this.loginForm.get('email')?.value;

    if (!email) {
      this.errorMessage =
        'Veuillez saisir votre email pour réinitialiser le mot de passe.';
      return;
    }

    this.authService.resetPassword(email).subscribe({
      next: () => {
        this.errorMessage = 'Un email de réinitialisation a été envoyé.';
      },
      error: () => {
        this.errorMessage = 'Impossible d’envoyer l’email. Vérifiez l’adresse.';
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
