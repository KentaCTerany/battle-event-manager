import { setDebugMode } from './debug.js';
import BattleEventManagerDOM from './dom.js';
import BattleEventManagerMode from './mode.js';
import PrelimManager from './Prelim/Prelim.js';
import TournamentManager from './Tournament/Tournament.js';
import Storage from './storage.js';

setDebugMode();

export default class BattleEventManager {
  constructor() {
    this.cs = window.BEM_app.debug.cs;
    this.setup = false;
    this.mode = 0;
    this.name = 'BEM-app';
    this.dom = new BattleEventManagerDOM({ app: this });
    this.mode = new BattleEventManagerMode({ app: this });
    this.prelim = new PrelimManager();
    this.tournament = new TournamentManager({ app: this, mode: 'seed' });
    this.storage = new Storage({ app: this });
    this.eventData = null;

    this.init();
  }

  init() {
    this.cs.log('BEM-app / init');
    this.storage.loadSavedData();
    this.cs.log(this.setup);
    this.loadApp();
  }

  loadApp() {
    document.body.classList.add('battleEventManager', 'BEM-app');
    this.dom.build();
    this.mode.render();
    this.addEvents();
  }

  addEvents() {
    const handleClick = (e) => {
      const isMatch = (selector) => e.target.matches(selector);
      if (isMatch('.BEM-app-event-setup__button')) return this.onClickEventSetup(e);
      if (isMatch('.BEM-app-event-setting__button')) return this.onClickEventSetting(e);
    };

    document.addEventListener('click', handleClick);
    this.mode.addEvents();
    this.tournament.addEvents();
  }

  onClickEventSetup() {
    const settings = document.querySelector('.BEM-app-event-setup');
    const eventName = settings.querySelector('input[name="event-name"]').value;
    const eventDate = settings.querySelector('input[name="event-date"]').value;
    const eventVenue = settings.querySelector('input[name="event-venue"]').value;
    const id = crypto.randomUUID();

    if (!eventName) {
      settings.querySelector('.--form-alert-message').innerHTML = '入力してください';
      return;
    }

    this.updateEventData({ id, name: eventName, date: eventDate, venue: eventVenue });

    this.setup = true;
    this.mode.stateIndex = 0;
    this.mode.render();
  }

  onClickEventSetting() {
    const settings = document.querySelector('.BEM-app-event-setup');
    const eventName = settings.querySelector('input[name="event-name"]').value;
    const eventDate = settings.querySelector('input[name="event-date"]').value;
    const eventVenue = settings.querySelector('input[name="event-venue"]').value;

    if (!eventName) {
      settings.querySelector('.--form-alert-message').innerHTML = '入力してください';
      return;
    }

    this.updateEventData({ name: eventName, date: eventDate, venue: eventVenue });
  }

  updateEventData({ id = this.eventData.id, name = this.eventData.name, date = this.eventData.date, venue = this.eventData.venue, battlerList = null }) {
    this.eventData = {
      id,
      name,
      date,
      venue,
      battlerList,
    };
    const navElem = document.querySelector('.BEM-app-side-nav');

    this.storage.save({ eventData: this.eventData, stateIndex: this.mode.stateIndex });

    if (navElem) navElem.remove();

    this.mode.container.insertAdjacentHTML('beforebegin', this.dom.getNavHTML());
  }

  generateVariableScript() {
    const html2pdfScriptElem = document.createElement('script');
    html2pdfScriptElem.setAttribute('src', '/js/lib/html2pdf.bundle.min.js');

    document.body.insertAdjacentElement('beforeend', html2pdfScriptElem);
  }
}
