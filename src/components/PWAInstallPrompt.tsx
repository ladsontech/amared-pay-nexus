import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { installPWA } from '@/utils/pwa';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA] App is already installed, skipping install prompt');
      return;
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Don't show again if dismissed within the last 7 days
      if (daysSinceDismissed < 7) {
        console.log('[PWA] Install prompt was dismissed recently, skipping');
        return;
      } else {
        // Clear old dismissal after 7 days
        localStorage.removeItem('pwa-install-dismissed');
        console.log('[PWA] Old dismissal cleared, can show prompt again');
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA] beforeinstallprompt event fired');
      e.preventDefault();
      const promptEvent = e as any;
      setDeferredPrompt(promptEvent);
      (window as any).deferredPrompt = promptEvent;
      
      // Show prompt after a delay to improve UX
      setTimeout(() => {
        setShowPrompt(true);
        console.log('[PWA] Showing install prompt');
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also check for existing deferred prompt (in case event already fired before this component mounted)
    if ((window as any).deferredPrompt) {
      console.log('[PWA] Found existing deferred prompt');
      setDeferredPrompt((window as any).deferredPrompt);
      setTimeout(() => {
        setShowPrompt(true);
        console.log('[PWA] Showing install prompt from existing deferred prompt');
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    // Store deferred prompt globally for install function
    if (deferredPrompt) {
      (window as any).deferredPrompt = deferredPrompt;
    }
  }, [deferredPrompt]);

  const handleInstall = async () => {
    const installed = await installPWA();
    if (installed) {
      setShowPrompt(false);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal in localStorage to avoid showing again for a while
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Install Alma Pay</CardTitle>
                <CardDescription className="text-sm">
                  Install our app for a better experience
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Get faster access, offline support, and push notifications by installing Alma Pay on your device.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                className="flex-1"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Install Now
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
              >
                Not Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

