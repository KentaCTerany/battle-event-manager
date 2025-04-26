export default class TournamentManagerResultPanel {
  constructor() {
    this.container = document.getElementById('battleEventManager');
    this.target = null;
  }

  addResultPanelEvent() {
    const addEventsToElements = (array, event, fn) => array.forEach((elem) => elem.addEventListener(event, fn));
    const panelButtons = this.container.querySelectorAll('.BEM-tournament-panel_winnerSelect button');
    const descInputs = this.container.querySelectorAll('.BEM-tournament-panel_input');
    const resetButtons = this.container.querySelectorAll('.BEM-tournament-panel_reset');

    addEventsToElements(panelButtons, 'click', this.onClickPanelButton.bind(this));
    addEventsToElements(resetButtons, 'click', this.onClickPanelResetButton.bind(this));
    addEventsToElements(descInputs, 'change', this.onChangePanelCheckbox.bind(this));
  }

  onClickPanelButton(e) {
    this.updateTargetByEvent(e);

    const isSideA = this.target.classList.contains('-sideA');

    this.setPanelWin({ isSideA });
    this.setTournamentWinner({ isSideA });
  }

  onClickPanelResetButton(e) {
    this.updateTargetByEvent(e);
    this.resetMatchInfo();
  }

  onChangePanelCheckbox(e) {
    this.updateTargetByEvent(e);
    this.toggleResultDesc();
  }

  showPanel() {
    const targetPanel = this.targetMatch.querySelector(':scope > .BEM-tournament-panel');

    this.container.querySelectorAll('.BEM-tournament-panel').forEach((panel) => panel.setAttribute('aria-hidden', true));
    targetPanel.setAttribute('aria-hidden', false);
  }

  hidePanel() {
    const targetPanel = this.targetMatch.querySelector(':scope > .BEM-tournament-panel');

    targetPanel.setAttribute('aria-hidden', true);
  }

  togglePanel() {
    const targetPanel = this.targetMatch.querySelector(':scope > .BEM-tournament-panel');
    const isHidden = targetPanel.getAttribute('aria-hidden') === 'true';

    if (isHidden) this.showPanel();
    else this.hidePanel();
  }

  updateTargetByEvent(e) {
    this.target = e.target;
    this.targetMatch = this.target.closest('.BEM-tournament-match');
  }

  setPanelWin({ isSideA }) {
    const targetResult = this.targetMatch.querySelector(':scope > .BEM-tournament-result');
    targetResult.dataset.win = isSideA ? 'A' : 'B';
  }

  setTournamentWinner({ isSideA = true }) {
    const winnerDisplay = this.targetMatch.querySelector('.BEM-tournament-result_winner');

    if (!winnerDisplay) return;

    const sideSelector = isSideA ? '.-sideA' : '.-sideB';
    const targetPanel = this.targetMatch.querySelector(':scope > .BEM-tournament-panel');
    const winnerText = targetPanel.querySelector(`.BEM-tournament-panel_battler${sideSelector}`).textContent;

    winnerDisplay.textContent = winnerText;
  }

  resetMatchInfo() {
    const targetPanel = this.targetMatch.querySelector(':scope > .BEM-tournament-panel');
    const descInput = targetPanel.querySelector('.BEM-tournament-panel_input');
    const targetResult = this.targetMatch.querySelector(':scope > .BEM-tournament-result');
    const resultDesc = targetResult.querySelector('.BEM-tournament-result_desc');

    targetResult.dataset.win = '';
    descInput.checked = false;
    resultDesc.setAttribute('aria-hidden', true);
  }

  toggleResultDesc() {
    const targetPanel = this.targetMatch.querySelector(':scope > .BEM-tournament-panel');
    const targetResult = this.targetMatch.querySelector(':scope > .BEM-tournament-result');
    const descInputValue = targetPanel.querySelector('.BEM-tournament-panel_input')?.checked;
    const resultDesc = targetResult.querySelector('.BEM-tournament-result_desc');

    resultDesc.setAttribute('aria-hidden', !descInputValue);
  }

  getResultPanel({ battlerA, battlerB }) {
    return `
      <div class="BEM-tournament-panel" aria-hidden="true">
        <div class="BEM-tournament-panel_matchInfo"></div>
        <div class="BEM-tournament-panel_match">
          <div class="BEM-tournament-panel_battler -sideA">${battlerA}</div>
          <span class="BEM-tournament-panel_vs">vs</span>
          <div class="BEM-tournament-panel_battler -sideB">${battlerB}</div>
        </div>
        <div class="BEM-tournament-panel_winnerSelect">
          <button class="-sideA">win</button>
          <button class="-sideB">win</button>
        </div>
        <label><input type="checkbox" class="BEM-tournament-panel_input">延長</label>
        <button class="BEM-tournament-panel_reset">RESET</button>
      </div>
      `;
  }
}
