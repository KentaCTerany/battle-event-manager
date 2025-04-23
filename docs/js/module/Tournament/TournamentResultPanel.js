export default class TournamentManagerResultPanel {
  constructor() {
    this.container = document.getElementById('battleEventManager');
    this.target = null;
  }

  addResultPanelEvent() {
    const addEventsToElements = (array, event, fn) => array.forEach((elem) => elem.addEventListener(event, fn));
    const panelButtons = this.container.querySelectorAll('.BEMTournamentPanel_winnerSelect button');
    const descInputs = this.container.querySelectorAll('.BEMTournamentPanel_input');
    const resetButtons = this.container.querySelectorAll('.BEMTournamentPanel_reset');

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
    const targetPanel = this.targetMatch.querySelector(':scope > .BEMTournamentPanel');

    this.container.querySelectorAll('.BEMTournamentPanel').forEach((panel) => panel.setAttribute('aria-hidden', true));
    targetPanel.setAttribute('aria-hidden', false);
  }

  hidePanel() {
    const targetPanel = this.targetMatch.querySelector(':scope > .BEMTournamentPanel');

    targetPanel.setAttribute('aria-hidden', true);
  }

  togglePanel() {
    const targetPanel = this.targetMatch.querySelector(':scope > .BEMTournamentPanel');
    const isHidden = targetPanel.getAttribute('aria-hidden') === 'true';

    if (isHidden) this.showPanel();
    else this.hidePanel();
  }

  updateTargetByEvent(e) {
    this.target = e.target;
    this.targetMatch = this.target.closest('.BEMTournamentMatch');
  }

  setPanelWin({ isSideA }) {
    const targetResult = this.targetMatch.querySelector(':scope > .BEMTournamentResult');
    targetResult.dataset.win = isSideA ? 'A' : 'B';
  }

  setTournamentWinner({ isSideA = true }) {
    const winnerDisplay = this.targetMatch.querySelector('.BEMTournamentResult_winner');

    if (!winnerDisplay) return;

    const sideSelector = isSideA ? '.-sideA' : '.-sideB';
    const targetPanel = this.targetMatch.querySelector(':scope > .BEMTournamentPanel');
    const winnerText = targetPanel.querySelector(`.BEMTournamentPanel_battler${sideSelector}`).textContent;

    winnerDisplay.textContent = winnerText;
  }

  resetMatchInfo() {
    const targetPanel = this.targetMatch.querySelector(':scope > .BEMTournamentPanel');
    const descInput = targetPanel.querySelector('.BEMTournamentPanel_input');
    const targetResult = this.targetMatch.querySelector(':scope > .BEMTournamentResult');
    const resultDesc = targetResult.querySelector('.BEMTournamentResult_desc');

    targetResult.dataset.win = '';
    descInput.checked = false;
    resultDesc.setAttribute('aria-hidden', true);
  }

  toggleResultDesc() {
    const targetPanel = this.targetMatch.querySelector(':scope > .BEMTournamentPanel');
    const targetResult = this.targetMatch.querySelector(':scope > .BEMTournamentResult');
    const descInputValue = targetPanel.querySelector('.BEMTournamentPanel_input')?.checked;
    const resultDesc = targetResult.querySelector('.BEMTournamentResult_desc');

    resultDesc.setAttribute('aria-hidden', !descInputValue);
  }

  getResultPanel({ battlerA, battlerB }) {
    return `
      <div class="BEMTournamentPanel" aria-hidden="true">
        <div class="BEMTournamentPanel_matchInfo"></div>
        <div class="BEMTournamentPanel_match">
          <div class="BEMTournamentPanel_battler -sideA">${battlerA}</div>
          <span class="BEMTournamentPanel_vs">vs</span>
          <div class="BEMTournamentPanel_battler -sideB">${battlerB}</div>
        </div>
        <div class="BEMTournamentPanel_winnerSelect">
          <button class="-sideA">win</button>
          <button class="-sideB">win</button>
        </div>
        <label><input type="checkbox" class="BEMTournamentPanel_input">延長</label>
        <button class="BEMTournamentPanel_reset">RESET</button>
      </div>
      `;
  }
}
