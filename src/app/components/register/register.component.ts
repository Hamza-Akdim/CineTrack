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
          <h3 class="text-2xl sm:text-3xl font-bold text-center sm:text-left">
            Créer un compte
          </h3>

          <!-- FORM -->
          <form
            [formGroup]="registerForm"
            (ngSubmit)="onSubmit()"
            class="space-y-4"
          >
            <input
              type="text"
              formControlName="displayName"
              placeholder="Nom complet"
              class="w-full px-4 py-4
                   bg-[#333] text-white
                   placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="email"
              formControlName="email"
              placeholder="Adresse email"
              class="w-full px-4 py-4
                   bg-[#333] text-white
                   placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="password"
              formControlName="password"
              placeholder="Mot de passe (min 6 caractères)"
              class="w-full px-4 py-4
                   bg-[#333] text-white
                   placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="password"
              formControlName="confirmPassword"
              placeholder="Confirmer le mot de passe"
              class="w-full px-4 py-4
                   bg-[#333] text-white
                   placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <!-- ERREURS -->
            <div
              *ngIf="
                registerForm.get('confirmPassword')?.touched &&
                passwordsDoNotMatch()
              "
              class="text-blue-500 text-sm"
            >
              Les mots de passe ne correspondent pas.
            </div>

            <div *ngIf="errorMessage" class="text-blue-500 text-sm">
              {{ errorMessage }}
            </div>

            <!-- SUBMIT -->
            <button
              type="submit"
              [disabled]="registerForm.invalid || passwordsDoNotMatch()"
              class="w-full py-4
                   bg-blue-600 hover:bg-blue-700
                   font-semibold transition
                   disabled:opacity-50"
            >
              S'inscrire
            </button>
          </form>

          <!-- FOOTER -->
          <div class="text-gray-400 text-sm pt-4 text-center sm:text-left">
            Déjà un compte ?
            <a
              routerLink="/login"
              class="text-white hover:underline font-medium"
            >
              Se connecter
            </a>
          </div>
        </div>
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
