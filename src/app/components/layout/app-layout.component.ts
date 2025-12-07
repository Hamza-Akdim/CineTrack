import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
          <!-- LOGO -->
          <div class="flex items-center gap-2">
            <img
              src="logo-cinetrack.png"
              class="w-40 md:w-48"
              alt="CineTrack"
            />
          </div>

          <!-- BUTTONS -->
          <div class="flex gap-3">
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
          </div>
        </div>
      </header>

      <!-- SPACER to avoid content under fixed header -->
      <div class="h-[72px] md:h-[80px]"></div>

      <!-- MAIN CONTENT -->
      <main class="flex-1">
        <ng-content></ng-content>
      </main>

      <!-- FOOTER -->
      <footer class="bg-black/20 py-6 border-t border-white/10">
        <div class="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>CineTrack © {{ currentYear }} — Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  `,
})
export class AppLayoutComponent {
  currentYear = new Date().getFullYear();
}
