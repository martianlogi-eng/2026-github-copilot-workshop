<template>
  <div class="layout">
    <header class="navbar">
      <span class="navbar-brand">Procurement MVP</span>
      <nav>
        <RouterLink to="/" :class="{ active: isDashboard }">Dashboard</RouterLink>
        <RouterLink to="/requisitions" :class="{ active: isRequisitions }">Purchase Requisitions</RouterLink>
        <RouterLink to="/purchase-orders" :class="{ active: isPurchaseOrders }">Purchase Orders</RouterLink>
        <RouterLink to="/goods-receipts" :class="{ active: isGoodsReceipts }">Goods Receipts</RouterLink>
        <RouterLink to="/bookmarks" :class="{ active: isBookmarks }">Bookmarks</RouterLink>
      </nav>
      <div class="navbar-right">
        <span v-if="auth.user" class="muted">Hi, {{ auth.user.displayName }}</span>
        <button v-if="auth.user" type="button" class="theme-toggle" @click="handleLogout">Log out</button>
        <RouterLink v-else to="/login" class="nav-login-link">Log in</RouterLink>
        <button
          class="theme-toggle"
          type="button"
          :aria-pressed="isDarkMode"
          :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          {{ isDarkMode ? 'Light mode' : 'Dark mode' }}
        </button>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { clearSession, useAuth } from './auth';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const isDashboard = computed(() => route.path === '/');
const isRequisitions = computed(() => route.path.startsWith('/requisitions'));
const isPurchaseOrders = computed(() => route.path.startsWith('/purchase-orders'));
const isGoodsReceipts = computed(() => route.path.startsWith('/goods-receipts'));
const isBookmarks = computed(() => route.path.startsWith('/bookmarks'));
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');

function applyTheme() {
  document.documentElement.classList.toggle('dark-mode', isDarkMode.value);
}

applyTheme();

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
  applyTheme();
}

function handleLogout() {
  clearSession();
  router.push('/');
}
</script>
