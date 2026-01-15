import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';  // Opérateurs RxJS pour manipuler les Observables


// Private Routes : protège les pages privées
export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);

  const router = inject(Router);


  // authState$() : renvoie un Observable<User | null> based on the Firebase's state
  return authService.authState$().pipe( // transforme l’état utilisateur
    
    take(1), // Prendre seulement la première valeur puis se désabonne automatiquement

    map(user => {  // transforme la valeur reçu en true ou false selon l'existance du User
      const isAuth = !!user;
      console.log('authGuard: État Firebase -', isAuth ? 'Authentifié' : 'Non authentifié', user?.email || '');

      if (isAuth) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};

// Publique Routes : empêche l’accès au login si déjà connecté
export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);


  // Utiliser authState$ pour attendre l'état réel de Firebase
  return authService.authState$().pipe(

    take(1),
    map(user => {
      const isAuth = !!user;

      if (!isAuth) {

        return true;
      } else {
        router.navigate(['/home']);
        return false;
      }
    })
  );
};
