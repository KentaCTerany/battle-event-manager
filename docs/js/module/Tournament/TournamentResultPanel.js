export default class TournamentManagerResultPanel {
  constructor({ tournamentApp }) {
    this.app = tournamentApp;
    this.container = document.getElementById('battleEventManager');
    this.target = null;
    this.targetMatch = null;
  }

  get winnerDisplay() {
    return this.container.querySelector('.BEM-tournament-result_winner');
  }

  get targetPanel() {
    return this.targetMatch?.querySelector(':scope > .BEM-tournament-panel');
  }

  get targetResult() {
    return this.targetMatch?.querySelector(':scope > .BEM-tournament-result');
  }

  addResultPanelEvent() {
    const bindEvents = (array, event, handler) => array.forEach((elem) => elem.addEventListener(event, handler.bind(this)));
    const closeButtons = this.container.querySelectorAll('.BEM-tournament-panel_close');
    const panelButtons = this.container.querySelectorAll('.BEM-tournament-panel_winnerSelect button');
    const descInputs = this.container.querySelectorAll('.BEM-tournament-panel_input');
    const resetButtons = this.container.querySelectorAll('.BEM-tournament-panel_reset');

    bindEvents(closeButtons, 'click', this.onClickCloseButton);
    bindEvents(panelButtons, 'click', this.onClickPanelButton);
    bindEvents(resetButtons, 'click', this.onClickPanelResetButton);
    bindEvents(descInputs, 'change', this.onChangePanelCheckbox);
  }

  onClickCloseButton(e) {
    this.hidePanel();
  }

  onClickPanelButton(e) {
    this.updateTargetByEvent(e);
    this.setTargetPanelWin();
    this.setParentBattlerName();
    this.setTournamentWinner();
  }

  onClickPanelResetButton(e) {
    this.updateTargetByEvent(e);
    this.resetMatchInfo();
    this.resetTournamentWinner();
  }

  onChangePanelCheckbox(e) {
    this.updateTargetByEvent(e);
    this.toggleTargetResultDesc();
  }

  showPanel() {
    this.container.querySelectorAll('.BEM-tournament-panel').forEach((panel) => panel.setAttribute('aria-hidden', true));
    this.targetPanel.setAttribute('aria-hidden', false);
  }

  hidePanel() {
    this.targetPanel.setAttribute('aria-hidden', true);
  }

  togglePanel() {
    const isHidden = this.targetPanel.getAttribute('aria-hidden') === 'true';

    if (isHidden) this.showPanel();
    else this.hidePanel();
  }

  updateTargetByEvent(e) {
    this.target = e.target;
    this.targetMatch = this.target.closest('.BEM-tournament-match');
  }

  setTargetPanelWin() {
    const battlerElem = this.target.closest('.BEM-tournament-panel_battler');
    const isSideA = battlerElem.classList.contains('-sideA');

    this.targetResult.dataset.win = isSideA ? 'A' : 'B';
    this.targetPanel.dataset.win = isSideA ? 'A' : 'B';
  }

  setTournamentWinner() {
    const finalMatchElem = this.winnerDisplay.closest('.BEM-tournament-match');
    const resultElem = finalMatchElem.querySelector(':scope > .BEM-tournament-result');
    const winnerSide = resultElem.dataset.win;

    if (!winnerSide) return;

    const panelElem = finalMatchElem.querySelector(':scope > .BEM-tournament-panel');
    const panelWinnerEntry = panelElem.querySelector(`.BEM-tournament-panel_battler.-side${winnerSide}`).dataset.entry;
    const winnerEntryIndex = Number(panelWinnerEntry);
    const winner = this.app.battlerList[winnerEntryIndex];

    const winnerNameElem = this.winnerDisplay.querySelector('.-name');
    const winnerDescElem = this.winnerDisplay.querySelector('.-desc');

    winnerNameElem.textContent = winner?.name || '';
    winnerDescElem.textContent = winner?.desc || '';
  }

  setParentBattlerName() {
    const allMatch = this.container.querySelectorAll('.BEM-tournament-match');

    [...allMatch].reverse().forEach((match) => {
      const matchSide = match.dataset.side;
      const resultElem = match.querySelector(':scope > .BEM-tournament-result');
      const matchWinnerSide = resultElem.dataset.win;

      if (!matchSide || !matchWinnerSide) return;

      const matchPanel = match.querySelector(':scope > .BEM-tournament-panel');
      const matchPanelWinnerSide = matchPanel.querySelector(`.BEM-tournament-panel_battler.-side${matchWinnerSide}`);
      const matchPanelWinnerEntry = matchPanelWinnerSide.dataset.entry;
      const winnerEntryIndex = Number(matchPanelWinnerEntry);

      const winner = this.app.battlerList[winnerEntryIndex];

      const matchIndex = Number(match.dataset.index);
      const parentMatch = match.closest(`.BEM-tournament-match[data-index='${matchIndex + 1}']`);
      const parentPanel = parentMatch.querySelector(`:scope > .BEM-tournament-panel`);
      const parentSide = parentPanel.querySelector(`.-side${matchSide}`);
      const parentBattlerName = parentSide.querySelector(`.BEM-tournament-panel_battlerName`);

      parentSide.dataset.entry = winnerEntryIndex;
      parentBattlerName.innerText = winner?.name || '';
    });

    this.syncAllBattlerWidth();
  }

  resetAllMatchInfo() {
    this.container.querySelectorAll('.BEM-tournament-match').forEach((match) => {
      this.resetMatchInfo({
        targetPanel: match.querySelector(':scope > .BEM-tournament-panel'),
        targetResult: match.querySelector(':scope > .BEM-tournament-result'),
      });
    });
  }

  resetMatchInfo({ targetPanel = this.targetPanel, targetResult = this.targetResult } = {}) {
    targetResult.dataset.win = '';
    targetPanel.dataset.win = '';
    targetPanel.querySelector('.BEM-tournament-panel_input').checked = false;
    targetResult.querySelector('.BEM-tournament-result_desc').setAttribute('aria-hidden', true);
  }

  resetTournamentWinner() {
    const winnerNameElem = this.winnerDisplay.querySelector('.-name');
    const winnerDescElem = this.winnerDisplay.querySelector('.-desc');

    winnerNameElem.textContent = '';
    winnerDescElem.textContent = '';
  }

  toggleTargetResultDesc() {
    const targetPanel = this.targetMatch.querySelector(':scope > .BEM-tournament-panel');
    const targetResult = this.targetMatch.querySelector(':scope > .BEM-tournament-result');
    const descInputValue = targetPanel.querySelector('.BEM-tournament-panel_input')?.checked;
    const resultDesc = targetResult.querySelector('.BEM-tournament-result_desc');

    resultDesc.setAttribute('aria-hidden', !descInputValue);
  }

  getResultPanelHTML({ depth, matchIndex, battlers }) {
    const battlerA = battlers[0];
    const battlerB = battlers[1];

    const { matchNum, battlerList } = this.app;
    const matchNumText = `第${matchIndex + 1}試合`;
    const dataEntryA = String(battlerA?.entryIndex) ? `data-entry="${battlerA?.entryIndex}"` : '';
    const dataEntryB = String(battlerB?.entryIndex) ? `data-entry="${battlerB?.entryIndex}"` : '';
    let matchLabel = '';

    if (matchNum === depth) {
      matchLabel = '決勝戦';
    } else if (matchNum - 1 === depth) matchLabel = `準決勝 ${matchNumText}`;
    else {
      const labelText = battlerList.length / 2 ** (depth - 1);
      matchLabel = `BEST${labelText} ${matchNumText}`;
    }

    return `
      <div class="BEM-tournament-panel" aria-hidden="true">
        <button class="BEM-tournament-panel_close" tabindex="0"></button>
        <div class="BEM-tournament-panel_matchContainer">
          <div class="BEM-tournament-panel_matchLabel">【${matchLabel}】</div>
          <div class="BEM-tournament-panel_match">
            <div class="BEM-tournament-panel_battler -sideA" ${dataEntryA}>
              <div class="BEM-tournament-panel_battlerName">${battlerA?.name || ''}</div>
              <div class="BEM-tournament-panel_winnerSelect">
                <button>WIN</button>
              </div>
            </div>
            <span class="BEM-tournament-panel_vs">vs</span>
            <div class="BEM-tournament-panel_battler -sideB" ${dataEntryB}>
              <div class="BEM-tournament-panel_battlerName">${battlerB?.name || ''}</div>
              <div class="BEM-tournament-panel_winnerSelect">
                <button>WIN</button>
              </div>
            </div> 
          </div>
        </div>
        <div class="BEM-tournament-panel_option">
          <label>延長戦突入<input type="checkbox" class="BEM-tournament-panel_input"></label>
          <button class="BEM-tournament-panel_reset">RESET</button>
        </div>
      </div>
      `;
  }

  syncAllBattlerWidth() {
    const panels = this.container.querySelectorAll('.BEM-tournament-panel');
    panels.forEach((panel) => this.syncBattlerWidth(panel));
  }

  syncBattlerWidth(panel) {
    const getContentWidth = (el) => {
      const style = getComputedStyle(el);
      return el.offsetWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
    };

    const sideA = panel.querySelector('.-sideA .BEM-tournament-panel_battlerName');
    const sideB = panel.querySelector('.-sideB .BEM-tournament-panel_battlerName');
    if (!sideA || !sideB) return;

    const wasHidden = getComputedStyle(panel).display === 'none';
    if (wasHidden) {
      Object.assign(panel.style, {
        visibility: 'hidden',
        position: 'absolute',
        display: 'block',
      });
    }

    sideA.style.width = sideB.style.width = 'auto';
    const maxWidth = Math.max(getContentWidth(sideA), getContentWidth(sideB));
    sideA.style.width = sideB.style.width = `${maxWidth}px`;

    if (wasHidden) {
      panel.style.removeProperty('visibility');
      panel.style.removeProperty('position');
      panel.style.display = '';
    }
  }
}
