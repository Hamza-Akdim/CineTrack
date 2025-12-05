import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('authGuard: Vérification accès à', state.url);

  // Utiliser authState$ pour attendre l'état réel de Firebase
  return authService.authState$().pipe(
    take(1), // Prendre seulement la première valeur
    map(user => {
      const isAuth = !!user;
      console.log('authGuard: État Firebase -', isAuth ? 'Authentifié' : 'Non authentifié', user?.email || '');

      if (isAuth) {
        console.log('authGuard: Accès autorisé');
        return true;
      } else {
        console.log(' authGuard: Accès refusé - Redirection vers /login');
        router.navigate(['/login']);
        return false;
      }
    })
  );
};

// Guard pour les routes publiques (redirection si connecté)
export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('publicGuard: Vérification accès à', state.url);

  // Utiliser authState$ pour attendre l'état réel de Firebase
  return authService.authState$().pipe(
    take(1),
    map(user => {
      const isAuth = !!user;
      console.log('publicGuard: État Firebase -', isAuth ? 'Authentifié' : 'Non authentifié');

      if (!isAuth) {
        console.log('publicGuard: Accès autorisé (non connecté)');
        return true;
      } else {
        console.log('publicGuard: Déjà connecté - Redirection vers /home');
        router.navigate(['/home']);
        return false;
      }
    })
  );
};
