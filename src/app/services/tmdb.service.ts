import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TmdbService {
    private apiUrl = 'https://api.themoviedb.org/3';
    private apiKey = environment.tmdbApiKey;

    constructor(private http: HttpClient) { }

    private getOptions(params: any = {}) {
        return {
            params: {
                api_key: this.apiKey,
                language: 'fr-FR',
                ...params
            }
        };
    }

    getPopularMovies(): Observable<any> {
        return this.http.get(`${this.apiUrl}/movie/popular`, this.getOptions());
    }

    searchMovies(query: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/search/movie`, this.getOptions({ query }));
    }

    getMovieDetails(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/movie/${id}`, this.getOptions());
    }

    getGenres(): Observable<any> {
        return this.http.get(`${this.apiUrl}/genre/movie/list`, this.getOptions());
    }

    discoverMovies(filters: any): Observable<any> {
        return this.http.get(`${this.apiUrl}/discover/movie`, this.getOptions(filters));
    }
}
