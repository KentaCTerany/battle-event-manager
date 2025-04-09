import TournamentGenerator from './tournament.js'

export default class BattleEventManager {
  constructor() {
    this.container = document.getElementById('battleEventManager')
    this.tournament = new TournamentGenerator({ app: this, mode: 'ranking' })
  }
  init() {
    this.defineModule()
  }

  defineModule() {
    this.container.classList.add('battleEventManager')
    this.tournament.init()
  }

  generateTounamentHTML() {}
}
