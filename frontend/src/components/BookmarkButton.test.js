import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BookmarkButton from './BookmarkButton.vue';
import { api } from '../api';

vi.mock('../api', () => ({
  api: {
    createBookmark: vi.fn(),
    removeBookmark: vi.fn(),
  },
}));

function mountButton(props = {}) {
  return mount(BookmarkButton, {
    props: {
      itemType: 'PR',
      itemId: 'pr-1',
      itemLabel: 'PR-2026-0001',
      bookmarked: false,
      ...props,
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('BookmarkButton', () => {
  it('labels the unbookmarked state', () => {
    const wrapper = mountButton();

    expect(wrapper.get('button').attributes('aria-pressed')).toBe('false');
    expect(wrapper.get('button').attributes('aria-label')).toBe('Bookmark PR-2026-0001');
  });

  it('labels the bookmarked state', () => {
    const wrapper = mountButton({ bookmarked: true });

    expect(wrapper.get('button').attributes('aria-pressed')).toBe('true');
    expect(wrapper.get('button').attributes('aria-label')).toBe(
      'Remove bookmark for PR-2026-0001'
    );
  });

  it('creates a bookmark and emits the new state', async () => {
    api.createBookmark.mockResolvedValue({ id: 'bookmark-1' });
    const wrapper = mountButton();

    await wrapper.get('button').trigger('click');
    await Promise.resolve();

    expect(api.createBookmark).toHaveBeenCalledWith('PR', 'pr-1');
    expect(wrapper.emitted('update:bookmarked')[0]).toEqual([true]);
  });

  it('removes a bookmark and emits the new state', async () => {
    api.removeBookmark.mockResolvedValue({ removed: true });
    const wrapper = mountButton({ bookmarked: true });

    await wrapper.get('button').trigger('click');
    await Promise.resolve();

    expect(api.removeBookmark).toHaveBeenCalledWith('PR', 'pr-1');
    expect(wrapper.emitted('update:bookmarked')[0]).toEqual([false]);
  });

  it('emits the error message when the request fails', async () => {
    api.createBookmark.mockRejectedValue(new Error('Request failed: 500'));
    const wrapper = mountButton();

    await wrapper.get('button').trigger('click');
    await Promise.resolve();

    expect(wrapper.emitted('error')[0]).toEqual(['Request failed: 500']);
    expect(wrapper.emitted('update:bookmarked')).toBeUndefined();
  });
});
