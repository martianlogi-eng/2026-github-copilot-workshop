import { reactive, readonly } from 'vue';

const STORAGE_KEY = 'auth';

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const stored = loadStored();

const state = reactive({
  token: stored?.token || null,
  user: stored?.user || null,
});

function persist() {
  if (state.token && state.user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: state.token, user: state.user }));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function setSession(token, user) {
  state.token = token;
  state.user = user;
  persist();
}

export function clearSession() {
  state.token = null;
  state.user = null;
  persist();
}

export function useAuth() {
  return readonly(state);
}

export function getToken() {
  return state.token;
}
