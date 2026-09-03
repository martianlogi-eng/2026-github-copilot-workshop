import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BookmarksPage from './BookmarksPage.vue';
import { clearSession, setSession } from '../auth';

vi.mock('../api', () => ({
  api: {
    listBookmarks: vi.fn(),
    deleteBookmark: vi.fn(),
  },
}));

import { api } from '../api';

async function mountPage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  });
  const wrapper = mount(BookmarksPage, {
    global: { plugins: [router] },
  });
  await router.isReady();
  return wrapper;
}

afterEach(() => {
  clearSession();
  vi.clearAllMocks();
});

describe('BookmarksPage', () => {
  it('prompts login when no user is signed in', async () => {
    const wrapper = await mountPage();

    expect(wrapper.text()).toContain('Please');
    expect(wrapper.text()).toContain('log in');
    expect(api.listBookmarks).not.toHaveBeenCalled();
  });

  it('shows an empty state when the user has no bookmarks', async () => {
    setSession('token-1', { id: 'user-1', username: 'sari', displayName: 'Sari Lestari' });
    api.listBookmarks.mockResolvedValue({ items: [] });

    const wrapper = await mountPage();
    await Promise.resolve();
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("haven't bookmarked");
  });

  it('lists bookmarks and removes one on click', async () => {
    setSession('token-1', { id: 'user-1', username: 'sari', displayName: 'Sari Lestari' });
    api.listBookmarks.mockResolvedValue({
      items: [
        {
          id: 'bm-1',
          entityType: 'PR',
          entityId: 'pr-1',
          entityNumber: 'PR-2026-0001',
          entityLabel: 'Spare parts',
          entityStatus: 'APPROVED',
          detailRoute: '/requisitions/pr-1',
        },
      ],
    });
    api.deleteBookmark.mockResolvedValue(null);

    const wrapper = await mountPage();
    await Promise.resolve();
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('PR-2026-0001');

    await wrapper.get('.btn-danger-icon').trigger('click');
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    expect(api.deleteBookmark).toHaveBeenCalledWith('bm-1');
    expect(wrapper.text()).toContain("haven't bookmarked");
  });

  it('shows an error message when loading fails', async () => {
    setSession('token-1', { id: 'user-1', username: 'sari', displayName: 'Sari Lestari' });
    api.listBookmarks.mockRejectedValue(new Error('Network error'));

    const wrapper = await mountPage();
    await Promise.resolve();
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Network error');
  });
});
