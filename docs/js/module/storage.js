export default class Storage {
  constructor({ app }) {
    this.app = app;
    this.cs = window.BEM_app.debug.cs;
    this.baseName = 'battle-event-manager';
  }

  get savedData() {
    this.cs.log('getSaved');
    this.cs.log(localStorage.getItem(this.baseName));

    return JSON.parse(localStorage.getItem(this.baseName));
  }

  save(data) {
    this.cs.log('save', data);
    localStorage.setItem(this.baseName, JSON.stringify(data));
    this.cs.log(this.savedData);
  }

  loadSavedData() {
    const savedData = this.savedData;
    if (!savedData) return;

    this.app.setup = true;
    this.app.eventData = savedData.eventData;
    this.app.mode.stateIndex = savedData.stateIndex ?? 0;

    this.cs.log('loadSavedData', savedData);
  }
}
