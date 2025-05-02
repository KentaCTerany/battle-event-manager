import TournamentManager from './Tournament/Tournament.js';

export default class BattleEventManager {
  constructor() {
    this.container = document.getElementById('battleEventManager');
    this.tournament = new TournamentManager({ app: this, mode: 'ranking' });
  }
  init() {
    this.generateVariableScript();
    this.defineModule();
  }

  defineModule() {
    this.container.classList.add('battleEventManager');
    this.tournament.init();
  }

  generateVariableScript() {
    const scriptElem = document.createElement('script');
    scriptElem.setAttribute('src', '/js/variable.js');

    document.body.insertAdjacentElement('beforeend', scriptElem);
  }
}
