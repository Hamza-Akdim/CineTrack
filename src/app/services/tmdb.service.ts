import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TmdbService {
    private apiUrl = 'http://localhost:3000/api/movies';

    constructor(private http: HttpClient) { }

    getPopularMovies(): Observable<any> {
        return this.http.get(`${this.apiUrl}/popular`);
    }

    searchMovies(query: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/search`, { params: { query } });
    }

    getMovieDetails(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    getGenres(): Observable<any> {
        return this.http.get(`${this.apiUrl}/genres`);
    }

    discoverMovies(filters: any): Observable<any> {
        return this.http.get(`${this.apiUrl}/discover`, { params: filters });
    }
}
