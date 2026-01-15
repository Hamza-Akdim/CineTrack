import { Component, OnInit } from '@angular/core';
import { TmdbService } from '../../services/tmdb.service';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppLayoutComponent } from '../layout/app-layout.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

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
            (ngModelChange)="onSearch()"
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
                  ⭐ {{ movie.vote_average }}/10
                </p>
              </div>
            </div>
          </div>
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

  private searchSubject = new Subject<string>();

  currentYear = new Date().getFullYear();

  constructor(private tmdbService: TmdbService, private router: Router) {}

  onSearch() {
    this.searchSubject.next(this.searchQuery);
  }

  ngOnInit() {
    this.generateYears();
    
    // Initial load
    this.tmdbService.getPopularMovies().subscribe((data) => {
      this.popularMovies = data.results;
    });

    this.tmdbService.getGenres().subscribe((data) => {
      this.genres = data.genres;
    });

    // Live Search Subscription
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim()) {
           return this.tmdbService.searchMovies(query);
        } else {
           return this.tmdbService.getPopularMovies();
        }
      })
    ).subscribe(data => {
      this.popularMovies = data.results;
    });
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1900; i--) {
      this.years.push(i);
    }
  }

  applyFilters() {
    // Override search if filters are used
    const filters: any = {};
    if (this.selectedGenre) filters.with_genres = this.selectedGenre;
    if (this.selectedYear) filters.primary_release_year = this.selectedYear;
    if (this.minRating > 0) filters['vote_average.gte'] = this.minRating;

    if (Object.keys(filters).length > 0) {
      this.tmdbService.discoverMovies(filters).subscribe((data) => {
        this.popularMovies = data.results;
      });
    } else {
      // If no filters, revert to current search state or popular
      if (this.searchQuery.trim()) {
         this.tmdbService.searchMovies(this.searchQuery).subscribe(data => this.popularMovies = data.results);
      } else {
         this.tmdbService.getPopularMovies().subscribe((data) => {
          this.popularMovies = data.results;
        });
      }
    }
  }
}
