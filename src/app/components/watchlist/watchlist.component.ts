import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Movie } from '../../models/movie.model';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AppLayoutComponent } from '../layout/app-layout.component';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, RouterLink, AppLayoutComponent],
  template: `
    <app-layout>
      <div class="max-w-7xl mx-auto space-y-8 px-4 py-8">
        
        <h1 class="text-3xl font-bold border-b border-white/10 pb-4">Watchlist</h1>

        <div *ngIf="watchlist$ | async as watchlist">
          <!-- Empty State -->
          <div *ngIf="watchlist.length === 0" class="flex flex-col items-center justify-center py-20 text-center text-gray-400">
             <div class="bg-white/5 p-6 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
             </div>
             <p class="text-xl font-medium">Votre Watchlist est vide.</p>
             <p class="mt-2 text-sm">Ajoutez des films pour les regarder plus tard !</p>
             <a routerLink="/" class="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition">Découvrir des films</a>
          </div>

          <!-- Grid -->
          <div *ngIf="watchlist.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <a *ngFor="let movie of watchlist" [routerLink]="['/movie', movie.id]" class="group relative bg-[#1a1d26] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition hover:-translate-y-1 block">
               <div class="aspect-[2/3] relative">
                  <img [src]="'https://image.tmdb.org/t/p/w500' + movie.poster_path" [alt]="movie.title" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                  <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                     <span class="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium">Voir détails</span>
                  </div>
                  
                  <!-- Rating Badge -->
                  <div class="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    {{ movie.vote_average | number:'1.1-1' }}
                  </div>
                  
                  <!-- Remove Button -->
                  <button 
                    (click)="removeFromWatchlist($event, movie.id)" 
                    class="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 backdrop-blur-md rounded-full text-white transition hover:scale-110 shadow-lg group-buttons"
                    title="Retirer de la Watchlist">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

               </div>
               <div class="p-4">
                  <h3 class="font-bold text-white truncate group-hover:text-blue-400 transition">{{ movie.title }}</h3>
                  <div class="flex justify-between items-center mt-2 text-xs text-gray-400">
                     <span>{{ movie.release_date | date:'yyyy' }}</span>
                  </div>
               </div>
            </a>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class WatchlistComponent {
  authService = inject(AuthService);
  watchlist$: Observable<Movie[]> = this.authService.getWatchlist();

  removeFromWatchlist(event: Event, movieId: number) {
    event.stopPropagation();
    event.preventDefault();
    if (confirm('Voulez-vous vraiment retirer ce film de votre Watchlist ?')) {
      this.authService.removeFromWatchlist(movieId).subscribe();
    }
  }
}
