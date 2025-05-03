import html2pdf from 'https://cdn.skypack.dev/html2pdf.js';
import TournamentManagerResultPanel from './TournamentResultPanel.js';

const battlerList = [
  { name: 'SHUHO', desc: '( 所属 )', info: '1位' },
  { name: 'Kenta "C" Terany', desc: '( 所属 )', info: '2位' },
  { name: '3位', desc: '( 所属 )', info: '3位' },
  { name: '4位', desc: '( 所属 )', info: '4位' },
  { name: '5位', desc: '( 所属 )', info: '5位' },
  { name: '6位', desc: '( 所属 )', info: '6位' },
  { name: '7位', desc: '( 所属 )', info: '7位' },
  { name: '8位', desc: '( 所属 )', info: '8位' },
  { name: '9位', desc: '( 所属 )', info: '9位' },
  { name: '10位', desc: '( 所属 )', info: '10位' },
  { name: '11位', desc: '( 所属 )', info: '11位' },
  { name: '12位', desc: '( 所属 )', info: '12位' },
  { name: '13位', desc: '( 所属 )', info: '13位' },
  { name: '14位', desc: '( 所属 )', info: '14位' },
  { name: '15位', desc: '( 所属 )', info: '15位' },
  { name: '16位', desc: '( 所属 )', info: '16位' },
];

export default class TournamentManager {
  constructor({ app, mode = 'random' }) {
    this.app = app;
    this.mode = mode;
    this.battlerList = battlerList;
    this.container = null;
    this.matchNum = null;
    this.resultPanel = new TournamentManagerResultPanel({ tournamentApp: this });
  }

  init() {
    this.checkBattlerLength();
    this.generateTournament();
    this.addEvents();
  }

  addEvents() {
    this.resultPanel.addResultPanelEvent();

    document.addEventListener('click', (e) => {
      const hasClassName = (className) => e.target.classList.contains(className);
      if (hasClassName('BEM-tournament-result')) this.onClickTournamentResult(e);
      else if (hasClassName('BEM-tournament-PDFControl_button')) this.exportToPDF();
    });
  }

  onClickTournamentResult(e) {
    this.resultPanel.updateTargetByEvent(e);
    this.resultPanel.togglePanel();
  }

  checkBattlerLength() {
    const isPowerOfTwo = (num) => num > 0 && (num & (num - 1)) === 0;
    if (!isPowerOfTwo(this.battlerList.length)) this.fillBattlerListItem();
    this.matchNum = Math.log2(this.battlerList.length);
  }

  fillBattlerListItem() {
    const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(this.battlerList.length)));
    const missing = nextPowerOfTwo - this.battlerList.length;
    for (let i = 0; i < missing; i++) {
      this.battlerList.push({ name: '', desc: '', info: '' });
    }
  }

  generateTournament() {
    if (this.matchNum < 2) {
      console.warn('参加者が不足しています。');
      return;
    }

    const html = `
    <div class="BEM-tournament-frame">
      <div class="BEM-tournament-frame_head">
        <div class="BEM-tournament-frame_title">Tournament Generator</div>
      </div>
      <div class="BEM-tournament-frame_body BEM-tournament">
        ${this.getTournamentBodyHTML()}
      </div>
      <div class="BEM-tournament-frame_foot">
        <div class="BEM-tournament-frame_PDFControl BEM-tournament-PDFControl">
          <button class="BEM-tournament-PDFControl_button">PDF出力</button>
        </div>
      </div>
    </div>
    `;
    this.app.container.insertAdjacentHTML('beforeend', html);
    this.container = this.app.container.querySelector('.BEM-tournament');

    this.resultPanel.syncBattlerWidth();
  }

  getMatchTree(battlers) {
    const depthCounters = {};

    const queue = battlers.map((battler, index) => ({
      id: crypto.randomUUID(),
      player: battler,
      children: null,
      depth: 0,
      matchIndex: index,
    }));

    depthCounters[0] = battlers.length;

    while (queue.length > 1) {
      const left = queue.shift();
      const right = queue.shift();

      const parentDepth = Math.max(left.depth, right.depth) + 1;

      if (depthCounters[parentDepth] === undefined) {
        depthCounters[parentDepth] = 0;
      }

      const parent = {
        id: crypto.randomUUID(),
        children: [left, right],
        depth: parentDepth,
        matchIndex: depthCounters[parentDepth],
      };

      depthCounters[parentDepth]++;

      queue.push(parent);
    }

    return queue[0];
  }

  getTournamentBodyHTML() {
    const arranged =
      this.mode === 'ranking'
        ? this.getTournamentSeedOrder()
            .map((i) => this.battlerList[i - 1])
            .reverse()
        : [...this.battlerList];

    const matchTree = this.getMatchTree(arranged);

    return `<div class="BEM-tournament_body">${this.getMatchHTML(matchTree, this.matchNum)}</div>`;
  }

  getMatchHTML(node, depth) {
    if (!node) return '';

    const isFinal = depth === this.matchNum;

    if (!node.children) {
      const player = node.player || {};
      return `
        <div class="BEM-tournament-bracket">
          <div class="BEM-tournament-bracket_info">${player.info}</div>
          <div class="BEM-tournament-bracket_container">
            <span class="-name">${player.name}</span>
            <span class="-desc">${player.desc}</span>
          </div>
        </div>
      `;
    }

    const childrenHTML = node.children
      .map((child) => {
        const html = this.getMatchHTML(child, depth - 1);
        return isFinal ? `<div class="BEM-tournament-block">${html}</div>` : html;
      })
      .join('');

    const battlerA = node.children[0]?.player?.name || 'A';
    const battlerB = node.children[1]?.player?.name || 'B';

    return `
      <div class="BEM-tournament-match" data-index="${depth}" data-id="${node.id}">
        <div class="BEM-tournament-match_bracket">
          ${childrenHTML}
        </div>

        <div class="BEM-tournament-match_result BEM-tournament-result" data-id="${node.id}">
          <div class="BEM-tournament-result_side -sideA"></div>
          <div class="BEM-tournament-result_desc" aria-hidden="true">延<br>長</div>
          <div class="BEM-tournament-result_side -sideB"></div>
          ${
            isFinal
              ? `
            <div class="BEM-tournament-result_winner">
              <span class="-name"></span><span class="-desc"></span>
            </div>`
              : ''
          }
        </div>

        ${this.resultPanel.getResultPanelHTML({ depth, matchIndex: node.matchIndex, battlerA, battlerB })}
      </div>
    `;
  }

  getTournamentSeedOrder() {
    const buildSeeds = (size) => {
      if (size === 1) return [1];
      const prev = buildSeeds(size / 2);
      return prev.flatMap((i) => [i, size + 1 - i]);
    };
    return buildSeeds(this.battlerList.length);
  }

  exportToPDF() {
    const format = this.matchNum < 5 ? 'a4' : 'a3';
    const orientation = this.matchNum < 5 ? 'landscape' : 'portrait';
    const targetElem = document.querySelector('.BEM-tournament-frame');

    this.container.classList.add('-html2pdf', `-${orientation}`);
    const opt = {
      margin: 0,
      filename: 'tournament.pdf',
      image: { type: 'jpg', quality: 0.8 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format, orientation },
    };
    html2pdf()
      .set(opt)
      .from(targetElem)
      .save()
      .then(() => {
        this.container.classList.remove('-html2pdf');
      });
  }
}
