<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/" class="back-btn" title="Back to Dashboard">&#8592;</RouterLink>
        <div>
          <h2>Purchase Orders</h2>
          <p class="muted">All purchase order records</p>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div class="card-panel">
      <table>
        <thead>
          <tr>
            <th style="width:44px"></th>
            <th>PO Number</th>
            <th>Vendor</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>
              <BookmarkButton
                entity-type="PO"
                :entity-id="item.id"
                :bookmark-id="bookmarkIds.get(item.id)"
                @bookmarked="(bm) => onBookmarked(item.id, bm)"
                @unbookmarked="() => onUnbookmarked(item.id)"
                @error="onBookmarkError"
              />
            </td>
            <td><RouterLink :to="`/purchase-orders/${item.id}`">{{ item.poNumber }}</RouterLink></td>
            <td>{{ item.vendorName }}</td>
            <td>
              <span class="status-badge" :class="item.status.toLowerCase()">{{ item.status }}</span>
            </td>
            <td>{{ item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '../api';
import { useAuth } from '../auth';
import BookmarkButton from '../components/BookmarkButton.vue';

const items = ref([]);
const errorMessage = ref('');
const bookmarkIds = ref(new Map());
const auth = useAuth();

function onBookmarked(entityId, bookmark) {
  bookmarkIds.value.set(entityId, bookmark.id);
}

function onUnbookmarked(entityId) {
  bookmarkIds.value.delete(entityId);
}

function onBookmarkError(message) {
  errorMessage.value = message;
}

async function loadBookmarkIds() {
  if (!auth.token) {
    return;
  }

  try {
    const payload = await api.listBookmarks();
    const map = new Map();
    payload.items
      .filter((bookmark) => bookmark.entityType === 'PO')
      .forEach((bookmark) => map.set(bookmark.entityId, bookmark.id));
    bookmarkIds.value = map;
  } catch (error) {
    errorMessage.value = error.message;
  }
}

onMounted(async () => {
  try {
    const payload = await api.listPurchaseOrders();
    items.value = payload.items;
  } catch (error) {
    errorMessage.value = error.message;
  }

  await loadBookmarkIds();
});
</script>
