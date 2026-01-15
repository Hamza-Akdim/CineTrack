import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

import { Movie, Credits, VideoResponse } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  private apiUrl = 'https://api.themoviedb.org/3';

  private http = inject(HttpClient);

  getPopularMovies(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/movie/popular`, {
      params: { api_key: environment.tmdbApiKey, page: page.toString() }
    });
  }

  searchMovies(query: string, page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/movie`, {
      params: { api_key: environment.tmdbApiKey, query, page: page.toString() }
    });
  }

  getGenres(): Observable<any> {
    return this.http.get(`${this.apiUrl}/genre/movie/list`, {
      params: { api_key: environment.tmdbApiKey }
    });
  }

  discoverMovies(filters: any, page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/discover/movie`, {
      params: { api_key: environment.tmdbApiKey, ...filters, page: page.toString() }
    });
  }

  getMovie(id: string): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrl}/movie/${id}`, {
      params: { api_key: environment.tmdbApiKey }
    });
  }

  getCredits(id: string): Observable<Credits> {
    return this.http.get<Credits>(`${this.apiUrl}/movie/${id}/credits`, {
      params: { api_key: environment.tmdbApiKey }
    });
  }

  getVideos(id: string): Observable<VideoResponse> {
    return this.http.get<VideoResponse>(`${this.apiUrl}/movie/${id}/videos`, {
      params: { api_key: environment.tmdbApiKey }
    });
  }
}





