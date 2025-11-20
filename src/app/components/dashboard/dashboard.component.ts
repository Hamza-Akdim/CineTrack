import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">CineTrack Dashboard</h1>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              @if (currentUser()?.photoURL) {
                <img [src]="currentUser()!.photoURL!" alt="Profile" class="w-10 h-10 rounded-full">
              } @else {
                <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {{ currentUser()?.displayName?.charAt(0) || currentUser()?.email?.charAt(0) || 'U' }}
                </div>
              }
              <span class="text-sm font-medium text-gray-700">
                Bonjour, {{ currentUser()?.displayName || currentUser()?.email }}
              </span>
            </div>
            <button
              (click)="logout()"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Bienvenue sur CineTrack!</h2>
          <p class="text-gray-600 mb-4">Vous êtes connecté avec succès.</p>
          
          @if (currentUser(); as user) {
            <div class="mt-6 border-t pt-6">
              <h3 class="text-lg font-semibold mb-2">Informations du compte</h3>
              <dl class="space-y-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Email</dt>
                  <dd class="text-sm text-gray-900">{{ user.email }}</dd>
                </div>
                @if (user.displayName) {
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Nom</dt>
                    <dd class="text-sm text-gray-900">{{ user.displayName }}</dd>
                  </div>
                }
                <div>
                  <dt class="text-sm font-medium text-gray-500">ID Utilisateur</dt>
                  <dd class="text-sm text-gray-900 font-mono">{{ user.uid }}</dd>
                </div>
              </dl>
            </div>
          }
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
