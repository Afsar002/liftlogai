/* ------------------------------------------------------------------ */
/* wger Authentication Service                                        */
/* ------------------------------------------------------------------ */

export interface WgerUserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_staff: boolean;
  is_superuser: boolean;
  language: number;
  weight_unit: number;
  repetition_unit: number;
  theme: string;
}

export interface WgerTokenResponse {
  token: string;
  user: WgerUserProfile;
}

/* ------------------------------------------------------------------ */
/* Configuration                                                      */
/* ------------------------------------------------------------------ */

const WGER_BASE_URL = "https://wger.de/api/v2";
const TOKEN_STORAGE_KEY = "liftlog_wger_token";
const USER_STORAGE_KEY = "liftlog_wger_user";

/* ------------------------------------------------------------------ */
/* Token Management                                                   */
/* ------------------------------------------------------------------ */

/**
 * Stores the wger access token and user profile.
 */
export function setWgerAuth(token: string, user: WgerUserProfile): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch { }
}

/**
 * Gets the stored wger access token.
 */
export function getWgerToken(): string | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Gets the stored wger user profile.
 */
export function getWgerUser(): WgerUserProfile | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WgerUserProfile;
  } catch {
    return null;
  }
}

/**
 * Checks if user is authenticated with wger.
 */
export function isWgerAuthenticated(): boolean {
  return !!getWgerToken();
}

/**
 * Clears wger authentication.
 */
export function clearWgerAuth(): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch { }
}

/* ------------------------------------------------------------------ */
/* Authentication Flows                                               */
/* ------------------------------------------------------------------ */

/**
 * Exchanges username/password for an API token.
 * Uses wger's token auth endpoint.
 */
export async function loginWithCredentials(
  username: string,
  password: string
): Promise<{ token: string; user: WgerUserProfile } | null> {
  try {
    const response = await fetch(`${WGER_BASE_URL}/token/`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("[WgerAuthService] Login failed:", error);
      return null;
    }

    const data: WgerTokenResponse = await response.json();
    setWgerAuth(data.token, data.user);
    return { token: data.token, user: data.user };
  } catch (error) {
    console.error("[WgerAuthService] Login error:", error);
    return null;
  }
}

/**
 * Registers a new user on wger and logs them in.
 */
export async function registerAndLogin(
  username: string,
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ token: string; user: WgerUserProfile } | null> {
  try {
    // First, register the user
    const registerResponse = await fetch(`${WGER_BASE_URL}/user/register/`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.json().catch(() => ({}));
      console.error("[WgerAuthService] Registration failed:", error);
      return null;
    }

    // Then log in with the credentials
    return loginWithCredentials(username, password);
  } catch (error) {
    console.error("[WgerAuthService] Registration error:", error);
    return null;
  }
}

/**
 * Validates the current token by fetching user profile.
 * Returns the user profile if valid, null if expired/invalid.
 */
export async function validateToken(): Promise<WgerUserProfile | null> {
  const token = getWgerToken();
  if (!token) return null;

  try {
    const response = await fetch(`${WGER_BASE_URL}/user/profile/`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Token ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearWgerAuth(); // Token expired
      }
      return null;
    }

    const user: WgerUserProfile = await response.json();
    // Update stored user profile
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      }
    } catch { }
    return user;
  } catch (error) {
    console.error("[WgerAuthService] Token validation failed:", error);
    return null;
  }
}

/**
 * Gets the authorization header for API requests.
 */
export function getAuthHeader(): Record<string, string> | null {
  const token = getWgerToken();
  if (!token) return null;
  return { "Authorization": `Token ${token}` };
}

/**
 * Creates a fetch options object with auth headers.
 */
export function withAuth(options: RequestInit = {}): RequestInit {
  const auth = getAuthHeader();
  if (!auth) return options;

  return {
    ...options,
    headers: {
      "Accept": "application/json",
      "Accept-Language": "en",
      ...options.headers,
      ...auth,
    },
  };
}

/* ------------------------------------------------------------------ */
/* OAuth / Social Login (Future)                                      */
/* ------------------------------------------------------------------ */

/**
 * Initiates OAuth flow with wger (if supported).
 * Currently wger doesn't support OAuth - only token auth.
 * This is a placeholder for future integration.
 */
export async function initiateOAuth(): Promise<string | null> {
  console.warn("[WgerAuthService] OAuth not supported by wger API");
  return null;
}

/**
 * Handles OAuth callback (placeholder).
 */
export async function handleOAuthCallback(code: string): Promise<{ token: string; user: WgerUserProfile } | null> {
  console.warn("[WgerAuthService] OAuth not supported by wger API");
  return null;
}