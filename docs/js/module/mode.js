export default class BattleEventManagerMode {
  constructor({ app }) {
    this.app = app;
    this.dom = this.app.dom;
    this.stateIndex = 0;
    this.cs = app.cs;
  }

  get stateMap() {
    return [
      { html: this.dom.getEventSettingHTML() },
      { html: this.dom.getPrelimHTML() },
      { html: this.dom.getRankingHTML() },
      {
        html: this.dom.getTournamentHTML(),
      },
    ];
  }

  render() {
    if (!this.container) this.container = this.dom.container.querySelector('.BEM-app-main__frame');
    if (!this.app.setup) {
      this.rendarSetup();
      return;
    }

    if (!document.querySelector('.BEM-app-side-nav')) this.container.insertAdjacentHTML('beforebegin', this.dom.getNavHTML());
    this.container.innerHTML = this.stateMap[this.stateIndex].html;
  }

  rendarSetup() {
    this.container.innerHTML = this.dom.getSetupHTML();
  }

  addEvents() {
    const handleClick = (e) => {
      const isMatch = (selector) => e.target.matches(selector);

      if (isMatch('.BEM-app-side-nav button[data-mode]:not([class*="is-active"])')) return this.onClickNav(e);
      if (isMatch('.BEM-app-event-setting__battler')) return null;
      if (isMatch('.BEM-app-event-setting__battler-delete')) return this.onClickBattlerDelete(e);
      if (isMatch('.BEM-app-event-setting__battler-add')) return this.onClickBattlerAdd(e);
      if (isMatch('.BEM-app-event-setting .--button')) return this.onClickSettingButton(e);
    };

    document.addEventListener('click', handleClick);
  }

  onClickNav(e) {
    // const mode = e.target.dataset.mode;
    const stateIndex = Number(e.target.dataset.stateIndex);
    const navItems = document.querySelectorAll('.BEM-app-side-nav li button ');

    if (this.stateIndex === stateIndex) return;

    navItems.forEach((item) => {
      item.classList.remove('--active');
    });
    e.target.classList.add('--active');

    this.stateIndex = stateIndex;
    console.log(this.app.eventData);
    this.app.updateEventData({ id: this.app.eventData.id });
    console.log(this.app.eventData);
    this.render();
  }

  onClickBattlerDelete(e) {
    const battlersContainer = document.querySelector('.BEM-app-event-setting__battler');
    const battlerContainer = e.target.closest('li');
    const allBattlerContainers = document.querySelectorAll('.BEM-app-event-setting__battler .--battler');
    const battlerIndex = Number(battlerContainer.querySelector('.--index').innerText);

    if (allBattlerContainers.length <= 8) {
      battlerContainer.querySelectorAll('input[type="text"]').forEach((input) => (input.value = ''));
    } else {
      const scrollTop = battlersContainer.scrollTop;

      battlerContainer.remove();

      // 1フレーム遅らせないとスクロールが上書きされる
      requestAnimationFrame(() => {
        battlersContainer.scrollTop = scrollTop;
      });

      document.querySelectorAll('.BEM-app-event-setting__battler .--battler').forEach((container, index) => {
        const indexElem = container.querySelector('.--index');
        indexElem.innerText = index + 1;
      });

      const afterTarget = [...document.querySelectorAll('.BEM-app-event-setting__battler .--battler')].find((container) => {
        return Number(container.querySelector('.--index').innerText) === battlerIndex;
      });

      afterTarget.querySelector('input[name="battler-name"]').focus();
    }
  }

  onClickBattlerAdd() {
    this.dom.addBattler();
    const battlersContainer = document.querySelector('.BEM-app-event-setting__battler');
    battlersContainer.scrollTop = battlersContainer.scrollHeight;
  }

  onClickSettingButton() {
    this.cs.log('onClickSettingButton');

    const settings = document.querySelector('.BEM-app-event-setting');
    const eventName = settings.querySelector('input[name="event-name"]').value;
    const eventDate = settings.querySelector('input[name="event-date"]').value;
    const eventVenue = settings.querySelector('input[name="event-venue"]').value;
    const battlerContainers = document.querySelectorAll('.BEM-app-event-setting__battler .--battler');

    if (!eventName) {
      settings.querySelector('.--form-alert-message').innerHTML = '入力してください';
      return;
    }

    const battlerList = [...battlerContainers].map((battler) => {
      this.cs.log(battler);
      const name = battler.querySelector('input[name="battler-name"]').value;
      const desc = battler.querySelector('input[name="battler-desc"]').value;
      const info = battler.querySelector('input[name="battler-info"]').value;

      if (!name && !desc && !info) return null;
      return { name, desc, info };
    });

    this.app.updateEventData({ name: eventName, date: eventDate, venue: eventVenue, battlerList });
  }
}
