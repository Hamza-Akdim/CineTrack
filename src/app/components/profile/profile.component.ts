import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AppLayoutComponent } from '../layout/app-layout.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AppLayoutComponent],
  template: `
    <app-layout>
      <div class="min-h-screen text-white pt-24 px-4 pb-12">
        <div class="max-w-2xl mx-auto space-y-8">
          
            <div class="flex flex-col items-center gap-4">
             <div class="relative group cursor-pointer" (click)="fileInput.click()">
                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold shadow-lg overflow-hidden relative">
                   <img *ngIf="user()?.photoURL" [src]="user()?.photoURL" class="w-full h-full object-cover" alt="Profile">
                   <span *ngIf="!user()?.photoURL">{{ user()?.displayName?.charAt(0) || user()?.email?.charAt(0) || 'U' | uppercase }}</span>
                   
                   <!-- Overlay on hover -->
                   <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span class="text-xs text-white font-medium">Modifier</span>
                   </div>
                </div>
                <!-- Hidden file input -->
                <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden">
             </div>
             
             <h1 class="text-3xl font-bold">{{ user()?.displayName || 'Utilisateur' }}</h1>
             <p class="text-gray-400">{{ user()?.email }}</p>
          </div>

          <div class="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
            <h2 class="text-xl font-bold border-b border-white/10 pb-4">Mes Informations</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-gray-400 mb-1">Nom d'affichage</label>
                <input 
                  type="text" 
                  [(ngModel)]="displayName" 
                  placeholder="Votre pseudo"
                  class="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition placeholder-gray-600"
                >
              </div>

              <div class="flex items-center justify-end">
                 <button 
                  (click)="updateProfile()"
                  [disabled]="isLoadingProfile"
                  class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                 >
                   <span *ngIf="isLoadingProfile">Cha...</span>
                   <span *ngIf="!isLoadingProfile">Enregistrer</span>
                 </button>
              </div>
              <p *ngIf="profileMessage" [class.text-green-500]="profileSuccess" [class.text-red-500]="!profileSuccess" class="text-sm text-right">
                {{ profileMessage }}
              </p>
            </div>
          </div>

          <div class="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
             <h2 class="text-xl font-bold border-b border-white/10 pb-4">Sécurité</h2>
             
             <div class="space-y-4">
                <div>
                   <label class="block text-sm text-gray-400 mb-1">Nouveau mot de passe</label>
                   <input 
                      type="password" 
                      [(ngModel)]="newPassword" 
                      placeholder="••••••••"
                      class="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition placeholder-gray-600"
                   >
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-1">Confirmer mot de passe</label>
                  <input 
                     type="password" 
                     [(ngModel)]="confirmPassword" 
                     placeholder="••••••••"
                     class="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition placeholder-gray-600"
                  >
               </div>

               <div class="flex items-center justify-end">
                  <button 
                   (click)="updatePassword()"
                   [disabled]="isLoadingPassword"
                   class="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center gap-2"
                  >
                   <span *ngIf="isLoadingPassword">Cha...</span>
                   <span *ngIf="!isLoadingPassword">Mettre à jour mot de passe</span>
                  </button>
               </div>
               <p *ngIf="passwordMessage" [class.text-green-500]="passwordSuccess" [class.text-red-500]="!passwordSuccess" class="text-sm text-right">
                 {{ passwordMessage }}
               </p>
             </div>
          </div>

          <div class="flex justify-center pt-8">
             <button (click)="logout()" class="text-gray-400 hover:text-white transition underline">
               Se déconnecter
             </button>
          </div>

        </div>
      </div>
    </app-layout>
  `
})
export class ProfileComponent {
  authService = inject(AuthService);
  router = inject(Router);
  user = this.authService.currentUser;

  displayName = this.user()?.displayName || '';

  newPassword = '';
  confirmPassword = '';

  isLoadingProfile = false;
  profileMessage = '';
  profileSuccess = false;

  isLoadingPassword = false;
  passwordMessage = '';
  passwordSuccess = false;

  constructor() {
    const u = this.user();
    if (u) {
      if (u.displayName) this.displayName = u.displayName;
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type.match(/image\/*/) == null) {
        this.profileMessage = "Seules les images sont supportées.";
        this.profileSuccess = false;
        return;
      }

      this.isLoadingProfile = true;
      this.profileMessage = "Traitement de l'image...";

      try {
        const base64 = await this.compressImage(file);

        this.profileMessage = "Sauvegarde...";
        this.authService.saveProfileImage(base64).subscribe({
          next: () => {
            this.isLoadingProfile = false;
            this.profileMessage = "Photo mise à jour avec succès !";
            this.profileSuccess = true;
          },
          error: (error: any) => {
            this.isLoadingProfile = false;
            this.profileMessage = "Erreur lors de la sauvegarde.";
            this.profileSuccess = false;
            console.error(error);
          }
        });
      } catch (e) {
        this.isLoadingProfile = false;
        this.profileMessage = "Erreur lors du traitement de l'image.";
        this.profileSuccess = false;
        console.error(e);
      }
    }
  }

  // Helper to compress image and convert to base64
  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 300; // Resize to max 300px to keep size low
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx!.drawImage(img, 0, 0, width, height);
          // Compress quality to 0.7
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }

  updateProfile() {
    if (!this.displayName.trim()) return;

    this.isLoadingProfile = true;
    this.profileMessage = '';

    this.authService.updateUserProfile(this.displayName).subscribe({
      next: () => {
        this.isLoadingProfile = false;
        this.profileMessage = 'Profil mis à jour avec succès.';
        this.profileSuccess = true;
      },
      error: (err) => {
        this.isLoadingProfile = false;
        this.profileMessage = 'Erreur lors de la mise à jour.';
        this.profileSuccess = false;
        console.error(err);
      }
    });
  }

  updatePassword() {
    if (!this.newPassword || this.newPassword.length < 6) {
      this.passwordMessage = 'Le mot de passe doit faire au moins 6 caractères.';
      this.passwordSuccess = false;
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMessage = 'Les mots de passe ne correspondent pas.';
      this.passwordSuccess = false;
      return;
    }

    this.isLoadingPassword = true;
    this.passwordMessage = '';

    this.authService.updateUserPassword(this.newPassword).subscribe({
      next: () => {
        this.isLoadingPassword = false;
        this.passwordMessage = 'Mot de passe modifié avec succès.';
        this.passwordSuccess = true;
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err: any) => {
        this.isLoadingPassword = false;
        this.passwordSuccess = false;
        console.error(err);
        if (err.code === 'auth/requires-recent-login') {
          this.passwordMessage = 'Veuillez vous reconnecter pour changer votre mot de passe.';
        } else {
          this.passwordMessage = 'Erreur lors du changement de mot de passe.';
        }
      }
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
