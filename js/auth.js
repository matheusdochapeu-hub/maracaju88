// ============================================================
//  MARACAJU - AUTENTICAÇÃO, SENHAS & BIOMETRIA DO CELULAR
//  Uso exclusivo de Matheus e Scarlet
// ============================================================

import { AUTHORIZED_USERS_LIST } from './config.js';

const AUTH_STORAGE_KEY = 'MARACAJU_AUTH_USER_v2';
const CREDENTIALS_STORAGE_KEY = 'MARACAJU_CREDENTIALS_v2';
const LEGACY_AUTH_STORAGE_KEY = 'MARACAJU_AUTH_USER_v1';

export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

export function syncHash(str) {
  let hash = 5381;
  const s = String(str || '') + '_maracaju_salt_2026';
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash) + s.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

let inMemoryCreds = null;
let inMemorySession = null;

export function getStoredCredentials() {
  try {
    if (typeof localStorage === 'undefined') {
      return inMemoryCreds || defaultCredentials();
    }
    const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (!raw) return defaultCredentials();
    return JSON.parse(raw);
  } catch (err) {
    return inMemoryCreds || defaultCredentials();
  }
}

function defaultCredentials() {
  return {
    users: {
      matheus: {
        passwordHash: syncHash('1234'),
        hasCustomPassword: false
      },
      scarlet: {
        passwordHash: syncHash('1234'),
        hasCustomPassword: false
      }
    },
    biometricsEnabled: true
  };
}

export function saveStoredCredentials(creds) {
  try {
    inMemoryCreds = creds;
    if (typeof localStorage === 'undefined') return true;
    localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(creds));
    return true;
  } catch (err) {
    return false;
  }
}

export function setUserPassword(userId, newPassword) {
  const cleanPass = String(newPassword || '').trim();
  if (cleanPass.length < 4) {
    throw new Error('A senha deve ter pelo menos 4 caracteres.');
  }
  const uId = userId === 'scarlet' || userId === 'esposa' ? 'scarlet' : 'matheus';
  const creds = getStoredCredentials();
  if (!creds.users) creds.users = {};
  creds.users[uId] = {
    passwordHash: syncHash(cleanPass),
    hasCustomPassword: true
  };
  saveStoredCredentials(creds);
  return true;
}

export function verifyUserPassword(userId, inputPassword) {
  const uId = userId === 'scarlet' || userId === 'esposa' ? 'scarlet' : 'matheus';
  const creds = getStoredCredentials();
  const userCred = (creds.users && creds.users[uId]) || { passwordHash: syncHash('1234') };
  const inputHash = syncHash(String(inputPassword || '').trim());
  return userCred.passwordHash === inputHash;
}

export function isBiometricsEnabled() {
  const creds = getStoredCredentials();
  return creds.biometricsEnabled !== false;
}

export function setBiometricsEnabled(enabled) {
  const creds = getStoredCredentials();
  creds.biometricsEnabled = !!enabled;
  saveStoredCredentials(creds);
  return creds.biometricsEnabled;
}

export async function isBiometricsSupported() {
  try {
    if (typeof window === 'undefined') return false;
    if (!window.PublicKeyCredential) return false;
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function') {
      return false;
    }
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (err) {
    return false;
  }
}

export async function authenticateWithBiometrics(userId = 'matheus') {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    throw new Error('Biometria não suportada neste navegador.');
  }

  const user = findAuthorizedUser(userId);
  if (!user) throw new Error('Usuário não encontrado.');

  const challenge = new Uint8Array(32);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(challenge);
  }

  try {
    // Tenta obter credencial existente ou assert via WebAuthn
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'preferred',
        rpId: window.location.hostname || 'localhost'
      }
    });

    if (assertion) {
      setAuthSession(user);
      return { success: true, user };
    }
  } catch (err) {
    // Se o dispositivo ainda não registrou credencial de chave pública,
    // tenta criar uma credencial rápida atada ao biometria do celular
    try {
      const creation = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'Maracaju' },
          user: {
            id: new TextEncoder().encode(user.id),
            name: user.email,
            displayName: user.name
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred'
          },
          timeout: 60000
        }
      });
      if (creation) {
        setAuthSession(user);
        return { success: true, user };
      }
    } catch (createErr) {
      throw new Error('Desbloqueio biométrico cancelado ou não concluído.');
    }
  }

  throw new Error('Não foi possível autenticar por biometria.');
}

export function findAuthorizedUser(identifier) {
  const normalized = normalizeEmail(identifier);
  if (!normalized) return null;

  for (const user of AUTHORIZED_USERS_LIST) {
    if (user.id.toLowerCase() === normalized) return user;
    if (normalizeEmail(user.email) === normalized) return user;
    if (Array.isArray(user.aliases)) {
      for (const alias of user.aliases) {
        if (normalizeEmail(alias) === normalized) return user;
      }
    }
  }

  return null;
}

export function getAuthSession() {
  try {
    if (typeof localStorage === 'undefined') {
      return inMemorySession;
    }
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);
    if (!raw) return inMemorySession;
    const session = JSON.parse(raw);
    if (!session || (!session.email && !session.id)) return null;

    const user = findAuthorizedUser(session.email || session.id);
    if (!user) {
      clearAuthSession();
      return null;
    }

    return {
      ...user,
      loggedAt: session.loggedAt || new Date().toISOString()
    };
  } catch (err) {
    return inMemorySession;
  }
}

export function setAuthSession(user) {
  try {
    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarEmoji: user.avatarEmoji,
      loggedAt: new Date().toISOString()
    };
    inMemorySession = { ...user, loggedAt: sessionData.loggedAt };
    if (typeof localStorage === 'undefined') return true;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    return true;
  } catch (err) {
    return false;
  }
}

export function clearAuthSession() {
  try {
    inMemorySession = null;
    if (typeof localStorage === 'undefined') return true;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    return true;
  } catch (err) {
    return false;
  }
}

export function loginWithCredentials(userIdentifier, password) {
  const user = findAuthorizedUser(userIdentifier);
  if (!user) {
    return {
      success: false,
      error: 'Morador não autorizado. Uso exclusivo de Matheus e Scarlet.'
    };
  }

  if (password !== undefined && password !== null && password !== '') {
    const ok = verifyUserPassword(user.id, password);
    if (!ok) {
      return {
        success: false,
        error: 'Senha incorreta. Tente novamente ou use a senha padrão 1234.'
      };
    }
  }

  setAuthSession(user);
  return { success: true, user };
}

export function loginWithEmail(inputEmail) {
  return loginWithCredentials(inputEmail);
}
