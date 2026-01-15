import { Component, OnInit } from '@angular/core';
import { TmdbService } from '../../services/tmdb.service';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppLayoutComponent } from '../layout/app-layout.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AppLayoutComponent],
  template: `
    <app-layout>
      <!-- SEARCH -->
      <div class="flex justify-center mt-20 px-4">
        <div class="w-full max-w-2xl relative">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (keyup.enter)="onSearch()"
            placeholder="Chercher les films ..."
            class="w-full px-5 py-3 pl-12 rounded-full text-black outline-none shadow-md"
          />
          <i class="fa fa-search absolute left-4 top-3 text-black/60"></i>
        </div>
      </div>

      <!-- FILTERS -->
      <div
        class="flex flex-col md:flex-row justify-center items-center mb-20 gap-6 bg-black/40 p-4 rounded-xl backdrop-blur-sm mx-4 my-6"
      >
        <!-- GENRE -->
        <div class="flex flex-col text-left w-full md:w-auto">
          <label class="text-xs text-gray-400 font-semibold mb-1">Genre</label>
          <select
            [(ngModel)]="selectedGenre"
            (change)="applyFilters()"
            class="px-3 py-2 bg-black/70 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les genres</option>
            <option *ngFor="let genre of genres" [value]="genre.id">
              {{ genre.name }}
            </option>
          </select>
        </div>

        <!-- YEAR -->
        <div class="flex flex-col text-left w-full md:w-auto">
          <label class="text-xs text-gray-400 font-semibold mb-1">Année</label>
          <select
            [(ngModel)]="selectedYear"
            (change)="applyFilters()"
            class="px-3 py-2 bg-black/70 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les années</option>
            <option *ngFor="let year of years" [value]="year">
              {{ year }}
            </option>
          </select>
        </div>

        <!-- RATING -->
        <div class="flex flex-col text-left w-full md:w-auto">
          <label class="text-xs text-gray-400 font-semibold mb-1">
            Note minimum : {{ minRating }}
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            [(ngModel)]="minRating"
            (change)="applyFilters()"
            class="accent-blue-500 cursor-pointer"
          />
        </div>
      </div>

      <!-- MOVIES -->
      <div class="max-w-7xl mx-auto px-4 mt-4 pb-16">
        
        <!-- SECTION TITLE -->
        <div class="mb-6 flex items-center gap-2">
            <h2 class="text-2xl font-bold text-white">
                <span *ngIf="isTrendingPage">Films du moment</span>
                <span *ngIf="!isTrendingPage">Résultats</span>
            </h2>
            <div class="h-1 flex-grow bg-gray-800 rounded-full ml-4"></div>
        </div>

        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          <div
            *ngFor="let movie of popularMovies"
            [routerLink]="['/movie', movie.id]"
            class="cursor-pointer group bg-[#111418] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform hover:scale-[1.05]"
          >
            <div class="relative">
              <img
                [src]="'https://image.tmdb.org/t/p/w500' + movie.poster_path"
                class="w-full h-72 object-cover group-hover:opacity-90 transition"
              />

              <div
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3"
              >
                <p class="text-sm font-semibold text-white truncate">
                  {{ movie.title }}
                </p>
                <p class="text-xs text-gray-300">
                  ⭐ {{ movie.vote_average | number:'1.1-1' }}/10
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- PAGINATION -->
        <div class="flex justify-center items-center mt-12 gap-4">
            <button 
                (click)="changePage(currentPage - 1)"
                [disabled]="currentPage === 1"
                class="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition"
            >
                <i class="fa fa-chevron-left mr-2"></i> Précédent
            </button>

            <span class="text-gray-400 font-medium">
                Page <span class="text-white">{{ currentPage }}</span> sur <span class="text-white">{{ totalPages }}</span>
            </span>

            <button 
                (click)="changePage(currentPage + 1)"
                [disabled]="currentPage === totalPages"
                class="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition"
            >
                Suivant <i class="fa fa-chevron-right ml-2"></i>
            </button>
        </div>

      </div>
    </app-layout>
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

  // Pagination
  currentPage: number = 1;
  totalPages: number = 0;

  currentYear = new Date().getFullYear();

  constructor(private tmdbService: TmdbService, private router: Router) { }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.currentPage = 1;
      this.loadMovies();
    } else {
      this.selectedGenre = '';
      this.selectedYear = '';
      this.minRating = 0;
      this.currentPage = 1;
      this.loadMovies();
    }
  }

  ngOnInit() {
    this.generateYears();
    this.loadMovies();
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
    this.currentPage = 1;
    this.loadMovies();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadMovies();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  loadMovies() {
    if (this.searchQuery.trim()) {
      this.tmdbService.searchMovies(this.searchQuery, this.currentPage).subscribe(data => {
        this.popularMovies = data.results;
        this.totalPages = data.total_pages;
      });
    } else {
      const filters: any = {};
      if (this.selectedGenre) filters.with_genres = this.selectedGenre;
      if (this.selectedYear) filters.primary_release_year = this.selectedYear;
      if (this.minRating > 0) filters['vote_average.gte'] = this.minRating;

      if (Object.keys(filters).length > 0) {
        this.tmdbService.discoverMovies(filters, this.currentPage).subscribe((data) => {
          this.popularMovies = data.results;
          this.totalPages = data.total_pages;
        });
      } else {
        this.tmdbService.getPopularMovies(this.currentPage).subscribe((data) => {
          this.popularMovies = data.results;
          this.totalPages = data.total_pages;
        });
      }
    }
  }

  get isTrendingPage(): boolean {
    const hasFilters = this.selectedGenre || this.selectedYear || this.minRating > 0;
    return this.currentPage === 1 && !this.searchQuery && !hasFilters;
  }
}
