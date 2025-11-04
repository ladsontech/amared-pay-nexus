/**
 * Centralized API helper for handling token expiration
 * Automatically logs out users when tokens expire (401/403 responses)
 */

let isLoggingOut = false;
let logoutCallback: (() => Promise<void>) | null = null;

/**
 * Set the logout callback function (called from AuthContext)
 */
export function setLogoutCallback(callback: () => Promise<void>): void {
  logoutCallback = callback;
}

/**
 * Check if a response indicates token expiration and handle logout
 */
export async function handleTokenExpiration(response: Response): Promise<boolean> {
  // Only handle 401 (Unauthorized) as token expiration
  // 403 might be permission issues, not necessarily token expiration
  if (response.status === 401) {
    // Prevent multiple simultaneous logout attempts
    if (isLoggingOut) {
      return true;
    }

    isLoggingOut = true;

    try {
      // Clear all authentication data immediately
      localStorage.removeItem("auth_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("impersonating");
      localStorage.removeItem("original_admin");
      localStorage.removeItem("username");
      localStorage.removeItem("password");

      // Call the logout callback if available (from AuthContext)
      if (logoutCallback) {
        try {
          await logoutCallback();
        } catch (error) {
          console.error('Error calling logout callback:', error);
        }
      }

      // Redirect to login page
      // Use window.location to ensure a full page reload and clear any state
      const currentPath = window.location.pathname;
      const loginPath = '/login';
      
      // Only redirect if not already on login page
      if (currentPath !== loginPath && !currentPath.startsWith(loginPath)) {
        // Store the intended destination for redirect after login
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        
        // Small delay to allow state to clear, then redirect
        setTimeout(() => {
          window.location.href = loginPath;
        }, 100);
      }

      return true; // Token expired, handled
    } catch (error) {
      console.error('Error during automatic logout:', error);
      // Force redirect even if error occurs
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return true; // Still return true to prevent further processing
    } finally {
      // Reset flag after a short delay to allow redirect
      setTimeout(() => {
        isLoggingOut = false;
      }, 2000);
    }
  }

  return false; // Token not expired
}

/**
 * Wrapper for fetch that automatically handles token expiration
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, options);

  // Check for token expiration
  if (response.status === 401 || response.status === 403) {
    await handleTokenExpiration(response);
    // Return the response anyway so calling code can handle it if needed
    // But the user will be logged out and redirected
  }

  return response;
}

/**
 * Reset the logging out flag (useful for testing or manual reset)
 */
export function resetLoggingOutFlag(): void {
  isLoggingOut = false;
}

