# Script de monitoring des logs CineTrack
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CINETRACK - MONITEUR DE LOGS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Ce terminal affiche tous les logs de l'application" -ForegroundColor Yellow
Write-Host "🔍 Ouvrez la console du navigateur pour voir les détails" -ForegroundColor Yellow
Write-Host ""
Write-Host "LÉGENDE DES SYMBOLES:" -ForegroundColor Green
Write-Host "  🚀 = Démarrage d'une action" -ForegroundColor White
Write-Host "  ✅ = Succès" -ForegroundColor Green
Write-Host "  ❌ = Erreur" -ForegroundColor Red  
Write-Host "  🔵 = Action utilisateur" -ForegroundColor Blue
Write-Host "  👤 = Changement état utilisateur" -ForegroundColor Magenta
Write-Host "  🛡️ = Guard (protection route)" -ForegroundColor Yellow
Write-Host "  🔄 = Navigation/Redirection" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Ouvrez http://localhost:4200 dans votre navigateur" -ForegroundColor White
Write-Host "2. Ouvrez la Console DevTools (F12 → Console)" -ForegroundColor White
Write-Host "3. Cliquez sur 'Continuer avec Google'" -ForegroundColor White
Write-Host "4. Observez les logs en temps réel ci-dessous:" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Garder le script actif
Write-Host "⏳ En attente d'actions utilisateur..." -ForegroundColor Yellow
Write-Host "   (Les logs apparaîtront dans la console du navigateur)" -ForegroundColor Gray
Write-Host ""

# Boucle infinie pour garder le terminal ouvert
while ($true) {
    Start-Sleep -Seconds 1
}
