import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { AuthService } from '../../services/auth.service';
import { Movie, Credits, VideoResponse } from '../../models/movie.model';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppLayoutComponent } from '../layout/app-layout.component';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, AppLayoutComponent, MatSnackBarModule],
  template: `
    <app-layout>
      <div *ngIf="movie" class="relative w-full text-white -mt-[80px]"> 
        
        <div class="absolute inset-0 h-[80vh] w-full z-0">
           <div class="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/90 to-transparent z-10"></div>
           <div class="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/60 to-transparent z-10"></div>
           <img 
             [src]="'https://image.tmdb.org/t/p/original' + movie.backdrop_path" 
             class="w-full h-full object-cover object-top opacity-60"
             [alt]="movie.title"
           >
        </div>

        <div class="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col md:flex-row gap-8 items-start">
          
          <div class="hidden md:block w-72 lg:w-80 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition duration-300 border-2 border-white/10">
            <img 
              [src]="'https://image.tmdb.org/t/p/w500' + movie.poster_path" 
              class="w-full h-auto"
              [alt]="movie.title"
            >
          </div>

          <div class="flex-1 space-y-6">
            
            <div class="drop-shadow-lg">
              <h1 class="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">{{ movie.title }}</h1>
               <div class="flex flex-wrap items-center gap-4 mt-3 text-sm md:text-base text-gray-200">
                <span *ngIf="movie.release_date" class="bg-white/10 px-2 py-1 rounded">{{ movie.release_date | date:'yyyy' }}</span>
                <div class="flex items-center text-yellow-400">
                  <i *ngFor="let star of [1,2,3,4,5]" class="fas fa-star" [class.text-gray-600]="star > (movie.vote_average / 2)"></i>
                  <span class="ml-2 font-bold">{{ movie.vote_average | number:'1.1-1' }}</span>
                </div>
                <span>{{ movie.runtime }} min</span>
              </div>
            </div>

             <div class="flex flex-wrap gap-2 text-xs md:text-sm">
                <span *ngFor="let g of movie.genres" class="px-3 py-1 rounded-full border border-gray-600 bg-black/40 text-gray-300">
                  {{ g.name }}
                </span>
            </div>

            <div class="max-w-2xl bg-black/30 md:bg-transparent p-4 md:p-0 rounded-xl backdrop-blur-sm md:backdrop-blur-none">
              <h3 class="text-xl font-bold text-white mb-2">Synopsis</h3>
              <p class="text-gray-300 leading-relaxed text-base md:text-lg break-words text-justify">{{ movie.overview }}</p>
            </div>

            <div class="flex flex-wrap gap-4 pt-4">
              <a *ngIf="trailerKey" [href]="'https://www.youtube.com/watch?v=' + trailerKey" target="_blank" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-bold transition flex items-center gap-2">
                <i class="fas fa-play"></i> Bande-annonce
              </a>
              
              <button (click)="toggleFavorite()" 
                class="px-8 py-3 rounded-full font-bold transition flex items-center gap-2 border border-gray-500 hover:bg-white/10"
                [class.bg-red-600]="isFavorite" [class.border-transparent]="isFavorite" [class.text-white]="isFavorite">
                <i class="fas" [class.fa-heart]="isFavorite" [class.fa-heart-open]="!isFavorite"></i> 
                {{ isFavorite ? 'Déjà favoris' : 'Ajouter aux favoris' }}
              </button>

              <button (click)="toggleWatchlist()" 
                class="px-8 py-3 rounded-full font-bold transition flex items-center gap-2 border border-gray-500 hover:bg-white/10"
                [class.bg-blue-600]="isInWatchlist" [class.border-transparent]="isInWatchlist" [class.text-white]="isInWatchlist">
                <i class="fas" [class.fa-check]="isInWatchlist" [class.fa-plus]="!isInWatchlist"></i> 
                {{ isInWatchlist ? 'Dans la Watchlist' : 'Ajouter à la Watchlist' }}
              </button>
            </div>

            <div *ngIf="credits" class="pt-8">
              <h3 class="text-xl font-bold text-white mb-4">Casting</h3>
              <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                <div *ngFor="let actor of credits.cast | slice:0:10" class="flex-shrink-0 w-32 text-center group">
                  <div class="w-24 h-24 mx-auto rounded-full overflow-hidden mb-2 border-2 border-transparent group-hover:border-blue-500 transition">
                    <img [src]="actor.profile_path ? 'https://image.tmdb.org/t/p/w200' + actor.profile_path : 'assets/placeholder.png'" 
                         class="w-full h-full object-cover">
                  </div>
                  <p class="text-sm font-bold truncate">{{ actor.name }}</p>
                  <p class="text-xs text-gray-400 truncate">{{ actor.character }}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
  `]
})
export class MovieDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tmdbService = inject(TmdbService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  movie: Movie | null = null;
  credits: Credits | null = null;
  trailerKey: string | null = null;
  isFavorite: boolean = false;

  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => {
        const id = params['id'];
        this.checkIfFavorite(id);
        this.checkIfInWatchlist(id);
        this.loadCredits(id);
        this.loadVideos(id);
        return this.tmdbService.getMovie(id);
      })
    ).subscribe({
      next: (movie) => {
        this.movie = movie;
      },
      error: (err) => console.error('Erreur chargement film', err)
    });
  }

  loadCredits(id: string) {
    this.tmdbService.getCredits(id).subscribe(data => this.credits = data);
  }

  loadVideos(id: string) {
    this.tmdbService.getVideos(id).subscribe(data => {
      const trailer = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer) {
        this.trailerKey = trailer.key;
      }
    });
  }

  checkIfFavorite(id: string) {
    this.authService.isFavorite(Number(id)).subscribe(isFav => this.isFavorite = isFav);
  }

  toggleFavorite() {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.movie) return;

    if (this.isFavorite) {
      this.authService.removeFavorite(this.movie.id).subscribe(() => {
        this.isFavorite = false;
        this.snackBar.open('Retiré des favoris', 'Fermer', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      });
    } else {
      this.authService.addFavorite(this.movie).subscribe(() => {
        this.isFavorite = true;
        this.snackBar.open('Ajouté aux favoris avec succès !', 'OK', {
          duration: 3000,
          panelClass: ['green-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      });
    }
  }

  // --- WATCHLIST ---

  isInWatchlist: boolean = false;

  checkIfInWatchlist(id: string) {
    this.authService.isInWatchlist(Number(id)).subscribe(inList => this.isInWatchlist = inList);
  }

  toggleWatchlist() {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.movie) return;

    if (this.isInWatchlist) {
      this.authService.removeFromWatchlist(this.movie.id).subscribe(() => {
        this.isInWatchlist = false;
        this.snackBar.open('Retiré de la Watchlist', 'Fermer', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      });
    } else {
      this.authService.addToWatchlist(this.movie).subscribe(() => {
        this.isInWatchlist = true;
        this.snackBar.open('Ajouté à la Watchlist !', 'OK', {
          duration: 3000,
          panelClass: ['green-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      });
    }
  }
}
