import { UIComponent } from './UIComponent.js';

// Случайная цитата с кнопкой «Обновить»
export class QuoteWidget extends UIComponent {
  constructor(config) {
    super({ title: 'Цитата дня', ...config });
    this.quotes = [
      { text: 'Секрет того, чтобы вырваться вперёд, — начать.', author: 'Марк Твен' },
      { text: 'Делай что можешь, с тем что имеешь, там где ты есть.', author: 'Теодор Рузвельт' },
      { text: 'Простота — необходимое условие красоты.', author: 'Лев Толстой' },
      { text: 'Мы есть то, что мы делаем постоянно.', author: 'Аристотель' },
      { text: 'Сосредоточенность — это умение говорить «нет».', author: 'Стив Джобс' },
      { text: 'Лучший способ предсказать будущее — создать его.', author: 'Питер Друкер' },
      { text: 'Тот, кто двигает горы, начинает с маленьких камней.', author: 'Конфуций' },
    ];
    this.current = -1;
  }

  renderBody() {
    return `
      <div class="quote">
        <blockquote aria-live="polite">
          <p class="quote-text"></p>
          <cite class="quote-author"></cite>
        </blockquote>
        <button type="button" class="btn refresh-btn">Обновить</button>
      </div>
    `;
  }

  afterRender() {
    this.addListener(this.body.querySelector('.refresh-btn'), 'click', () => this.showRandom());
    this.showRandom();
  }

  showRandom() {
    let index = this.current;
    while (index === this.current) {
      index = Math.floor(Math.random() * this.quotes.length);
    }
    this.current = index;

    const quote = this.quotes[index];
    this.body.querySelector('.quote-text').textContent = `«${quote.text}»`;
    this.body.querySelector('.quote-author').textContent = `— ${quote.author}`;
  }
}
