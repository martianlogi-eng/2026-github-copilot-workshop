import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App.vue';

async function mountApp() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [],
  });
  const wrapper = mount(App, {
    global: {
      plugins: [router],
    },
  });
  await router.isReady();
  return wrapper;
}

afterEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark-mode');
});

describe('App theme toggle', () => {
  it('switches to dark mode and persists the preference', async () => {
    const wrapper = await mountApp();

    await wrapper.get('.theme-toggle').trigger('click');

    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(wrapper.get('.theme-toggle').attributes('aria-pressed')).toBe('true');
  });

  it('restores the saved dark mode preference', async () => {
    localStorage.setItem('theme', 'dark');

    const wrapper = await mountApp();

    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(wrapper.get('.theme-toggle').text()).toContain('Light mode');
  });
});
