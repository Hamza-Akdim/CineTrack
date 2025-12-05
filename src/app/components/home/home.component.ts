import { Component, OnInit } from '@angular/core';
import { TmdbService } from '../../services/tmdb.service';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  popularMovies: any[] = [];
  searchQuery: string = '';
  genres: any[] = [];
  selectedGenre: string = '';
  selectedYear: string = '';
  minRating: number = 0;
  years: number[] = [];

  constructor(private tmdbService: TmdbService, private router: Router) { }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { query: this.searchQuery } });
    }
  }

  ngOnInit() {
    this.generateYears();
    this.tmdbService.getPopularMovies().subscribe(data => {
      this.popularMovies = data.results;
    });
    this.tmdbService.getGenres().subscribe(data => {
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
      this.tmdbService.discoverMovies(filters).subscribe(data => {
        this.popularMovies = data.results;
      });
    } else {
      this.tmdbService.getPopularMovies().subscribe(data => {
        this.popularMovies = data.results;
      });
    }
  }
}
