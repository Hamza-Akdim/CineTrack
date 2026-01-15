import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div
      class="min-h-screen w-full bg-gradient-to-b from-[#05070b] to-[#0d1117] text-white flex flex-col"
    >
      <header
        class="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-white/5 border-b border-white/10 shadow-md"
      >
        <div
          class="max-w-7xl mx-auto flex justify-between items-center px-6 py-4"
        >
          <div class="flex items-center gap-2 cursor-pointer" routerLink="/">
            <img
              src="logo-cinetrack.png"
              class="w-40 md:w-48"
              alt="CineTrack"
            />
          </div>

          <div class="flex gap-3 items-center">
            <ng-container *ngIf="!user(); else loggedIn">
                <a
                routerLink="/login"
                class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-white font-medium"
                >
                Connexion
                </a>
                <a
                routerLink="/register"
                class="px-4 py-2 rounded-xl bg-white text-black hover:bg-gray-200 transition font-medium"
                >
                S'inscrire
                </a>
            </ng-container>
            <ng-template #loggedIn>
                <div class="flex items-center gap-4">
                  <!-- Favorites Link -->
                  <a routerLink="/favorites" class="group flex flex-col items-center gap-0.5 text-gray-300 hover:text-red-500 transition" title="Mes Favoris">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span class="text-[10px] font-medium uppercase tracking-wide">Favoris</span>
                  </a>

                  <!-- Profile Link -->
                  <a routerLink="/profile" class="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-xl transition">
                      <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold overflow-hidden relative border border-white/20">
                          <img *ngIf="user()?.photoURL" [src]="user()?.photoURL" class="w-full h-full object-cover" alt="">
                          <span *ngIf="!user()?.photoURL">{{ user()?.displayName?.charAt(0) || user()?.email?.charAt(0) || 'U' | uppercase }}</span>
                      </div>
                  </a>

                  <!-- Logout Button -->
                  <button (click)="logout()" class="text-gray-300 hover:text-white transition font-medium text-sm md:bg-white/10 md:px-4 md:py-2 md:rounded-lg md:hover:bg-white/20" title="Se déconnecter">
                    <!-- Icon for Mobile -->
                    <span class="md:hidden">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                       </svg>
                    </span>
                    <!-- Text for Desktop -->
                    <span class="hidden md:inline">Déconnecter</span>
                  </button>
                </div>
            </ng-template>
          </div>
        </div>
      </header>

      <div class="h-[72px] md:h-[80px]"></div>

      <main class="flex-1">
        <ng-content></ng-content>
      </main>

      <footer class="bg-black/20 py-6 border-t border-white/10">
        <div class="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>CineTrack © {{ currentYear }} — Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  `,
})
export class AppLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  user = this.authService.currentUser;
  currentYear = new Date().getFullYear();

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
