import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BookmarksPage from './BookmarksPage.vue';
import { api } from '../api';

vi.mock('../api', () => ({
  api: {
    listBookmarks: vi.fn(),
    removeBookmark: vi.fn(),
  },
}));

async function mountPage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/requisitions/:id', component: { template: '<div />' } },
      { path: '/bookmarks', component: BookmarksPage },
    ],
  });
  await router.push('/bookmarks');
  await router.isReady();

  const wrapper = mount(BookmarksPage, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('BookmarksPage', () => {
  it('renders bookmarks of every item type', async () => {
    api.listBookmarks.mockResolvedValue({
      items: [
        {
          id: 'bookmark-1',
          itemType: 'PR',
          itemId: 'pr-1',
          itemNumber: 'PR-2026-0001',
          itemTitle: 'Monthly MRO replenishment',
          itemStatus: 'APPROVED',
          createdAt: '2026-01-02T10:00:00.000Z',
        },
        {
          id: 'bookmark-2',
          itemType: 'GR',
          itemId: 'gr-1',
          itemNumber: 'GR-2026-0001',
          itemTitle: null,
          itemStatus: 'POSTED',
          createdAt: '2026-01-01T10:00:00.000Z',
        },
      ],
    });

    const wrapper = await mountPage();

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    expect(wrapper.text()).toContain('PR-2026-0001');
    expect(wrapper.text()).toContain('GR-2026-0001');
    expect(wrapper.get('tbody tr a').attributes('href')).toBe('/requisitions/pr-1');
  });

  it('shows an empty state when there are no bookmarks', async () => {
    api.listBookmarks.mockResolvedValue({ items: [] });

    const wrapper = await mountPage();

    expect(wrapper.text()).toContain('No bookmarks yet.');
  });

  it('shows an error when loading fails', async () => {
    api.listBookmarks.mockRejectedValue(new Error('Request failed: 500'));

    const wrapper = await mountPage();

    expect(wrapper.get('.error').text()).toBe('Request failed: 500');
  });

  it('removes a bookmark from the list', async () => {
    api.listBookmarks.mockResolvedValue({
      items: [
        {
          id: 'bookmark-1',
          itemType: 'PR',
          itemId: 'pr-1',
          itemNumber: 'PR-2026-0001',
          itemTitle: 'Monthly MRO replenishment',
          itemStatus: 'APPROVED',
          createdAt: '2026-01-02T10:00:00.000Z',
        },
      ],
    });
    api.removeBookmark.mockResolvedValue({ removed: true });

    const wrapper = await mountPage();
    await wrapper.get('.bookmark-btn').trigger('click');
    await flushPromises();

    expect(api.removeBookmark).toHaveBeenCalledWith('PR', 'pr-1');
    expect(wrapper.text()).toContain('No bookmarks yet.');
  });
});
