import { exportMedia } from '../../utils/export.js';
import TournamentSetting from './TournamentSetting.js';
import TournamentGenerator from './TournamentGenarator.js';
import TournamentManagerResultPanel from './TournamentResultPanel.js';

const battlerList = [
  { name: '1位', desc: '所属', info: '1位' },
  { name: '2位', desc: '所属', info: '2位' },
  { name: '3位', desc: '所属', info: '3位' },
  { name: '4位', desc: '所属', info: '4位' },
  { name: '5位', desc: '所属', info: '5位' },
  { name: '6位', desc: '所属', info: '6位' },
  { name: '7位', desc: '所属', info: '7位' },
  { name: '8位', desc: '所属', info: '8位' },
  { name: '9位', desc: '所属', info: '9位' },
  { name: '10位', desc: '所属', info: '10位' },
  { name: '11位', desc: '所属', info: '11位' },
  { name: '12位', desc: '所属', info: '12位' },
  { name: '13位', desc: '所属', info: '13位' },
  { name: '14位', desc: '所属', info: '14位' },
  { name: '15位', desc: '所属', info: '15位' },
  { name: '16位', desc: '所属', info: '16位' },
];

export default class TournamentManager {
  constructor({ app, mode = 'random' }) {
    this.app = app;
    this.option = { mode };
    this.battlerList = battlerList;
    this.container = null;
    this.matchNum = 4;
    this.generator = new TournamentGenerator({ tournamentApp: this });
    this.setting = new TournamentSetting({ tournamentApp: this });
    this.resultPanel = new TournamentManagerResultPanel({ tournamentApp: this });
  }

  init() {
    this.generateFrame();
    this.generateSettingUI();
    this.addEvents();
    // this.initTournament();
  }

  initTournament() {
    const existTournament = this.container.querySelector('.BEM-tournament_body');
    if (existTournament) this.container.innerHTML = '';

    this.loadSetting();
    this.fotmatBattlerList();
    this.generateTournament();
  }

  loadSetting() {
    const { eventInfo, battlerList, option } = this.setting.formData;
    this.eventInfo = eventInfo;
    this.battlerList = battlerList;
    this.option = option;

    console.log('loaded', this.setting.formData);
  }

  generateFrame() {
    const html = `
    <div class="BEM-tournament-frame">
      <div class="BEM-tournament-frame_head">
        <div class="BEM-tournament-frame_title">Tournament Generator</div>
      </div>
      <div class="BEM-tournament-frame_body">
        <div class="BEM-tournament-setting"></div>
        <div class="BEM-tournament" data-generated="false">
          <div class="BEM-tournament_empty-message">まずはトーナメントを生成しましょう！</div>
        </div>
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
  }

  generateSettingUI() {
    const html = this.setting.getSettingHTML();

    this.settingUI = this.app.container.querySelector('.BEM-tournament-setting');
    this.settingUI.innerHTML = html;
    this.form = this.settingUI.querySelector('form');
    this.setting.addSettingEvents();
  }

  addEvents() {
    this.resultPanel.addEvents();

    const handleClick = (e) => {
      const isMatch = (selector) => e.target.matches(selector);

      if (isMatch('.BEM-tournament-result')) return this.onClickTournamentResult(e);
      if (isMatch('.BEM-tournament-PDFControl_button')) return this.exportToPDF();
      if (isMatch('.BEM-tournament-option_reset')) return this.onClickOptionReset();
    };

    document.addEventListener('click', handleClick);
  }

  onClickTournamentResult(e) {
    this.resultPanel.updateTargetByEvent(e);
    this.resultPanel.togglePanel();
  }

  onClickOptionReset() {
    this.resultPanel.resetAllMatchInfo();
    this.resultPanel.resetTournamentWinner();
    this.resultPanel.hidePanel();
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

    this.container.insertAdjacentHTML('beforeend', this.getTournamentBodyHTML());

    this.container.dataset.generated = true;

    if (this.matchNum === 3) {
      this.container.style.setProperty('--battler-gap', '56px');
      this.container.style.setProperty('--match-width', '56px');
      this.container.style.setProperty('--battler-height', '72px');
    }

    this.resultPanel.syncAllBattlerWidth();
  }

  getTournamentBodyHTML() {
    let battlers = [];

    if (this.option.mode === 'seed') {
      battlers = this.generator
        .getTournamentSeedOrder()
        .map((i) => this.battlerList[i - 1])
        .reverse();
    } else if (this.option.mode === 'random') {
      battlers = this.generator.getTournamentRandomOrder();
    } else {
      battlers = [...this.battlerList];
    }

    return this.generator.generateHTML(battlers, this.matchNum);
  }

  fotmatBattlerList() {
    this.battlerList = this.battlerList.map((battler, index) => {
      return { ...battler, entryIndex: index };
    });
    this.checkBattlerLength();
  }

  exportToPDF() {
    const format = this.matchNum < 5 ? 'a4' : 'a3';
    const orientation = this.matchNum < 5 ? 'landscape' : 'portrait';
    const target = document.querySelector('.BEM-tournament');

    this.container.classList.add('-html2pdf', `-${orientation}`);
    const handler = () => {
      document.querySelector('.BEM-tournament-option').style.display = '';
      this.container.classList.remove('-html2pdf');
    };

    document.querySelector('.BEM-tournament-option').style.display = 'none';

    const option = {
      margin: 0,
      filename: 'tournament.pdf',
      image: { type: 'png', quality: 0.8 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format, orientation },
    };

    exportMedia.htmlToPDF({ target, option, handler });
  }
}
