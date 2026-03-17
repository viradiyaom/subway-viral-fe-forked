import { useState, useCallback } from "react";

/** Returns true if the platform likely supports biometric auth via WebAuthn */
function detectBiometricSupport(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof navigator.credentials?.get === "function"
  );
}

/** Generate a random challenge buffer (normally comes from server) */
function generateChallenge(): Uint8Array {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return arr;
}

/**
 * Returns a base64url user id consistent within this browser origin.
 * Stored in localStorage so the same "user" is used across sessions.
 */
function getUserId(): Uint8Array {
  const stored = localStorage.getItem("subway_analytics_user_id");
  if (stored) {
    const decoded = atob(stored);
    return new Uint8Array([...decoded].map((c) => c.charCodeAt(0)));
  }
  const id = new Uint8Array(16);
  crypto.getRandomValues(id);
  localStorage.setItem(
    "subway_analytics_user_id",
    btoa(String.fromCharCode(...id)),
  );
  return id;
}

export type BiometricStatus = "idle" | "authenticating" | "success" | "error";

export interface UseBiometricReturn {
  isSupported: boolean;
  status: BiometricStatus;
  error: string | null;
  /** Register a passkey credential (first-time setup) */
  register: () => Promise<boolean>;
  /** Authenticate with an existing passkey */
  authenticate: () => Promise<boolean>;
  /** Whether a credential has been registered on this device */
  isRegistered: boolean;
  reset: () => void;
}

const CREDENTIAL_ID_KEY = "subway_analytics_credential_id";

export function useBiometric(): UseBiometricReturn {
  const isSupported = detectBiometricSupport();
  const [status, setStatus] = useState<BiometricStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(
    () => !!localStorage.getItem(CREDENTIAL_ID_KEY),
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  /** Step 1: Create a new passkey credential on this device */
  const register = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setStatus("authenticating");
    setError(null);
    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: generateChallenge(),
          rp: { name: "Subway Analytics", id: window.location.hostname },
          user: {
            id: getUserId(),
            name: "analyst@subway-analytics.local",
            displayName: "Analytics User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
          attestation: "none",
        },
      } as CredentialCreationOptions);

      if (!credential) throw new Error("No credential returned");

      // Persist credential id so we can use it for future authenticate() calls
      localStorage.setItem(
        CREDENTIAL_ID_KEY,
        btoa(
          String.fromCharCode(
            ...new Uint8Array((credential as PublicKeyCredential).rawId),
          ),
        ),
      );

      setStatus("success");
      setIsRegistered(true);
      return true;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Biometric registration failed";
      if (msg.includes("cancelled") || msg.includes("NotAllowedError")) {
        setError("Biometric prompt was dismissed. Please try again.");
      } else {
        setError(msg);
      }
      setStatus("error");
      return false;
    }
  }, [isSupported]);

  /** Step 2: Use saved passkey to authenticate */
  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setStatus("authenticating");
    setError(null);

    const storedId = localStorage.getItem(CREDENTIAL_ID_KEY);

    const allowCredentials: PublicKeyCredentialDescriptor[] = storedId
      ? [
          {
            type: "public-key",
            id: Uint8Array.from(atob(storedId), (c) => c.charCodeAt(0)),
            transports: ["internal"] as AuthenticatorTransport[],
          },
        ]
      : [];

    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: generateChallenge(),
          allowCredentials,
          userVerification: "required",
          timeout: 60000,
          rpId: window.location.hostname,
        },
      } as CredentialRequestOptions);

      if (!assertion) throw new Error("Authentication failed");

      setStatus("success");
      return true;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Biometric authentication failed";
      if (
        msg.toLowerCase().includes("not allowed") ||
        msg.toLowerCase().includes("cancelled")
      ) {
        setError("Biometric prompt was dismissed. Please try again.");
      } else {
        setError(msg);
      }
      setStatus("error");
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    status,
    error,
    register,
    authenticate,
    isRegistered,
    reset,
  };
}
