import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  private apiUrl = 'https://api.themoviedb.org/3';

  private http = inject(HttpClient);

  getPopularMovies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/movie/popular`, {
      params: { api_key: environment.tmdbApiKey }
    });
  }

  searchMovies(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/movie`, {
      params: { api_key: environment.tmdbApiKey, query }
    });
  }

  getGenres(): Observable<any> {
    return this.http.get(`${this.apiUrl}/genre/movie/list`, {
      params: { api_key: environment.tmdbApiKey }
    });
  }

  discoverMovies(filters: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/discover/movie`, {
      params: { api_key: environment.tmdbApiKey, ...filters }
    });
  }
}





