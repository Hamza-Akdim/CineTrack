import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('🔴 ERREUR GLOBALE DÉTECTÉE:', {
      message: error.message,
      stack: error.stack,
      error: error
    });
    
    // Afficher aussi l'erreur dans le DOM pour debugging
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:10px;right:10px;background:red;color:white;padding:10px;z-index:9999;max-width:400px;border-radius:5px;';
    errorDiv.innerHTML = `
      <strong>❌ Erreur détectée:</strong><br>
      ${error.message || 'Erreur inconnue'}<br>
      <small>Voir la console pour plus de détails</small>
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      document.body.removeChild(errorDiv);
    }, 5000);
  }
}
