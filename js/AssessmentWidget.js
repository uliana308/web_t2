import { UIComponent } from './UIComponent.js';

const QUESTIONS = [
  'Оцените свою продуктивность сегодня',
  'Сколько у вас сегодня энергии?',
  'Насколько удалось сосредоточиться?',
];

export class AssessmentWidget extends UIComponent {
  constructor(config) {
    super({ title: 'Оценка дня', ...config });
    this.step = 0;
    this.answers = [];
  }

  renderBody() {
    return `
      <div class="assessment">
        <div class="steps" aria-hidden="true"><i></i><i></i><i></i></div>
        <p class="question" id="question-${this.id}" aria-live="polite"></p>
        <div class="scores" role="group" aria-labelledby="question-${this.id}">
          <button type="button" class="score">1</button>
          <button type="button" class="score">2</button>
          <button type="button" class="score">3</button>
          <button type="button" class="score">4</button>
          <button type="button" class="score">5</button>
        </div>
        <button type="button" class="btn restart-btn" hidden>Пройти заново</button>
      </div>
    `;
  }

  afterRender() {
    this.addListener(this.body, 'click', (event) => {
      if (event.target.closest('.score')) this.answer(Number(event.target.closest('.score').textContent));
      if (event.target.closest('.restart-btn')) this.restart();
    });
    this.update();
  }

  answer(score) {
    this.answers.push(score);
    this.step++;
    this.update();

    if (this.step === QUESTIONS.length) {
      this.body.querySelector('.restart-btn').focus();
    }
  }

  restart() {
    this.step = 0;
    this.answers = [];
    this.update();
    this.body.querySelector('.score').focus();
  }

  average() {
    return this.answers.reduce((sum, n) => sum + n, 0) / this.answers.length;
  }

  update() {
    const finished = this.step === QUESTIONS.length;
    const question = this.body.querySelector('.question');

    this.body.querySelectorAll('.steps i').forEach((dot, i) => dot.classList.toggle('active', i === this.step));
    this.body.querySelector('.scores').hidden = finished;
    this.body.querySelector('.restart-btn').hidden = !finished;

    question.textContent = finished
      ? `Средняя оценка дня: ${this.average().toFixed(1)} из 5`
      : QUESTIONS[this.step];
  }
}
