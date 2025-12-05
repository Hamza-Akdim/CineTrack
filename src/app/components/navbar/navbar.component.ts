import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-content">
          <!-- Logo -->
          <div class="logo" routerLink="/">
            <span>CinéTrack</span>
          </div>

          <!-- Desktop Menu -->
          <div class="menu">
            <div class="menu-items">
              <a routerLink="/home" class="nav-link">Accueil</a>
              
              @if (currentUser()) {
                <a routerLink="/dashboard" class="nav-link">Mon Profil</a>
                <button (click)="logout()" class="btn-logout">
                  Déconnexion
                </button>
              } @else {
                <a routerLink="/login" class="nav-link">Connexion</a>
                <a routerLink="/register" class="btn-register">
                  Inscription
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      position: sticky;
      top: 0;
      z-index: 50;
      border-bottom: 1px solid #333;
      backdrop-filter: blur(10px);
    }
    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .nav-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 4rem;
    }
    .logo {
      cursor: pointer;
      font-size: 1.5rem;
      font-weight: bold;
      color: #dc2626; /* Red-600 */
      letter-spacing: 0.05em;
    }
    .menu {
      display: block;
    }
    .menu-items {
      margin-left: 2.5rem;
      display: flex;
      align-items: baseline;
      gap: 1rem;
    }
    .nav-link {
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    .nav-link:hover {
      background-color: #1f2937; /* Gray-800 */
    }
    .btn-register {
      background-color: #dc2626;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      transition: background-color 0.2s;
      margin-left: 0.5rem;
    }
    .btn-register:hover {
      background-color: #b91c1c;
    }
    .btn-logout {
      background-color: #dc2626;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-left: 1rem;
    }
    .btn-logout:hover {
      background-color: #b91c1c;
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  router = inject(Router);
  currentUser = this.authService.currentUser;

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
