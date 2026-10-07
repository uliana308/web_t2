import { icons } from './icons.js';

export class UIComponent {
  constructor({ id, title, width = 1 }) {
    if (new.target === UIComponent) {
      throw new Error('UIComponent — абстрактный класс');
    }
    this.id = id;
    this.title = title;
    this.width = width; // сколько колонок хочет занимать виджет (1 или 2)
    this.element = null;
    this.body = null;
    this.isMinimized = false;

    // всё, что нужно убрать в destroy()
    this.listeners = [];
    this.intervals = [];

    // эти функции назначает Dashboard
    this.onClose = null;
    this.onMove = null;
  }

  // Наследник возвращает разметку своего содержимого
  renderBody() {
    throw new Error('Метод renderBody() нужно переопределить');
  }

  // Наследник вешает обработчики и загружает данные
  afterRender() {}

  render() {
    this.element = document.createElement('section');
    this.element.className = `widget widget-${this.id}`;
    this.element.dataset.id = this.id;
    this.element.innerHTML = `
      <header class="widget-header">
        <button class="drag-handle" type="button" draggable="true">${icons.grip}</button>
        <h2 class="widget-title"></h2>
        <button class="icon-btn move-btn" type="button" data-action="prev">${icons.left}</button>
        <button class="icon-btn move-btn" type="button" data-action="next">${icons.right}</button>
        <button class="icon-btn" type="button" data-action="minimize" aria-expanded="true">${icons.minus}</button>
        <button class="icon-btn" type="button" data-action="close">${icons.close}</button>
      </header>
      <div class="widget-body">${this.renderBody()}</div>
    `;

    this.element.querySelector('.widget-title').textContent = this.title;
    this.element.querySelector('.drag-handle').setAttribute('aria-label', `Переместить «${this.title}»: перетащите мышью или нажимайте стрелки`);
    this.element.querySelector('.drag-handle').title = 'Перетащите мышью или нажимайте стрелки ← →';
    this.element.querySelector('[data-action="prev"]').setAttribute('aria-label', `Сдвинуть «${this.title}» назад`);
    this.element.querySelector('[data-action="next"]').setAttribute('aria-label', `Сдвинуть «${this.title}» вперёд`);
    this.element.querySelector('[data-action="minimize"]').setAttribute('aria-label', `Свернуть «${this.title}»`);
    this.element.querySelector('[data-action="close"]').setAttribute('aria-label', `Закрыть «${this.title}»`);
    this.body = this.element.querySelector('.widget-body');

    const header = this.element.querySelector('.widget-header');
    this.addListener(header, 'click', (event) => this.handleHeaderClick(event));
    this.addListener(header, 'keydown', (event) => this.handleHandleKeys(event));

    this.afterRender();
    return this.element;
  }

  handleHeaderClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    if (button.dataset.action === 'minimize') this.toggleMinimize();
    if (button.dataset.action === 'close') this.close();
    if (button.dataset.action === 'prev') this.move(-1, button);
    if (button.dataset.action === 'next') this.move(1, button);
  }

  move(step, button) {
    if (this.onMove) this.onMove(step);
    if (button.disabled) this.element.querySelector('.drag-handle').focus();
    else button.focus();
  }

  setPosition(index, total) {
    this.element.querySelector('[data-action="prev"]').disabled = index === 0;
    this.element.querySelector('[data-action="next"]').disabled = index === total - 1;
  }

  // без мыши виджет можно переставить стрелками, когда фокус на ручке
  handleHandleKeys(event) {
    const handle = event.target.closest('.drag-handle');
    if (!handle) return;
    let step = 0;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') step = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') step = 1;
    if (step === 0) return;
    event.preventDefault();
    if (this.onMove) this.onMove(step);
    handle.focus();
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.element.classList.toggle('minimized', this.isMinimized);
    this.body.hidden = this.isMinimized;

    const button = this.element.querySelector('[data-action="minimize"]');
    button.innerHTML = this.isMinimized ? icons.plus : icons.minus;
    button.setAttribute('aria-expanded', String(!this.isMinimized));
    button.setAttribute('aria-label', `${this.isMinimized ? 'Развернуть' : 'Свернуть'} «${this.title}»`);
  }

  close() {
    if (this.onClose) this.onClose();
    else this.destroy();
  }

  addListener(target, type, handler) {
    target.addEventListener(type, handler);
    this.listeners.push({ target, type, handler });
  }

  addInterval(callback, ms) {
    this.intervals.push(setInterval(callback, ms));
  }

  destroy() {
    this.listeners.forEach(({ target, type, handler }) => target.removeEventListener(type, handler));
    this.intervals.forEach((id) => clearInterval(id));
    this.listeners = [];
    this.intervals = [];

    if (this.element) this.element.remove();
    this.element = null;
    this.body = null;
  }
}
