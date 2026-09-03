<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/" class="back-btn" title="Back to Dashboard">&#8592;</RouterLink>
        <div>
          <h2>Bookmarks</h2>
          <p class="muted">Items you bookmarked from PR, PO, and GR lists</p>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div class="card-panel">
      <p v-if="isLoading" class="muted">Loading bookmarks...</p>
      <p v-else-if="items.length === 0" class="muted">No bookmarks yet.</p>
      <table v-else>
        <thead>
          <tr>
            <th>Type</th>
            <th>Number</th>
            <th>Title</th>
            <th>Status</th>
            <th>Bookmarked</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td><span class="status-badge type">{{ item.itemType }}</span></td>
            <td>
              <RouterLink v-if="detailPath(item)" :to="detailPath(item)">{{ item.itemNumber }}</RouterLink>
              <span v-else>{{ item.itemNumber }}</span>
            </td>
            <td>{{ item.itemTitle || '-' }}</td>
            <td>
              <span class="status-badge" :class="statusClass(item.itemStatus)">{{ item.itemStatus || '-' }}</span>
            </td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>
              <BookmarkButton
                :item-type="item.itemType"
                :item-id="item.itemId"
                :item-label="item.itemNumber"
                :bookmarked="true"
                @update:bookmarked="removeFromList(item)"
                @error="errorMessage = $event"
              />
            </td>
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
import BookmarkButton from '../components/BookmarkButton.vue';

const items = ref([]);
const errorMessage = ref('');
const isLoading = ref(true);

function detailPath(item) {
  if (item.itemType === 'PR') {
    return `/requisitions/${item.itemId}`;
  }

  return '';
}

function statusClass(status) {
  return status ? status.toLowerCase() : '';
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return String(value).slice(0, 10);
}

function removeFromList(removedItem) {
  items.value = items.value.filter((item) => item.id !== removedItem.id);
}

onMounted(async () => {
  try {
    const payload = await api.listBookmarks();
    items.value = payload.items;
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
});
</script>
