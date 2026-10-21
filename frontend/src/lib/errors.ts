import { isAxiosError } from 'axios';

/**
 * Message d'erreur affichable pour une erreur d'appel API.
 * Le backend répond {status, error, message, ...} en français ; on reprend « message ».
 * Sans réponse (réseau coupé, serveur arrêté), on le dit explicitement.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Une erreur est survenue. Veuillez réessayer.'): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.';
    }
    const data: unknown = error.response.data;
    if (typeof data === 'string' && data.trim()) {
      return data;
    }
    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }
  }
  return fallback;
}
