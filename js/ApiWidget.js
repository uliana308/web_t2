import { UIComponent } from './UIComponent.js';

// Общий класс для виджетов, которые берут данные из стороннего API.
export class ApiWidget extends UIComponent {
  constructor(config) {
    super(config);
    if (new.target === ApiWidget) {
      throw new Error('ApiWidget — абстрактный класс');
    }
    this.controller = null;
    this.state = 'idle';
  }

  load() {
    throw new Error('Метод load() нужно переопределить');
  }

  afterRender() {
    this.addListener(this.body, 'click', (event) => {
      if (event.target.closest('.retry-btn')) this.load();
    });
  }

  async fetchJSON(url) {
    // если предыдущий запрос ещё идёт — он уже не нужен
    if (this.controller) this.controller.abort();

    const controller = new AbortController();
    this.controller = controller;
    const timer = setTimeout(() => controller.abort(new Error('timeout')), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
      if (this.controller === controller) this.controller = null;
    }
  }

  isCancelled(error) {
    return error.name === 'AbortError';
  }

  setState(state, message = '') {
    this.state = state;
    const box = this.body.querySelector('.status');
    box.className = `status status-${state}`;
    box.textContent = message;
    box.hidden = message === '';
    if (state === 'error') {
      box.insertAdjacentHTML('beforeend', ' <button class="retry-btn" type="button">Повторить</button>');
    }
  }

  destroy() {
    if (this.controller) this.controller.abort();
    super.destroy();
  }
}
