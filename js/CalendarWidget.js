import { ApiWidget } from './ApiWidget.js';
import { icons } from './icons.js';

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_OF = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

const PLAN = [
  { from: 1, to: 5, type: 'everyday' },
  { from: 12, to: 14, type: 'important' },
  { from: 22, to: 25, type: 'team' },
];

export class CalendarWidget extends ApiWidget {
  constructor(config) {
    super({ title: 'Календарь', ...config });
    const today = new Date();
    this.year = today.getFullYear();
    this.month = today.getMonth();
    this.holidays = {}; 
  }

  renderBody() {
    return `
      <div class="calendar">
        <div class="calendar-nav">
          <button class="icon-btn" type="button" data-step="-1" aria-label="Предыдущий месяц">${icons.left}</button>
          <p class="calendar-month" aria-live="polite"></p>
          <button class="icon-btn" type="button" data-step="1" aria-label="Следующий месяц">${icons.right}</button>
        </div>
        <div class="calendar-grid weekdays" aria-hidden="true">
          <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
        </div>
        <ol class="calendar-grid days"></ol>
        <ul class="legend">
          <li><i class="dot important"></i>Важные</li>
          <li><i class="dot everyday"></i>Ежедневные</li>
          <li><i class="dot team"></i>Командные</li>
          <li><i class="dot holiday"></i>Праздники</li>
        </ul>
        <ul class="holidays"></ul>
        <div class="status" role="status" hidden></div>
      </div>
    `;
  }

  afterRender() {
    super.afterRender();
    const nav = this.body.querySelector('.calendar-nav');
    this.addListener(nav, 'click', (event) => {
      const button = event.target.closest('[data-step]');
      if (button) this.changeMonth(Number(button.dataset.step));
    });
    this.renderDays();
    this.load();
  }

  changeMonth(step) {
    this.month += step;
    if (this.month < 0) {
      this.month = 11;
      this.year--;
    }
    if (this.month > 11) {
      this.month = 0;
      this.year++;
    }
    this.renderDays();
    this.load();
  }

  async load() {
    const year = this.year;
    if (this.holidays[year]) {
      this.showHolidays();
      return;
    }

    this.setState('loading', 'Загружаем праздники…');
    try {
      const data = await this.fetchJSON(`https://date.nager.at/api/v3/PublicHolidays/${year}/RU`);
      // данные API не доверяем: оставляем только правильные даты и строки
      const list = Array.isArray(data) ? data : [];
      this.holidays[year] = list
        .filter((item) => item && /^\d{4}-\d{2}-\d{2}$/.test(item.date))
        .map((item) => ({ date: item.date, name: String(item.localName || 'Праздник').slice(0, 80) }));
      if (year === this.year) this.showHolidays();
    } catch (error) {
      if (this.isCancelled(error)) return;
      this.setState('error', 'Не удалось загрузить праздники.');
    }
  }

  renderDays() {
    this.body.querySelector('.calendar-month').textContent = `${MONTHS[this.month]} ${this.year}`;

    const daysList = this.body.querySelector('.days');
    daysList.innerHTML = '';

    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
    const firstWeekday = (new Date(this.year, this.month, 1).getDay() + 6) % 7; // понедельник = 0
    const today = new Date();

    for (let i = 0; i < firstWeekday; i++) {
      daysList.append(document.createElement('li'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const li = document.createElement('li');
      const column = (firstWeekday + day - 1) % 7;
      li.className = 'day';
      li.dataset.date = `${this.year}-${String(this.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      li.innerHTML = `<span>${String(day).padStart(2, '0')}</span>`;

      const task = PLAN.find((p) => day >= p.from && day <= p.to);
      if (task) {
        li.classList.add('range', task.type);
        if (day === task.from || column === 0) li.classList.add('start');
        if (day === task.to || column === 6) li.classList.add('end');
      }
      if (day === today.getDate() && this.month === today.getMonth() && this.year === today.getFullYear()) {
        li.classList.add('today');
      }
      daysList.append(li);
    }
  }

  showHolidays() {
    const monthKey = `${this.year}-${String(this.month + 1).padStart(2, '0')}`;
    const monthHolidays = this.holidays[this.year].filter((h) => h.date.startsWith(monthKey));

    this.body.querySelectorAll('.day').forEach((li) => {
      const holiday = monthHolidays.find((h) => h.date === li.dataset.date);
      li.classList.toggle('holiday', Boolean(holiday));
      li.title = holiday ? holiday.name : '';
    });

    const list = this.body.querySelector('.holidays');
    list.innerHTML = '';
    monthHolidays.slice(0, 2).forEach((holiday) => {
      const li = document.createElement('li');
      const date = document.createElement('b');
      date.textContent = `${Number(holiday.date.slice(8))} ${MONTHS_OF[this.month]}`;
      li.append(date, ` — ${holiday.name}`);
      list.append(li);
    });

    // пустой результат — короткая строчка вместо списка
    if (monthHolidays.length === 0) {
      const li = document.createElement('li');
      li.className = 'no-holidays';
      li.textContent = 'Праздников в этом месяце нет';
      list.append(li);
    }
    this.setState(monthHolidays.length ? 'success' : 'empty');
  }
}
