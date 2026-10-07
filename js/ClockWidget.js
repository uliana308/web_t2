import { ApiWidget } from './ApiWidget.js';

const API_URL = 'https://timeapi.io/api/Time/current/zone?timeZone=Europe/Moscow';
const MOSCOW_OFFSET = 3 * 60 * 60 * 1000; // UTC+3, если сервер недоступен


export class ClockWidget extends ApiWidget {
  constructor(config) {
    super({ title: 'Точное время', ...config });
    this.offset = MOSCOW_OFFSET; 
  }

  renderBody() {
    return `
      <div class="clock">
        <p class="clock-zone">Москва · Europe/Moscow · UTC+3</p>
        <p class="clock-time"><span class="clock-hm">--:--</span><span class="clock-sec"></span></p>
        <p class="clock-date"></p>
        <div class="status" role="status" hidden></div>
      </div>
    `;
  }

  afterRender() {
    super.afterRender();
    this.tick();
    this.addInterval(() => this.tick(), 1000);
    this.addInterval(() => this.load(), 10 * 60 * 1000); // пересинхронизация раз в 10 минут
    this.load();
  }

  async load() {
    this.setState('loading', 'Сверяем время с сервером…');
    try {
      const start = Date.now();
      const data = (await this.fetchJSON(API_URL)) || {};
      // ответ сервера проверяем: берём только числа
      const parts = [data.year, data.month, data.day, data.hour, data.minute, data.seconds, data.milliSeconds].map(Number);

      if (parts.some((n) => !Number.isFinite(n))) {
        this.offset = MOSCOW_OFFSET;
        this.setState('empty', 'Сервер не прислал время, показаны часы устройства');
        return;
      }

      const [year, month, day, hours, minutes, seconds, ms] = parts;
      const moscowNow = Date.UTC(year, month - 1, day, hours, minutes, seconds, ms) + (Date.now() - start) / 2;
      this.offset = moscowNow - Date.now();
      this.setState('success', 'Синхронизировано с timeapi.io');
    } catch (error) {
      if (this.isCancelled(error)) return;
      this.offset = MOSCOW_OFFSET;
      this.setState('error', 'Нет связи с сервером, показаны часы устройства.');
    }
  }

  tick() {

    const now = new Date(Date.now() + this.offset);
    const pad = (n) => String(n).padStart(2, '0');

    this.body.querySelector('.clock-hm').textContent = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`;
    this.body.querySelector('.clock-sec').textContent = `:${pad(now.getUTCSeconds())}`;

    const date = now.toLocaleDateString('ru-RU', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' });
    this.body.querySelector('.clock-date').textContent = date[0].toUpperCase() + date.slice(1);
  }
}
