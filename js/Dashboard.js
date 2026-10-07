// Управляет всеми виджетами на панели
export class Dashboard {
  constructor(container, widgetClasses) {
    this.container = container;
    this.widgetClasses = widgetClasses; // тип -> класс
    this.widgets = [];
    this.draggedId = null;
    this.onChange = null;

    // перетаскивание мышью: делегирование на контейнере
    container.addEventListener('dragstart', (event) => this.onDragStart(event));
    container.addEventListener('dragover', (event) => this.onDragOver(event));
    container.addEventListener('drop', (event) => this.onDrop(event));
    container.addEventListener('dragend', () => this.onDragEnd());
  }

  hasWidget(widgetType) {
    return this.widgets.some((w) => w.id === widgetType);
  }

  addWidget(widgetType) {
    // каждый виджет может быть на панели только один раз
    if (this.hasWidget(widgetType)) return null;

    const WidgetClass = this.widgetClasses[widgetType];
    const widget = new WidgetClass({ id: widgetType });
    widget.onClose = () => this.removeWidget(widget.id);
    widget.onMove = (step) => this.moveWidget(widget.id, step);

    this.animate(() => {
      this.widgets.push(widget);
      this.container.append(widget.render());
    });
    return widget;
  }

  removeWidget(widgetId) {
    const widget = this.widgets.find((w) => w.id === widgetId);
    if (!widget) return;

    this.animate(() => {
      widget.destroy();
      this.widgets = this.widgets.filter((w) => w !== widget);
    });
    this.container.focus(); // чтобы фокус не потерялся
  }

  moveWidget(widgetId, step) {
    const from = this.widgets.findIndex((w) => w.id === widgetId);
    this.moveTo(from, from + step);
  }

  moveTo(from, to) {
    if (to < 0 || to >= this.widgets.length || from === to) return;
    this.animate(() => {
      const [widget] = this.widgets.splice(from, 1);
      this.widgets.splice(to, 0, widget);
      this.container.append(...this.widgets.map((w) => w.element));
    });
  }

  // Каждый виджет занимает столько колонок, сколько ему нужно (1 или 2).
  // Сетка с grid-auto-flow: dense сама подтягивает виджеты на освободившиеся места.
  layout() {
    this.widgets.forEach((widget) => {
      widget.element.style.gridColumn = `span ${widget.width}`;
    });
  }

  animate(change) {
    const oldPositions = new Map();
    this.widgets.forEach((w) => oldPositions.set(w.id, w.element.getBoundingClientRect()));

    change();
    this.layout();
    this.widgets.forEach((w, i) => w.setPosition(i, this.widgets.length));
    if (this.onChange) this.onChange(this.widgets.map((w) => w.id));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.widgets.forEach((w) => {
      const old = oldPositions.get(w.id);
      if (!old) return;
      const now = w.element.getBoundingClientRect();
      const dx = old.left - now.left;
      const dy = old.top - now.top;
      if (dx === 0 && dy === 0) return;
      w.element.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration: 350, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
      );
    });
  }

  onDragStart(event) {
    if (!event.target.closest('.drag-handle')) return;
    const card = event.target.closest('.widget');
    this.draggedId = card.dataset.id;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', this.draggedId);
    event.dataTransfer.setDragImage(card, 20, 20);
    card.classList.add('dragging');
  }

  onDragOver(event) {
    const target = event.target.closest('.widget');
    if (!this.draggedId || !target) return;
    event.preventDefault();
    this.container.querySelectorAll('.drop-target').forEach((el) => el.classList.remove('drop-target'));
    if (target.dataset.id !== this.draggedId) target.classList.add('drop-target');
  }

  onDrop(event) {
    const target = event.target.closest('.widget');
    if (!this.draggedId || !target) return;
    event.preventDefault();
    const from = this.widgets.findIndex((w) => w.id === this.draggedId);
    const to = this.widgets.findIndex((w) => w.id === target.dataset.id);
    this.moveTo(from, to);
  }

  onDragEnd() {
    this.container.querySelectorAll('.dragging, .drop-target').forEach((el) => el.classList.remove('dragging', 'drop-target'));
    this.draggedId = null;
  }
}
