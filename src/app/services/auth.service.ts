import { Injectable, inject, signal } from '@angular/core';
import { 
  Auth,    //instance Firebase Auth
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  authState   //Observable de l’état auth
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
  private auth = inject(Auth);  //Récupère l’instance Firebase Auth
  
  currentUser = signal<UserProfile | null>(null);   //comme useState
  
  constructor() { //écoute Firebase
    
    // Écouter les changements d'état d'authentification 
    authState(this.auth).subscribe((user: User | null) => {
      
      if (user) {
        this.currentUser.set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      } else {
        this.currentUser.set(null);
      }
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
    console.log('AuthService: Démarrage de la connexion Google...');
    
    const provider = new GoogleAuthProvider();
    console.log('AuthService: GoogleAuthProvider créé');
    
    const promise = signInWithPopup(this.auth, provider)
      .then((result) => {
        console.log('AuthService: signInWithPopup réussi!', {
          user: result.user.email,
          uid: result.user.uid,
          displayName: result.user.displayName
        });
        return;
      })
      .catch((error) => {
        console.error('AuthService: Erreur signInWithPopup:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        throw error;
      });
    
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
