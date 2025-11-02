// PWA Utilities for Alma Pay

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[PWA] Service Worker registered:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('[PWA] New service worker available');
            // You can dispatch a custom event here to show update notification
            window.dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Request periodic background sync
 */
export async function requestPeriodicSync(tag: string, minInterval: number): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PeriodicBackgroundSync' in window)) {
    console.warn('Periodic Background Sync is not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if ('periodicSync' in registration) {
      // @ts-ignore - PeriodicBackgroundSync API
      const status = await registration.periodicSync.register(tag, {
        minInterval: minInterval
      });
      console.log('[PWA] Periodic sync registered:', tag);
      return true;
    }
  } catch (error) {
    console.error('[PWA] Periodic sync registration failed:', error);
    return false;
  }

  return false;
}

/**
 * Request background sync
 */
export async function requestBackgroundSync(tag: string = 'sync-pending-requests'): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
    console.warn('Background Sync is not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
    console.log('[PWA] Background sync requested:', tag);
    return true;
  } catch (error) {
    console.error('[PWA] Background sync registration failed:', error);
    return false;
  }
}

/**
 * Request push notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications are not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  console.log('[PWA] Notification permission:', permission);
  return permission;
}

/**
 * Show notification
 */
export function showNotification(title: string, options?: NotificationOptions): void {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/images/Almaredpay_logo.png',
      badge: '/images/Almaredpay_logo.png',
      ...options
    });
  }
}

/**
 * Check if app is installable
 */
export function isInstallable(): boolean {
  // Check if the app is already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return false;
  }

  // Check if browser supports installation
  return 'BeforeInstallPromptEvent' in window;
}

/**
 * Install the PWA
 */
export async function installPWA(): Promise<boolean> {
  // This will be set by the beforeinstallprompt event handler
  const deferredPrompt = (window as any).deferredPrompt;
  
  if (!deferredPrompt) {
    console.warn('[PWA] Installation prompt not available');
    return false;
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted installation');
      return true;
    } else {
      console.log('[PWA] User dismissed installation');
      return false;
    }
  } catch (error) {
    console.error('[PWA] Installation failed:', error);
    return false;
  } finally {
    (window as any).deferredPrompt = null;
  }
}

/**
 * Check if app is running as PWA
 */
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Get app version from service worker
 */
export async function getAppVersion(): Promise<string | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const cache = await caches.open('alma-pay-v1');
    // In a real app, you might store version info in cache
    return '1.0.0';
  } catch (error) {
    console.error('[PWA] Failed to get app version:', error);
    return null;
  }
}

/**
 * Clear all caches (useful for testing or reset)
 */
export async function clearAllCaches(): Promise<void> {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => caches.delete(cacheName))
    );
    console.log('[PWA] All caches cleared');
  } catch (error) {
    console.error('[PWA] Failed to clear caches:', error);
  }
}

/**
 * Send message to service worker
 */
export async function sendMessageToSW(message: any): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration.active) {
      registration.active.postMessage(message);
    }
  } catch (error) {
    console.error('[PWA] Failed to send message to service worker:', error);
  }
}

