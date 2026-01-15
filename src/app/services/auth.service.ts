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
  getDoc,
  docData
} from '@angular/fire/firestore';
import { Observable, from, of, switchMap, map, catchError } from 'rxjs';
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
    authState(this.auth).pipe(
      switchMap((user: User | null) => {
        if (!user) {
          return of(null);
        }
        // Sync with Firestore user document
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        return docData(userDoc).pipe(
          map((data: any) => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: data?.['photoURL'] || user.photoURL
          })),
          catchError((err) => {
            console.error("Firestore blocked/failed, falling back to Auth user", err);
            // Fallback to basic auth data
            return of({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            });
          })
        );
      })
    ).subscribe((userProfile) => {
      this.currentUser.set(userProfile);
    });
  }

  // Helper to sync basic Auth data to Firestore
  private syncUserToFirestore(user: User): Promise<void> {
    const userDoc = doc(this.firestore, `users/${user.uid}`);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      lastLogin: new Date()
    };
    return setDoc(userDoc, userData, { merge: true });
  }

  register(email: string, password: string, displayName: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.auth, email, password)
      .then(async (result) => {
        await updateProfile(result.user, { displayName });
        await this.syncUserToFirestore(result.user);
      });
    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.auth, email, password)
      .then(async (result) => {
        await this.syncUserToFirestore(result.user);
      });
    return from(promise);
  }

  loginWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();
    const promise = signInWithPopup(this.auth, provider)
      .then(async (result) => {
        await this.syncUserToFirestore(result.user);
      })
      .catch((error) => { throw error; });
    return from(promise);
  }

  updateUserProfile(displayName: string, photoURL?: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) return of();
    const promise = updateProfile(user, { displayName, photoURL })
      .then(async () => {
        // Also update Firestore to keep it in sync
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        await setDoc(userDoc, { displayName }, { merge: true });
      });
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
        ).pipe(
          catchError((error) => {
            console.error('Error fetching favorites (permissions?):', error);
            return of([]);
          })
        );
      })
    );
  }

  addFavorite(movie: Movie): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) return of();

    const movieData: any = { ...movie };

    // Ensure user doc exists (just in case)
    const favoriteRef = doc(this.firestore, `users/${user.uid}/favorites/${movie.id}`);

    // We can also opportunistically update the parent doc here if we wanted, 
    // but the login sync should cover it.
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

  saveProfileImage(base64Image: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) return of();

    const userDoc = doc(this.firestore, `users/${user.uid}`);
    return from(setDoc(userDoc, { photoURL: base64Image }, { merge: true }));
  }
}
