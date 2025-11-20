import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// console.log('🚀 APPLICATION CINETRACK - DÉMARRAGE');
// console.log('📋 Configuration Firebase:', {
//   apiKey: '***' + appConfig.providers ? 'configuré' : 'non configuré'
// });

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log(' Application Angular démarrée avec succès');
  })
  .catch((err) => {
    console.error(' ERREUR CRITIQUE AU DÉMARRAGE:', err);
  });
