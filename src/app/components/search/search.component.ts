import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { AppLayoutComponent } from '../layout/app-layout.component';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, AppLayoutComponent],
  template: `
    <app-layout>
      <div class="max-w-7xl mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-white mb-6">
          Résultats pour : <span class="text-blue-500">"{{ query }}"</span>
        </h1>

        <div *ngIf="movies.length === 0 && !loading" class="text-center py-20 text-gray-400">
          <p class="text-xl">Aucun résultat trouvé.</p>
          <a routerLink="/" class="mt-4 inline-block text-blue-400 hover:text-white transition">Retour à l'accueil</a>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <a *ngFor="let movie of movies" [routerLink]="['/movie', movie.id]" class="group bg-[#111418] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform hover:scale-[1.05] block">
            <div class="relative aspect-[2/3]">
              <img 
                [src]="movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : 'assets/placeholder.png'" 
                [alt]="movie.title"
                class="w-full h-full object-cover group-hover:opacity-90 transition"
              >
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                 <span class="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium text-white">Voir détails</span>
              </div>
              <div class="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold flex items-center gap-1 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                {{ movie.vote_average | number:'1.1-1' }}
              </div>
            </div>
            <div class="p-3">
              <h3 class="text-sm font-bold text-white truncate group-hover:text-blue-400 transition">{{ movie.title }}</h3>
              <p class="text-xs text-gray-400 mt-1">{{ movie.release_date | date:'yyyy' }}</p>
            </div>
          </a>
        </div>
      </div>
    </app-layout>
  `
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tmdbService = inject(TmdbService);

  query: string = '';
  movies: Movie[] = [];
  loading: boolean = true;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.query = params['query'] || '';
      if (this.query) {
        this.searchMovies();
      }
    });
  }

  searchMovies() {
    this.loading = true;
    this.tmdbService.searchMovies(this.query).subscribe({
      next: (data) => {
        this.movies = data.results;
        this.loading = false;
      },
      error: (err) => {
        console.error('Search error', err);
        this.loading = false;
      }
    });
  }
}
