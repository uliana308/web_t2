import { UIComponent } from './UIComponent.js';
import { icons } from './icons.js';

const SERVICES = {
  zoom: 'Zoom',
  meet: 'Google Meet',
  telegram: 'Telegram',
};


export class MeetingsWidget extends UIComponent {
  constructor(config) {
    super({ title: 'Встречи и связь', ...config });
    this.connected = ['zoom', 'telegram'];
    this.meetings = [
      { id: 1, time: '10:30', title: 'Планёрка команды', service: 'meet', joined: false },
      { id: 2, time: '14:00', title: 'Созвон с ментором', service: 'zoom', joined: false },
      { id: 3, time: '19:00', title: 'Звонок родителям', service: 'telegram', joined: false },
    ];
  }

  renderBody() {
    return `
      <div class="meetings">
        <div class="meetings-top">
          <div class="avatars" aria-label="Участники: 7">
            <span class="avatar a1">АК</span><span class="avatar a2">МС</span><span class="avatar a3">ДВ</span><span class="avatar more">+4</span>
          </div>
          <div class="services" role="group" aria-label="Подключения"></div>
        </div>
        <ul class="meeting-list"></ul>
      </div>
    `;
  }

  afterRender() {
    // один обработчик на весь виджет
    this.addListener(this.body, 'click', (event) => {
      const service = event.target.closest('[data-service]');
      const join = event.target.closest('[data-join]');
      if (service) this.toggleService(service.dataset.service);
      if (join) this.toggleJoin(Number(join.dataset.join));
    });
    this.update();
  }

  toggleService(key) {
    if (this.connected.includes(key)) {
      this.connected = this.connected.filter((s) => s !== key);
      this.meetings.forEach((m) => {
        if (m.service === key) m.joined = false;
      });
    } else {
      this.connected.push(key);
    }
    this.update();
    this.body.querySelector(`[data-service="${key}"]`).focus();
  }

  toggleJoin(id) {
    const meeting = this.meetings.find((m) => m.id === id);
    if (!this.connected.includes(meeting.service)) return;
    meeting.joined = !meeting.joined;
    this.update();
    this.body.querySelector(`[data-join="${id}"]`).focus();
  }

  update() {
    this.body.querySelector('.services').innerHTML = Object.keys(SERVICES)
      .map((key) => {
        const on = this.connected.includes(key);
        return `<button class="service ${on ? 'on' : ''}" type="button" data-service="${key}" aria-pressed="${on}"
          aria-label="${SERVICES[key]}: ${on ? 'подключено' : 'не подключено'}" title="${SERVICES[key]}">${icons[key]}</button>`;
      })
      .join('');

    this.body.querySelector('.meeting-list').innerHTML = this.meetings
      .map((m) => {
        const available = this.connected.includes(m.service);
        const label = available ? `${m.joined ? 'Выйти' : 'Войти'}: ${m.title}` : `Подключите ${SERVICES[m.service]}`;
        return `
          <li class="meeting ${m.joined ? 'joined' : ''}">
            <b>${m.time}</b>
            <span class="meeting-title">${m.title} <small>${SERVICES[m.service]}</small></span>
            <button class="join-btn" type="button" data-join="${m.id}" aria-pressed="${m.joined}"
              aria-disabled="${!available}" aria-label="${label}" title="${label}">${m.joined ? icons.close : icons.phone}</button>
          </li>`;
      })
      .join('');
  }
}
