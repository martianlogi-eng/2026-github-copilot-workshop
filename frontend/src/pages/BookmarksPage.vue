<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/" class="back-btn" title="Back to Dashboard">&#8592;</RouterLink>
        <div>
          <h2>Bookmarks</h2>
          <p class="muted">Your bookmarked PR, PO and GR items</p>
        </div>
      </div>
    </div>

    <p v-if="!isLoggedIn" class="muted">
      Please <RouterLink to="/login">log in</RouterLink> to see your bookmarks.
    </p>

    <template v-else>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <div class="card-panel">
        <p v-if="loading" class="muted">Loading bookmarks...</p>
        <p v-else-if="items.length === 0" class="muted">You haven't bookmarked anything yet.</p>
        <table v-else>
          <thead>
            <tr>
              <th>Type</th>
              <th>Number</th>
              <th>Details</th>
              <th>Status</th>
              <th style="width:60px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td><span class="status-badge type-badge" :class="item.entityType.toLowerCase()">{{ item.entityType }}</span></td>
              <td>
                <RouterLink v-if="item.detailRoute" :to="item.detailRoute">{{ item.entityNumber }}</RouterLink>
                <span v-else>{{ item.entityNumber }}</span>
              </td>
              <td>{{ item.entityLabel || '-' }}</td>
              <td>
                <span v-if="item.entityStatus" class="status-badge" :class="item.entityStatus.toLowerCase()">{{ item.entityStatus }}</span>
                <span v-else>-</span>
              </td>
              <td>
                <button
                  type="button"
                  class="btn-danger-icon"
                  title="Remove bookmark"
                  aria-label="Remove bookmark"
                  :disabled="removingId === item.id"
                  @click="remove(item.id)"
                >
                  &times;
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '../api';
import { useAuth } from '../auth';

const auth = useAuth();
const isLoggedIn = computed(() => Boolean(auth.token));

const items = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const removingId = ref(null);

async function loadBookmarks() {
  if (!isLoggedIn.value) {
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  try {
    const payload = await api.listBookmarks();
    items.value = payload.items;
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
}

async function remove(id) {
  removingId.value = id;
  errorMessage.value = '';
  try {
    await api.deleteBookmark(id);
    items.value = items.value.filter((item) => item.id !== id);
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    removingId.value = null;
  }
}

onMounted(loadBookmarks);
</script>

<style scoped>
.type-badge {
  background: var(--table-header);
  color: var(--text);
}
</style>
