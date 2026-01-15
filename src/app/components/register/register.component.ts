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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#05070b] to-[#0d1117] text-white px-4"
    >
      <div
        class="w-full max-w-md bg-black/40 backdrop-blur-sm rounded-xl p-8 shadow-lg space-y-6"
      >
        <!-- LOGO -->
        <div class="flex justify-center mb-4">
          <img src="logo-cinetrack.png" alt="CineTrack" class="w-36 md:w-40" />
        </div>

        <!-- TITRE -->
        <h2 class="text-center text-2xl md:text-3xl font-extrabold">
          Créer un compte CineTrack
        </h2>

        <!-- FORMULAIRE -->
        <form
          [formGroup]="registerForm"
          (ngSubmit)="onSubmit()"
          class="space-y-4"
        >
          <input
            type="text"
            formControlName="displayName"
            placeholder="Nom complet"
            class="w-full px-4 py-3 rounded-full bg-black/70 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <input
            type="email"
            formControlName="email"
            placeholder="Adresse email"
            class="w-full px-4 py-3 rounded-full bg-black/70 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <input
            type="password"
            formControlName="password"
            placeholder="Mot de passe (min 6 caractères)"
            class="w-full px-4 py-3 rounded-full bg-black/70 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <input
            type="password"
            formControlName="confirmPassword"
            placeholder="Confirmer le mot de passe"
            class="w-full px-4 py-3 rounded-full bg-black/70 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <!-- ERREURS -->
          <div
            *ngIf="
              registerForm.get('confirmPassword')?.touched &&
              passwordsDoNotMatch()
            "
            class="text-red-500 text-sm text-center"
          >
            Les mots de passe ne correspondent pas.
          </div>

          <div *ngIf="errorMessage" class="text-red-500 text-sm text-center">
            {{ errorMessage }}
          </div>

          <!-- BOUTON -->
          <button
            type="submit"
            [disabled]="registerForm.invalid || passwordsDoNotMatch()"
            class="w-full py-3 rounded-full bg-blue-500 hover:bg-blue-600 transition font-medium disabled:opacity-50"
          >
            S'inscrire
          </button>

          <!-- LOGIN LINK -->
          <div class="text-center mt-4 text-gray-400">
            Déjà un compte ?
            <a
              routerLink="/login"
              class="text-blue-500 hover:text-blue-600 font-medium"
              >Se connecter</a
            >
          </div>
        </form>
      </div>
    </div>
  `,
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
      confirmPassword: ['', [Validators.required]],
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
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error.code);
        },
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
        return "Erreur lors de l'inscription. Veuillez réessayer.";
    }
  }
}
