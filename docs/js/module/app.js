import TournamentManager from './Tournament/Tournament.js';
import { defineCommonVariable } from '../variable.js';

export default class BattleEventManager {
  constructor() {
    this.container = document.getElementById('battleEventManager');
    this.tournament = new TournamentManager({ app: this, mode: 'ranking' });
  }
  init() {
    defineCommonVariable();
    this.defineModule();
  }

  defineModule() {
    this.container.classList.add('battleEventManager');
    this.tournament.init();
  }

  generateTounamentHTML() {}
}
