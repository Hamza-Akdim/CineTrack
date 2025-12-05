import { ApplicationConfig, provideZoneChangeDetection, ErrorHandler } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from './environments/environment';
import { routes } from './app.routes';
import { GlobalErrorHandler } from './error-handler';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // Gestionnaire d'erreurs global
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

    // Initialize Firebase App using environment config
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // Firebase Authentication
    provideAuth(() => getAuth()),

    // HTTP Client
    provideHttpClient(withFetch()),
  ],
};
