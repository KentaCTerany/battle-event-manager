export default class TournamentManagerResultPanel {
  constructor({ tournamentApp }) {
    this.tournamentApp = tournamentApp;
    this.container = document.getElementById('battleEventManager');
    this.target = null;
  }

  addResultPanelEvent() {
    const addEventsToElements = (array, event, fn) => array.forEach((elem) => elem.addEventListener(event, fn));
    const closeButtons = this.container.querySelectorAll('.BEM-tournament-panel_close');
    const panelButtons = this.container.querySelectorAll('.BEM-tournament-panel_winnerSelect button');
    const descInputs = this.container.querySelectorAll('.BEM-tournament-panel_input');
    const resetButtons = this.container.querySelectorAll('.BEM-tournament-panel_reset');

    addEventsToElements(closeButtons, 'click', this.onClickCloseButton.bind(this));
    addEventsToElements(panelButtons, 'click', this.onClickPanelButton.bind(this));
    addEventsToElements(resetButtons, 'click', this.onClickPanelResetButton.bind(this));
    addEventsToElements(descInputs, 'change', this.onChangePanelCheckbox.bind(this));
  }

  onClickCloseButton(e) {
    this.hidePanel();
  }

  onClickPanelButton(e) {
    this.updateTargetByEvent(e);

    const battlerElem = this.target.closest('.BEM-tournament-panel_battler');
    const isSideA = battlerElem.classList.contains('-sideA');

    this.setPanelWin({ isSideA });
    this.setTournamentWinner({ isSideA });
  }

  onClickPanelResetButton(e) {
    this.updateTargetByEvent(e);
    this.resetMatchInfo();
    this.resetTournamentWinner();
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
    const targetPanel = this.targetMatch.querySelector(':scope > .BEM-tournament-panel');
    targetResult.dataset.win = isSideA ? 'A' : 'B';
    targetPanel.dataset.win = isSideA ? 'A' : 'B';
  }

  setTournamentWinner({ isSideA = true }) {
    const winnerDisplay = this.targetMatch.querySelector('.BEM-tournament-result_winner');

    if (!winnerDisplay) return;

    const winnerNameElem = winnerDisplay.querySelector('.-name');
    const winnerDescElem = winnerDisplay.querySelector('.desc');

    const sideSelector = isSideA ? '.-sideA' : '.-sideB';
    const targetPanel = this.targetMatch.querySelector(':scope > .BEM-tournament-panel');
    const winnerText = targetPanel.querySelector(`.BEM-tournament-panel_battler${sideSelector} .BEM-tournament-panel_battlerName`).textContent;

    winnerNameElem.textContent = winnerText;
  }

  resetMatchInfo() {
    const targetPanel = this.targetMatch.querySelector(':scope > .BEM-tournament-panel');
    const descInput = targetPanel.querySelector('.BEM-tournament-panel_input');
    const targetResult = this.targetMatch.querySelector(':scope > .BEM-tournament-result');
    const resultDesc = targetResult.querySelector('.BEM-tournament-result_desc');

    targetResult.dataset.win = '';
    targetPanel.dataset.win = '';
    descInput.checked = false;
    resultDesc.setAttribute('aria-hidden', true);
  }

  resetTournamentWinner() {
    const winnerDisplay = this.targetMatch.querySelector('.BEM-tournament-result_winner');

    if (!winnerDisplay) return;

    const winnerNameElem = winnerDisplay.querySelector('.-name');
    const winnerDescElem = winnerDisplay.querySelector('.desc');

    winnerNameElem.textContent = '';
    winnerDescElem.textContent = '';
  }

  toggleResultDesc() {
    const targetPanel = this.targetMatch.querySelector(':scope > .BEM-tournament-panel');
    const targetResult = this.targetMatch.querySelector(':scope > .BEM-tournament-result');
    const descInputValue = targetPanel.querySelector('.BEM-tournament-panel_input')?.checked;
    const resultDesc = targetResult.querySelector('.BEM-tournament-result_desc');

    resultDesc.setAttribute('aria-hidden', !descInputValue);
  }

  getResultPanelHTML({ depth, matchIndex, battlerA, battlerB }) {
    const { matchNum } = this.tournamentApp;
    const matchNumText = `第${matchIndex + 1}試合`;
    let matchLabel = '';

    if (matchNum === depth) matchLabel = '決勝戦';
    else if (matchNum - 1 === depth) matchLabel = `準決勝 ${matchNumText}`;
    else {
      const labelText = matchNum ** 2 / depth;
      matchLabel = `BEST${labelText} ${matchNumText}`;
    }

    console.log({ depth, matchIndex, battlerA, battlerB });

    return `
      <div class="BEM-tournament-panel" aria-hidden="true">
        <button class="BEM-tournament-panel_close" tabindex="0"></button>
        <div class="BEM-tournament-panel_matchContainer">
          <div class="BEM-tournament-panel_matchLabel">【${matchLabel}】</div>
          <div class="BEM-tournament-panel_match">
            <div class="BEM-tournament-panel_battler -sideA">
              <div class="BEM-tournament-panel_battlerName">${battlerA}</div>
              <div class="BEM-tournament-panel_winnerSelect">
                <button>WIN</button>
              </div>
            </div>
            <span class="BEM-tournament-panel_vs">vs</span>
            <div class="BEM-tournament-panel_battler -sideB">
              <div class="BEM-tournament-panel_battlerName">${battlerB}</div>
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

  syncBattlerWidth() {
    const panels = this.container.querySelectorAll('.BEM-tournament-panel');

    panels.forEach((panel) => {
      const sideA = panel.querySelector('.-sideA .BEM-tournament-panel_battlerName');
      const sideB = panel.querySelector('.-sideB .BEM-tournament-panel_battlerName');

      if (!sideA || !sideB) return;

      // 非表示状態なら一時表示
      const wasHidden = getComputedStyle(panel).display === 'none';

      if (wasHidden) {
        panel.style.visibility = 'hidden';
        panel.style.position = 'absolute';
        panel.style.display = 'block';
      }

      // 一旦リセット
      sideA.style.width = 'auto';
      sideB.style.width = 'auto';

      // 内容の幅を取得（paddingを引く）
      const getContentWidth = (el) => {
        const style = getComputedStyle(el);
        const paddingLeft = parseFloat(style.paddingLeft) || 0;
        const paddingRight = parseFloat(style.paddingRight) || 0;
        return el.offsetWidth - paddingLeft - paddingRight;
      };

      const widthA = getContentWidth(sideA);
      const widthB = getContentWidth(sideB);
      const maxContentWidth = Math.max(widthA, widthB);

      sideA.style.width = `${maxContentWidth}px`;
      sideB.style.width = `${maxContentWidth}px`;

      // 元に戻す
      if (wasHidden) {
        panel.style.removeProperty('visibility');
        panel.style.removeProperty('position');
        panel.style.display = '';
      }
    });
  }
}
