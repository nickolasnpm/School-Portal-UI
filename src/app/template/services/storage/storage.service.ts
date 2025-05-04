import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private isBrowser: boolean;
  private isLocalStorageAvailable: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
  }

  private checkLocalStorageAvailability(): boolean {
    return (
      this.isBrowser && typeof window !== 'undefined' && !!window.localStorage
    );
  }

  getItem(key: string): string | null {
    if (this.isLocalStorageAvailable) {
      return localStorage.getItem(key);
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (this.isLocalStorageAvailable) {
      localStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.isLocalStorageAvailable) {
      localStorage.removeItem(key);
    }
  }

  clearItems(): void {
    if (this.isLocalStorageAvailable) {
      localStorage.clear();
    } else {
      console.warn('localStorage is not available in this environment.');
    }
  }
}
