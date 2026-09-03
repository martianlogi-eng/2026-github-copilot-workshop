import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BookmarkButton from './BookmarkButton.vue';
import { clearSession, setSession } from '../auth';

vi.mock('../api', () => ({
  api: {
    createBookmark: vi.fn(),
    deleteBookmark: vi.fn(),
  },
}));

import { api } from '../api';

afterEach(() => {
  clearSession();
  vi.clearAllMocks();
});

describe('BookmarkButton', () => {
  it('is disabled and prompts login when no user is signed in', () => {
    const wrapper = mount(BookmarkButton, {
      props: { entityType: 'PR', entityId: 'pr-1' },
    });

    const button = wrapper.get('button');
    expect(button.attributes('disabled')).toBeDefined();
    expect(button.attributes('title')).toBe('Log in to bookmark this item');
  });

  it('creates a bookmark when clicked while logged out state is not bookmarked', async () => {
    setSession('token-1', { id: 'user-1', username: 'sari', displayName: 'Sari Lestari' });
    api.createBookmark.mockResolvedValue({ id: 'bm-1' });

    const wrapper = mount(BookmarkButton, {
      props: { entityType: 'PR', entityId: 'pr-1' },
    });

    await wrapper.get('button').trigger('click');
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    expect(api.createBookmark).toHaveBeenCalledWith('PR', 'pr-1');
    expect(wrapper.emitted('bookmarked')).toBeTruthy();
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('true');
  });

  it('removes an existing bookmark when clicked', async () => {
    setSession('token-1', { id: 'user-1', username: 'sari', displayName: 'Sari Lestari' });
    api.deleteBookmark.mockResolvedValue(null);

    const wrapper = mount(BookmarkButton, {
      props: { entityType: 'PR', entityId: 'pr-1', bookmarkId: 'bm-1' },
    });

    expect(wrapper.get('button').attributes('aria-pressed')).toBe('true');

    await wrapper.get('button').trigger('click');
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    expect(api.deleteBookmark).toHaveBeenCalledWith('bm-1');
    expect(wrapper.emitted('unbookmarked')).toBeTruthy();
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('false');
  });

  it('emits an error message when the API call fails', async () => {
    setSession('token-1', { id: 'user-1', username: 'sari', displayName: 'Sari Lestari' });
    api.createBookmark.mockRejectedValue(new Error('Item is already bookmarked'));

    const wrapper = mount(BookmarkButton, {
      props: { entityType: 'PR', entityId: 'pr-1' },
    });

    await wrapper.get('button').trigger('click');
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('error')?.[0]).toEqual(['Item is already bookmarked']);
  });
});
