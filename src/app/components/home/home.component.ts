import { Component, OnInit } from '@angular/core';
import { TmdbService } from '../../services/tmdb.service';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
// import {Logo} from './../../assets/logo.png';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div
      class="min-h-screen w-full bg-gradient-to-b from-[#05070b] to-[#0d1117] text-white"
    >
      <!-- HEADER -->
      <header
        class="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto"
      >
        <div class="flex items-center gap-2">
          <img src="logo-cinetrack.png" class="w-48" alt="CineTrack" />
        </div>

        <div class="flex gap-3">
          <button
            class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            Connexion
          </button>
          <button
            class="px-4 py-2 rounded-xl bg-white text-black hover:bg-gray-200 transition"
          >
            S'inscrire
          </button>
        </div>
      </header>

      <!-- SEARCH BAR -->
      <div class="flex justify-center mt-8 px-4">
        <div class="w-full max-w-2xl relative">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (keyup.enter)="onSearch()"
            placeholder="Chercher les films ..."
            class="w-full px-5 py-3 pl-12 rounded-full text-black outline-none"
          />
          <i class="fa fa-search absolute left-4 top-3 text-black/60"></i>
        </div>
      </div>

      <!-- FILTER BUTTONS -->
      <div class="flex flex-wrap justify-center gap-4 my-6 px-4">
        <button
          class="px-6 py-2 rounded-lg border border-blue-400 text-blue-300 hover:bg-blue-400/20 transition"
        >
          Genre
        </button>
        <button
          class="px-6 py-2 rounded-lg border border-blue-400 text-blue-300 hover:bg-blue-400/20 transition"
        >
          Date
        </button>
        <button
          class="px-6 py-2 rounded-lg border border-blue-400 text-blue-300 hover:bg-blue-400/20 transition"
        >
          Évaluation
        </button>
      </div>

      <div class="max-w-7xl mx-auto px-4 mt-4 pb-16">
        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          <div
            *ngFor="let movie of popularMovies"
            class="cursor-pointer group bg-[#111418] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
            [routerLink]="['/movie', movie.id]"
          >
            <div class="relative">
              <img
                [src]="'https://image.tmdb.org/t/p/w500' + movie.poster_path"
                alt="{{ movie.title }}"
                class="w-full h-72 object-cover group-hover:opacity-90 transition"
              />
              <div
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3"
              >
                <p class="text-sm font-semibold text-white truncate">
                  {{ movie.title }}
                </p>
                <p class="text-xs text-gray-300">
                  {{ movie.title }}
                </p>
                <p class="text-xs text-yellow-400 mt-1">
                  ⭐ {{ movie.vote_average }}/10
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <footer class="w-full bg-black/20 py-6 mt-10 border-t border-white/10">
        <div class="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>CineTrack © {{ currentYear }} — Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  popularMovies: any[] = [];
  searchQuery: string = '';
  genres: any[] = [];
  selectedGenre: string = '';
  selectedYear: string = '';
  minRating: number = 0;
  years: number[] = [];

  currentYear = new Date().getFullYear();

  constructor(private tmdbService: TmdbService, private router: Router) {}

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { query: this.searchQuery },
      });
    }
  }

  ngOnInit() {
    this.generateYears();
    this.tmdbService.getPopularMovies().subscribe((data) => {
      this.popularMovies = data.results;
    });
    this.tmdbService.getGenres().subscribe((data) => {
      this.genres = data.genres;
    });
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1900; i--) {
      this.years.push(i);
    }
  }

  applyFilters() {
    const filters: any = {};
    if (this.selectedGenre) filters.with_genres = this.selectedGenre;
    if (this.selectedYear) filters.primary_release_year = this.selectedYear;
    if (this.minRating > 0) filters['vote_average.gte'] = this.minRating;

    if (Object.keys(filters).length > 0) {
      this.tmdbService.discoverMovies(filters).subscribe((data) => {
        this.popularMovies = data.results;
      });
    } else {
      this.tmdbService.getPopularMovies().subscribe((data) => {
        this.popularMovies = data.results;
      });
    }
  }
}
