<template>
  <section>
    <div class="page-header">
      <div>
        <h2>Log in</h2>
        <p class="muted">Sign in with a demo username to manage your bookmarks</p>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div class="card-panel" style="max-width: 420px">
      <form @submit.prevent="handleSubmit">
        <div class="form-group full">
          <label for="username">Username</label>
          <input id="username" v-model="username" placeholder="e.g. sari" required />
        </div>
        <div class="btn-group" style="margin-top: 16px">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Log in' }}
          </button>
        </div>
      </form>
      <p class="muted" style="margin-top: 16px">Try the demo users: <strong>sari</strong> or <strong>budi</strong>.</p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import { setSession } from '../auth';

const router = useRouter();
const username = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function handleSubmit() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const { token, user } = await api.login(username.value);
    setSession(token, user);
    router.push('/bookmarks');
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
}
</script>
