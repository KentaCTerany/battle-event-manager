import { setDebugMode } from './debug.js';
import BattleEventManagerDOM from './dom.js';
import BattleEventManagerMode from './mode.js';
import PrelimManager from './Prelim/Prelim.js';
import TournamentManager from './Tournament/Tournament.js';
import Storage from './storage.js';
import RankingManager from './Ranking/Ranking.js';
import { PDFReader } from '../utils/pdfReader.js';

setDebugMode();

export default class BattleEventManager {
  constructor() {
    this.cs = window.BEM_app.debug.cs;
    this.setup = false;
    this.mode = 0;
    this.name = 'BEM-app';
    this.dom = new BattleEventManagerDOM({ app: this });
    this.mode = new BattleEventManagerMode({ app: this });
    this.prelim = new PrelimManager({ app: this });
    this.ranking = new RankingManager({ app: this });
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
      if (isMatch('.--clear-logo')) return this.onClickClearLogo(e);
    };

    const handleChange = (e) => {
      const isMatch = (selector) => e.target.matches(selector);
      if (isMatch('input[name="event-logo"]')) return this.onChangeEventLogo(e);
      if (isMatch('input[name="entry-list-pdf"]')) return this.onChangePDFFile(e);
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('change', handleChange);
    this.mode.addEvents();
    this.prelim.addEvents();
    this.tournament.addEvents();
  }

  async onChangeEventLogo(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await this.convertImageToBase64(file);
      this.updateEventData({ logo: base64 });
      this.mode.render();
    } catch (error) {
      console.error('画像のアップロードに失敗しました:', error);
    }
  }

  onClickClearLogo(e) {
    this.updateEventData({ logo: null });
    this.mode.render();
  }

  convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async onChangePDFFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      console.log('PDFファイル読み込み開始:', file.name);
      const pdfReader = new PDFReader();
      const entries = await pdfReader.readPDF(file);
      console.log('解析されたエントリー:', entries);

      if (!entries || entries.length === 0) {
        throw new Error('エントリーを抽出できませんでした');
      }

      // エントリーリストのフォームに反映
      const settings = document.querySelector('.BEM-app-event-setting');
      const battlerContainer = settings.querySelector('.BEM-app-event-setting__battler ul');

      // 既存のエントリーをクリア（ヘッダー行は残す）
      const headerRow = battlerContainer.querySelector('li.--head');
      battlerContainer.innerHTML = '';
      battlerContainer.appendChild(headerRow);

      // 新しいエントリーを追加
      entries.forEach((entry, index) => {
        console.log(`エントリー ${index + 1} を追加:`, entry);
        const html = `
          <li class="--battler">
            <span class="--index">${index + 1}</span>
            <input type="text" name="battler-name" value="${entry.name.replace(/"/g, '&quot;')}">
            <input type="text" name="battler-desc" value="${entry.desc.replace(/"/g, '&quot;')}">
            <input type="text" name="battler-info" value="${entry.info.replace(/"/g, '&quot;')}">
            <button class="BEM-app-event-setting__battler-delete"></button>
          </li>`;
        battlerContainer.insertAdjacentHTML('beforeend', html);
      });

      console.log('エントリーの追加が完了しました');
    } catch (error) {
      console.error('PDFの読み込みエラー:', error);
      alert(`PDFの読み込みに失敗しました。\nエラー: ${error.message}`);
    }
  }

  onClickEventSetup() {
    const settings = document.querySelector('.BEM-app-event-setup');
    const eventName = settings.querySelector('input[name="event-name"]').value;
    const eventDate = settings.querySelector('input[name="event-date"]').value;
    const eventVenue = settings.querySelector('input[name="event-venue"]').value;
    const eventSubName = settings.querySelector('input[name="event-sub-name"]').value;
    const id = crypto.randomUUID();

    if (!eventName) {
      settings.querySelector('.--form-alert-message').innerHTML = '入力してください';
      return;
    }

    this.updateEventData({ id, name: eventName, date: eventDate, venue: eventVenue, subName: eventSubName });

    this.setup = true;
    this.mode.stateIndex = 0;
    this.mode.render();
  }

  onClickEventSetting() {
    const settings = document.querySelector('.BEM-app-event-setting');
    const eventName = settings.querySelector('input[name="event-name"]').value;
    const eventDate = settings.querySelector('input[name="event-date"]').value;
    const eventVenue = settings.querySelector('input[name="event-venue"]').value;
    const eventSubName = settings.querySelector('input[name="event-sub-name"]').value;

    if (!eventName) {
      settings.querySelector('.--form-alert-message').innerHTML = '入力してください';
      return;
    }

    // バトラーリストの更新処理
    const battlerList = [];
    settings.querySelectorAll('.--battler').forEach((battler, index) => {
      const name = battler.querySelector('input[name="battler-name"]').value;
      const desc = battler.querySelector('input[name="battler-desc"]').value;
      const info = battler.querySelector('input[name="battler-info"]').value;

      // 少なくとも名前が入力されている場合のみ追加
      if (name) {
        battlerList.push({ name, desc, info });
      }
    });

    this.updateEventData({
      name: eventName,
      date: eventDate,
      venue: eventVenue,
      subName: eventSubName,
      battlerList: battlerList,
    });
  }

  updateEventData(newData = {}) {
    // 現在のデータと新しいデータをマージ
    this.eventData = {
      ...this.eventData, // 既存のデータを展開
      ...newData, // 新しいデータで上書き
    };

    // ナビゲーションの更新
    const navElem = document.querySelector('.BEM-app-side-nav');
    if (navElem) navElem.remove();
    this.mode.container.insertAdjacentHTML('beforebegin', this.dom.getNavHTML());

    // データの保存
    this.storage.save({
      eventData: this.eventData,
      stateIndex: this.mode.stateIndex,
    });

    // デバッグログ
    this.cs.log('イベントデータを更新:', this.eventData);
  }

  generateVariableScript() {
    const html2pdfScriptElem = document.createElement('script');
    html2pdfScriptElem.setAttribute('src', '/js/lib/html2pdf.bundle.min.js');

    document.body.insertAdjacentElement('beforeend', html2pdfScriptElem);
  }
}
