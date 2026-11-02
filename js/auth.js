// ============================================================
//  MARACAJU - AUTENTICAÇÃO & CONTROLE DE ACESSO
//  Uso exclusivo de Matheus e Scarlet
// ============================================================

import { AUTHORIZED_USERS_LIST } from './config.js';

const AUTH_STORAGE_KEY = 'MARACAJU_AUTH_USER_v1';
const LEGACY_AUTH_STORAGE_KEY = 'MARACAJU88_AUTH_USER_v1';

export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

export function findAuthorizedUser(inputEmail) {
  const normalized = normalizeEmail(inputEmail);
  if (!normalized) return null;

  for (const user of AUTHORIZED_USERS_LIST) {
    if (normalizeEmail(user.email) === normalized) {
      return user;
    }
    if (Array.isArray(user.aliases)) {
      for (const alias of user.aliases) {
        if (normalizeEmail(alias) === normalized) {
          return user;
        }
      }
    }
  }

  return null;
}

export function getAuthSession() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.email) return null;

    // Confere se o e-mail na sessão ainda está na lista de autorizados
    const user = findAuthorizedUser(session.email);
    if (!user) {
      clearAuthSession();
      return null;
    }

    return {
      ...user,
      loggedAt: session.loggedAt || new Date().toISOString()
    };
  } catch (err) {
    console.warn('[Auth] Erro ao ler sessão:', err);
    return null;
  }
}

export function setAuthSession(user) {
  try {
    if (typeof localStorage === 'undefined') return true;
    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarEmoji: user.avatarEmoji,
      loggedAt: new Date().toISOString()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    return true;
  } catch (err) {
    console.error('[Auth] Erro ao salvar sessão:', err);
    return false;
  }
}

export function clearAuthSession() {
  try {
    if (typeof localStorage === 'undefined') return true;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    return true;
  } catch (err) {
    return false;
  }
}

export function loginWithEmail(inputEmail) {
  const user = findAuthorizedUser(inputEmail);
  if (!user) {
    return {
      success: false,
      error: 'E-mail não autorizado. Apenas Matheus (matheusdochapeu@gmail.com) e Scarlet (scarletsantos7@gmail.com) têm permissão de acesso.'
    };
  }

  setAuthSession(user);
  return {
    success: true,
    user
  };
}
