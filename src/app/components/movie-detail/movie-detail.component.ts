import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { TmdbService } from '../../services/tmdb.service';
import { AuthService } from '../../services/auth.service';
import { Movie, Credits } from '../../models/movie.model';
import { AppLayoutComponent } from '../layout/app-layout.component';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, AppLayoutComponent],
  template: `
    <app-layout>
      <div *ngIf="movie" class="relative w-full text-white -mt-[80px]">

        <!-- BACKDROP -->
        <div class="absolute inset-0 h-[55vh] sm:h-[65vh] lg:h-[80vh] w-full z-0">
          <div class="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/90 to-transparent z-10"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/70 to-transparent z-10"></div>

          <img
            [src]="'https://image.tmdb.org/t/p/original' + movie.backdrop_path"
            class="w-full h-full object-cover object-top opacity-60"
            [alt]="movie.title"
          />
        </div>

        <!-- CONTENT -->
        <div
          class="relative z-20 max-w-7xl mx-auto
          px-4 sm:px-6 lg:px-8
          pt-28 sm:pt-32 lg:pt-40
          flex flex-col lg:flex-row
          gap-8 lg:gap-12
          items-center lg:items-start
          text-center lg:text-left"
        >

          <!-- POSTER -->
          <div
            class="w-44 sm:w-56 lg:w-80
            rounded-xl overflow-hidden shadow-2xl
            border border-white/10 flex-shrink-0"
          >
            <img
              [src]="'https://image.tmdb.org/t/p/w500' + movie.poster_path"
              class="w-full h-auto"
              [alt]="movie.title"
            />
          </div>

          <!-- INFOS -->
          <div class="flex-1 space-y-6 w-full">

            <!-- TITLE -->
            <div>
              <h1 class="text-2xl sm:text-4xl lg:text-6xl font-extrabold">
                {{ movie.title }}
              </h1>

              <div
                class="flex flex-wrap justify-center lg:justify-start
                items-center gap-3 mt-3 text-sm sm:text-base"
              >
                <span *ngIf="movie.release_date"
                  class="bg-white/10 px-3 py-1 rounded"
                >
                  {{ movie.release_date | date: 'yyyy' }}
                </span>

                <div class="flex items-center text-yellow-400 gap-1">
                  <i
                    *ngFor="let star of [1,2,3,4,5]"
                    class="fas fa-star"
                    [class.text-gray-600]="star > movie.vote_average / 2"
                  ></i>
                  <span class="ml-2 font-bold text-white">
                    {{ movie.vote_average | number:'1.1-1' }}
                  </span>
                </div>

                <span>{{ movie.runtime }} min</span>
              </div>
            </div>

            <!-- GENRES -->
            <div class="flex flex-wrap justify-center lg:justify-start gap-2 text-xs sm:text-sm">
              <span
                *ngFor="let g of movie.genres"
                class="px-3 py-1 rounded-full border border-gray-600 bg-black/40 text-gray-300"
              >
                {{ g.name }}
              </span>
            </div>

            <!-- SYNOPSIS -->
            <div class="max-w-2xl mx-auto lg:mx-0">
              <h3 class="text-xl font-bold mb-2">Synopsis</h3>
              <p class="text-gray-300 leading-relaxed text-justify">
                {{ movie.overview }}
              </p>
            </div>

            <!-- ACTIONS -->
            <div class="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">

              <a
                *ngIf="trailerKey"
                [href]="'https://www.youtube.com/watch?v=' + trailerKey"
                target="_blank"
                class="w-full sm:w-auto px-6 py-3
                bg-blue-600 hover:bg-blue-700
                rounded-full font-bold transition
                flex items-center justify-center gap-2"
              >
                <i class="fas fa-play"></i>
                Bande-annonce
              </a>

              <button
                (click)="toggleFavorite()"
                class="w-full sm:w-auto px-6 py-3
                rounded-full font-bold transition
                flex items-center justify-center gap-2
                border border-gray-500 hover:bg-white/10"
                [class.bg-red-600]="isFavorite"
                [class.border-transparent]="isFavorite"
              >
                <i
                  class="fa-heart"
                  [class.fas]="isFavorite"
                  [class.far]="!isFavorite"
                ></i>
                {{ isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
              </button>

            </div>

            <!-- CASTING -->
            <div *ngIf="credits" class="pt-10">
              <h3 class="text-xl font-bold mb-4">Casting</h3>

              <div
                class="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
              >
                <div
                  *ngFor="let actor of credits.cast | slice:0:12"
                  class="flex-shrink-0 w-28 snap-start text-center"
                >
                  <div
                    class="w-24 h-24 mx-auto rounded-full overflow-hidden mb-2
                    border border-white/10 hover:border-blue-500 transition"
                  >
                    <img
                      [src]="actor.profile_path
                        ? 'https://image.tmdb.org/t/p/w200' + actor.profile_path
                        : 'assets/placeholder.png'"
                      class="w-full h-full object-cover"
                    />
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
  styles: [
    `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `,
  ],
})
export class MovieDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tmdbService = inject(TmdbService);
  private authService = inject(AuthService);

  movie: Movie | null = null;
  credits: Credits | null = null;
  trailerKey: string | null = null;
  isFavorite = false;

  ngOnInit() {
    this.route.params
      .pipe(
        switchMap(params => {
          const id = params['id'];
          this.checkIfFavorite(id);
          this.loadCredits(id);
          this.loadVideos(id);
          return this.tmdbService.getMovie(id);
        })
      )
      .subscribe({
        next: movie => (this.movie = movie),
        error: err => console.error('Erreur chargement film', err),
      });
  }

  loadCredits(id: string) {
    this.tmdbService.getCredits(id).subscribe(data => (this.credits = data));
  }

  loadVideos(id: string) {
    this.tmdbService.getVideos(id).subscribe(data => {
      const trailer = data.results.find(
        v => v.type === 'Trailer' && v.site === 'YouTube'
      );
      this.trailerKey = trailer?.key ?? null;
    });
  }

  checkIfFavorite(id: string) {
    this.authService
      .isFavorite(Number(id))
      .subscribe(isFav => (this.isFavorite = isFav));
  }

  toggleFavorite() {
    if (!this.movie) return;

    const action$ = this.isFavorite
      ? this.authService.removeFavorite(this.movie.id)
      : this.authService.addFavorite(this.movie);

    action$.subscribe(() => (this.isFavorite = !this.isFavorite));
  }
}
