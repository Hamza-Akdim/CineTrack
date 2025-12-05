import { Injectable, inject, signal } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User,
  authState
} from '@angular/fire/auth';
import { Observable, from } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  
  // Signal pour l'état de l'utilisateur
  currentUser = signal<UserProfile | null>(null);
  
  constructor() {
    // console.log('🔧 AuthService: Initialisation du service d\'authentification');
    
    // Écouter les changements d'état d'authentification
    authState(this.auth).subscribe((user: User | null) => {
      console.log('AuthService: Changement d\'état utilisateur:', user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      } : 'Déconnecté');
      
      if (user) {
        this.currentUser.set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
        console.log('AuthService: Utilisateur connecté et signal mis à jour');
      } else {
        this.currentUser.set(null);
        console.log('AuthService: Utilisateur déconnecté');
      }
    });

    // Gérer le retour de redirection Google
    getRedirectResult(this.auth).then((result) => {
      if (result) {
        console.log('AuthService: Retour de redirection Google réussi', result.user.email);
      }
    }).catch((error) => {
      console.error('AuthService: Erreur retour redirection Google', error);
    });
  }

  // Inscription avec email/password
  register(email: string, password: string, displayName: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.auth, email, password)
      .then((result) => {
        // Mettre à jour le profil avec le nom
        return updateProfile(result.user, { displayName });
      });
    
    return from(promise);
  }

  // Connexion avec email/password
  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.auth, email, password)
      .then(() => {});
    
    return from(promise);
  }

  // Connexion avec Google
  loginWithGoogle(): Observable<void> {
    console.log('AuthService: Démarrage de la connexion Google (Redirect)...');
    
    const provider = new GoogleAuthProvider();
    const promise = signInWithRedirect(this.auth, provider);
    
    return from(promise);
  }

  // Déconnexion
  logout(): Observable<void> {
    const promise = signOut(this.auth);
    return from(promise);
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  // Observer l'état d'authentification
  authState$(): Observable<User | null> {
    return authState(this.auth);
  }
}
