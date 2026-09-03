<template>
  <button
    type="button"
    class="bookmark-btn"
    :class="{ 'is-bookmarked': bookmarked }"
    :aria-pressed="bookmarked ? 'true' : 'false'"
    :aria-label="label"
    :title="label"
    :disabled="pending"
    @click="toggle"
  >
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"
        :fill="bookmarked ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<script setup>
import { computed, ref } from 'vue';
import { api } from '../api';

const props = defineProps({
  itemType: { type: String, required: true },
  itemId: { type: String, required: true },
  itemLabel: { type: String, default: '' },
  bookmarked: { type: Boolean, default: false },
});

const emit = defineEmits(['update:bookmarked', 'error']);

const pending = ref(false);

const label = computed(() => {
  const name = props.itemLabel || `${props.itemType} item`;
  return props.bookmarked ? `Remove bookmark for ${name}` : `Bookmark ${name}`;
});

async function toggle() {
  if (pending.value) {
    return;
  }

  pending.value = true;
  try {
    if (props.bookmarked) {
      await api.removeBookmark(props.itemType, props.itemId);
      emit('update:bookmarked', false);
    } else {
      await api.createBookmark(props.itemType, props.itemId);
      emit('update:bookmarked', true);
    }
  } catch (error) {
    emit('error', error.message);
  } finally {
    pending.value = false;
  }
}
</script>
