import { ApiWidget } from './ApiWidget.js';
import { icons } from './icons.js';

const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=55.7558&longitude=37.6173'
  + '&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code&wind_speed_unit=ms&timezone=Europe%2FMoscow';

function describeWeather(code) {
  if (code === 0) return { text: 'Ясно', icon: icons.sun };
  if (code <= 3) return { text: 'Облачно', icon: icons.cloud };
  if (code <= 48) return { text: 'Туман', icon: icons.cloud };
  if (code >= 71 && code <= 77) return { text: 'Снег', icon: icons.snow };
  if (code === 85 || code === 86) return { text: 'Снегопад', icon: icons.snow };
  return { text: 'Дождь', icon: icons.rain };
}

// Погода в Москве (Open-Meteo, ключ не нужен)
export class WeatherWidget extends ApiWidget {
  constructor(config) {
    super({ title: 'Погода в Москве', ...config });
  }

  renderBody() {
    return `
      <div class="weather">
        <div class="weather-main" hidden>
          <span class="weather-icon"></span>
          <div>
            <p class="weather-temp"></p>
            <p class="weather-text"></p>
          </div>
        </div>
        <p class="weather-details"></p>
        <p class="weather-source">
          Данные: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">open-meteo.com</a>
        </p>
        <a class="weather-more" href="https://www.gismeteo.ru/weather-moscow-4368/" target="_blank" rel="noopener noreferrer">
          Подробный прогноз на Gismeteo →
        </a>
        <div class="status" role="status" hidden></div>
      </div>
    `;
  }

  afterRender() {
    super.afterRender();
    this.addInterval(() => this.load(), 15 * 60 * 1000);
    this.load();
  }

  async load() {
    this.setState('loading', 'Загружаем погоду…');
    try {
      const data = await this.fetchJSON(API_URL);
      const current = (data && data.current) || {};
      const temp = Number(current.temperature_2m);
      const feels = Number(current.apparent_temperature);
      const wind = Number(current.wind_speed_10m);
      const code = Number(current.weather_code);

      if (![temp, feels, wind, code].every(Number.isFinite)) {
        this.setState('empty', 'Сервис не вернул текущую погоду');
        return;
      }

      const weather = describeWeather(code);
      const format = (t) => `${t > 0 ? '+' : ''}${Math.round(t)}°`;
      this.body.querySelector('.weather-main').hidden = false;
      this.body.querySelector('.weather-icon').innerHTML = weather.icon;
      this.body.querySelector('.weather-temp').textContent = format(temp);
      this.body.querySelector('.weather-text').textContent = weather.text;
      this.body.querySelector('.weather-details').textContent = `Ощущается как ${format(feels)} · ветер ${wind.toFixed(1)} м/с`;
      this.setState('success');
    } catch (error) {
      if (this.isCancelled(error)) return;
      this.setState('error', 'Не удалось загрузить погоду.');
    }
  }
}
