<template>
  <button
    type="button"
    class="bookmark-btn"
    :class="{ active: bookmarked }"
    :aria-pressed="bookmarked"
    :aria-label="label"
    :title="label"
    :disabled="loading || !isLoggedIn"
    @click="toggle"
  >
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      :fill="bookmarked ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        d="M6 3h12a1 1 0 0 1 1 1v16.2a.8.8 0 0 1-1.24.67L12 16.5l-5.76 4.37A.8.8 0 0 1 5 20.2V4a1 1 0 0 1 1-1z"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { api } from '../api';
import { useAuth } from '../auth';

const props = defineProps({
  entityType: {
    type: String,
    required: true,
  },
  entityId: {
    type: String,
    required: true,
  },
  bookmarkId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['bookmarked', 'unbookmarked', 'error']);

const auth = useAuth();
const isLoggedIn = computed(() => Boolean(auth.token));
const loading = ref(false);
const localBookmarkId = ref(props.bookmarkId);
const bookmarked = computed(() => Boolean(localBookmarkId.value));

watch(
  () => props.bookmarkId,
  (value) => {
    localBookmarkId.value = value;
  }
);

const label = computed(() => {
  if (!isLoggedIn.value) {
    return 'Log in to bookmark this item';
  }
  return bookmarked.value ? 'Remove bookmark' : 'Add bookmark';
});

async function toggle() {
  if (!isLoggedIn.value || loading.value) {
    return;
  }

  loading.value = true;
  try {
    if (bookmarked.value) {
      await api.deleteBookmark(localBookmarkId.value);
      localBookmarkId.value = null;
      emit('unbookmarked');
    } else {
      const created = await api.createBookmark(props.entityType, props.entityId);
      localBookmarkId.value = created.id;
      emit('bookmarked', created);
    }
  } catch (error) {
    emit('error', error.message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.bookmark-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--white);
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  transition: color 0.15s, border-color 0.15s, opacity 0.15s;
}

.bookmark-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}

.bookmark-btn.active {
  border-color: var(--primary);
  color: var(--primary);
}

.bookmark-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
