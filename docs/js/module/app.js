import TournamentManager from './Tournament/Tournament.js';

export default class BattleEventManager {
  constructor() {
    this.container = document.getElementById('battleEventManager');
    this.tournament = new TournamentManager({ app: this, mode: 'seed' });
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
    const html2pdfScriptElem = document.createElement('script');
    html2pdfScriptElem.setAttribute('src', '/js/lib/html2pdf.bundle.min.js');

    document.body.insertAdjacentElement('beforeend', html2pdfScriptElem);
  }
}
