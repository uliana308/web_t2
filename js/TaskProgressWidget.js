import { UIComponent } from './UIComponent.js';
import { icons } from './icons.js';

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const STATS = [
  { done: 17, planned: 26 },
  { done: 19, planned: 27 },
  { done: 23, planned: 28 },
  { done: 24, planned: 27 },
  { done: 13, planned: 24 },
];

// Диаграмма выполнения задач по месяцам
export class TaskProgressWidget extends UIComponent {
  constructor(config) {
    super({ title: 'Прогресс задач', width: 2, ...config });
    this.selected = STATS.length - 1;

    const today = new Date();
    this.months = STATS.map((stat, i) => {
      const date = new Date(today.getFullYear(), today.getMonth() - (STATS.length - 1 - i), 1);
      return { ...stat, month: date.getMonth(), year: date.getFullYear() };
    });
  }

  renderBody() {
    return '<div class="chart"></div>';
  }

  afterRender() {
    this.chart = this.body.querySelector('.chart');
    this.addListener(this.chart, 'click', (event) => {
      const bar = event.target.closest('[data-index]');
      if (!bar) return;
      this.selected = Number(bar.dataset.index);
      this.renderChart();
      this.chart.querySelector(`[data-index="${this.selected}"]`).focus();
    });
    this.renderChart();
  }

  percent(item) {
    return Math.round((item.done / item.planned) * 100);
  }

  renderChart() {
    let html = '<span class="chart-line"></span>';

    this.months.forEach((item, i) => {
      const rate = this.percent(item);
      const prevRate = i === 0 ? 60 : this.percent(this.months[i - 1]);
      const delta = rate - prevRate;
      const isSelected = i === this.selected;
      const name = MONTHS[item.month];

      html += `
        <div class="chart-col ${isSelected ? 'selected' : ''}">
          <span class="chart-delta">${delta > 0 ? '+' : ''}${delta}%
            ${isSelected ? `<i class="delta-icon ${delta < 0 ? 'down' : ''}">${icons.up}</i>` : ''}
          </span>
          <button class="chart-bar" type="button" data-index="${i}" aria-pressed="${isSelected}"
            aria-label="${name}: выполнено ${item.done} из ${item.planned}">
            <span class="chart-fill" style="height: ${rate}%"></span>
          </button>
          <span class="chart-month">${name}</span>
          ${isSelected ? this.tooltip(item, rate, i) : ''}
        </div>
      `;
    });

    this.chart.innerHTML = html;
  }

  tooltip(item, rate, index) {
    const lastDay = new Date(item.year, item.month + 1, 0).getDate();
    const mm = String(item.month + 1).padStart(2, '0');
    return `
      <div class="chart-tooltip ${index >= 2 ? 'left' : 'right'}" aria-hidden="true">
        <p class="tooltip-title">Выполнено задач: ${item.done}</p>
        <p class="tooltip-meta">01.${mm} – ${lastDay}.${mm}.${item.year} <span class="badge">${rate}%</span></p>
      </div>
    `;
  }
}
