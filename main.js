import { Dashboard } from './js/Dashboard.js';
import { TaskProgressWidget } from './js/TaskProgressWidget.js';
import { CalendarWidget } from './js/CalendarWidget.js';
import { ClockWidget } from './js/ClockWidget.js';
import { MeetingsWidget } from './js/MeetingsWidget.js';
import { AssessmentWidget } from './js/AssessmentWidget.js';
import { QuoteWidget } from './js/QuoteWidget.js';
import { WeatherWidget } from './js/WeatherWidget.js';

const widgetClasses = {
  progress: TaskProgressWidget,
  calendar: CalendarWidget,
  clock: ClockWidget,
  meetings: MeetingsWidget,
  assessment: AssessmentWidget,
  quote: QuoteWidget,
  weather: WeatherWidget,
};

const picker = document.getElementById('widget-picker');
const dashboard = new Dashboard(document.getElementById('board'), widgetClasses);

// В панели остаются только те виджеты, которых ещё нет на дашборде
dashboard.onChange = (activeTypes) => {
  let available = 0;
  picker.querySelectorAll('button').forEach((button) => {
    button.hidden = activeTypes.includes(button.dataset.type);
    if (!button.hidden) available++;
  });
  document.getElementById('picker-hint').textContent = available
    ? `Можно добавить: ${available}`
    : 'Все виджеты уже на панели';
};

picker.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const widget = dashboard.addWidget(button.dataset.type);
  if (widget) widget.element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// Сегодняшняя дата в шапке
const today = new Date().toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow', weekday: 'long', day: 'numeric', month: 'long' });
document.getElementById('today').textContent = `${today[0].toUpperCase()}${today.slice(1)} · персональный организатор`;

['progress', 'calendar', 'clock', 'meetings', 'assessment'].forEach((type) => dashboard.addWidget(type));
