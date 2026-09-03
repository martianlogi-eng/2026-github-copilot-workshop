<template>
  <div class="layout">
    <header class="navbar">
      <span class="navbar-brand">Procurement MVP</span>
      <nav>
        <RouterLink to="/" :class="{ active: isDashboard }">Dashboard</RouterLink>
        <RouterLink to="/requisitions" :class="{ active: isRequisitions }">Purchase Requisitions</RouterLink>
        <RouterLink to="/bookmarks" :class="{ active: isBookmarks }">Bookmarks</RouterLink>
      </nav>
      <button
        class="theme-toggle"
        type="button"
        :aria-pressed="isDarkMode"
        :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleTheme"
      >
        {{ isDarkMode ? 'Light mode' : 'Dark mode' }}
      </button>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

const route = useRoute();
const isDashboard = computed(() => route.path === '/');
const isRequisitions = computed(() => route.path.startsWith('/requisitions'));
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
</script>
