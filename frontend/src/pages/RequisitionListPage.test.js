import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RequisitionListPage from './RequisitionListPage.vue';
import { api } from '../api';

vi.mock('../api', () => ({
  api: {
    listRequisitions: vi.fn(),
    createBookmark: vi.fn(),
    removeBookmark: vi.fn(),
  },
}));

async function mountPage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/requisitions', component: RequisitionListPage },
      { path: '/requisitions/new', component: { template: '<div />' } },
      { path: '/requisitions/:id', component: { template: '<div />' } },
    ],
  });
  await router.push('/requisitions');
  await router.isReady();

  const wrapper = mount(RequisitionListPage, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
}

beforeEach(() => {
  vi.clearAllMocks();
  api.listRequisitions.mockResolvedValue({
    items: [
      {
        id: 'pr-1',
        prNumber: 'PR-2026-0001',
        status: 'APPROVED',
        requesterName: 'Sari Lestari',
        departmentName: 'Maintenance',
        title: 'Monthly MRO replenishment',
        neededByDate: '2026-01-10',
        bookmarked: false,
      },
    ],
  });
});

describe('RequisitionListPage bookmarks', () => {
  it('renders a bookmark control for every requisition', async () => {
    const wrapper = await mountPage();

    const button = wrapper.get('tbody .bookmark-btn');
    expect(button.attributes('aria-pressed')).toBe('false');
    expect(button.attributes('aria-label')).toBe('Bookmark PR-2026-0001');
  });

  it('bookmarks a requisition and keeps the new state', async () => {
    api.createBookmark.mockResolvedValue({ id: 'bookmark-1' });
    const wrapper = await mountPage();

    await wrapper.get('tbody .bookmark-btn').trigger('click');
    await flushPromises();

    expect(api.createBookmark).toHaveBeenCalledWith('PR', 'pr-1');
    expect(wrapper.get('tbody .bookmark-btn').attributes('aria-pressed')).toBe('true');
  });

  it('shows an error when bookmarking fails', async () => {
    api.createBookmark.mockRejectedValue(new Error('Request failed: 500'));
    const wrapper = await mountPage();

    await wrapper.get('tbody .bookmark-btn').trigger('click');
    await flushPromises();

    expect(wrapper.get('.error').text()).toBe('Request failed: 500');
    expect(wrapper.get('tbody .bookmark-btn').attributes('aria-pressed')).toBe('false');
  });
});
