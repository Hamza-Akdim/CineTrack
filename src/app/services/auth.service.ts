import { Injectable, inject, signal, Injector, runInInjectionContext } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  authState
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  query,
  where,
  collectionData,
  doc,
  setDoc,
  deleteDoc,
  getDoc
} from '@angular/fire/firestore';
import { Observable, from, of, switchMap, map } from 'rxjs';
import { Movie } from '../models/movie.model';

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
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  currentUser = signal<UserProfile | null>(null);

  constructor() {
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

  register(email: string, password: string, displayName: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.auth, email, password)
      .then((result) => {
        return updateProfile(result.user, { displayName });
      });
    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.auth, email, password)
      .then(() => { });
    return from(promise);
  }

  loginWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();
    const promise = signInWithPopup(this.auth, provider)
      .then((result) => { return; })
      .catch((error) => { throw error; });
    return from(promise);
  }

  updateUserProfile(displayName: string, photoURL?: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) return of();
    const promise = updateProfile(user, { displayName, photoURL });
    return from(promise);
  }

  updateUserPassword(newPassword: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) return of();
    const promise = updatePassword(user, newPassword);
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.auth);
    return from(promise);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  authState$(): Observable<User | null> {
    return authState(this.auth);
  }

  getFavorites(): Observable<Movie[]> {
    return this.authState$().pipe(
      switchMap(user => {
        if (!user) return of([]);
        const favoritesRef = collection(this.firestore, `users/${user.uid}/favorites`);
        return runInInjectionContext(this.injector, () =>
          collectionData(favoritesRef, { idField: 'id' }) as Observable<Movie[]>
        );
      })
    );
  }

  addFavorite(movie: Movie): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) return of();

    const movieData: any = { ...movie };

    const favoriteRef = doc(this.firestore, `users/${user.uid}/favorites/${movie.id}`);
    return from(setDoc(favoriteRef, movieData));
  }

  removeFavorite(movieId: number): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) return of();

    const favoriteRef = doc(this.firestore, `users/${user.uid}/favorites/${movieId}`);
    return from(deleteDoc(favoriteRef));
  }

  isFavorite(movieId: number): Observable<boolean> {
    return this.getFavorites().pipe(
      map(favorites => favorites.some(m => m.id === movieId))
    );
  }
}
