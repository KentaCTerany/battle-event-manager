import { getFormatedDate } from '../../utils/date.js';

export default class TournamentSetting {
  constructor({ tournamentApp }) {
    this.app = tournamentApp;
    this.form = null;
    this.formData = {};
  }

  addSettingEvents() {
    this.form = this.app.form;
    this.form.addEventListener('submit', this.onSubmitForm.bind(this));
  }

  onSubmitForm(e) {
    e.preventDefault();
    this.updateFormData();
  }

  async updateFormData() {
    await this.updateEventInfoData();
    this.updateTournamentOptionData();
    this.updateBattlerListData();
    this.app.initTournament();
  }

  async updateEventInfoData() {
    const eventTextElem = this.form.querySelector('[name="event-text"]');
    const eventDateElem = this.form.querySelector('[name="event-date"]');
    const eventImgElem = this.form.querySelector('[name="event-image"]');

    this.formData.eventInfo = {
      text: eventTextElem.value,
      date: eventDateElem.value,
      image: await this.readImageAsDataURL(eventImgElem),
    };
  }

  updateTournamentOptionData() {
    const optionModeElem = this.form.querySelector('[name="option-mode"]:checked');

    this.formData.option = {
      mode: optionModeElem.value,
    };
  }

  updateBattlerListData() {
    const battlerElems = this.form.querySelectorAll('[name^="entry"]');

    this.formData.battlerList = [];

    battlerElems.forEach((elem) => {
      const replacedName = elem.name.replace('entry', '');
      const entryKey = replacedName.substr(replacedName.indexOf('-') + 1);
      const entryIndex = Number(replacedName.substr(0, replacedName.indexOf('-')));

      if (!this.formData.battlerList?.[entryIndex]) this.formData.battlerList[entryIndex] = {};
      this.formData.battlerList[entryIndex][entryKey] = String(elem.value) || '';
    });
  }

  getSettingHTML() {
    return `
      <form id="tournament-setting">
        <div class="BEM-tournament-setting_container">
          <div class="BEM-tournament-setting_eventInfo">
            ${this.getEventInfoSettingHTML()}
          </div>
          <div class="BEM-tournament-setting_matchNum">
            ${this.getMatchNumSettingHTML()}
          </div>
          <div class="BEM-tournament-setting_option">
            ${this.getOptionSettingHTML()}
          </div>
        </div>
        <div class="BEM-tournament-setting_container">
          <div class="BEM-tournament-setting_entry">
            ${this.getEntrySettingHTML()}
          </div>
        </div>
      </form>
      <div class="BEM-tournament-setting_submitContainer">
        <button type="submit" form="tournament-setting">生成</button>
      </div>
      `;
  }

  getEventInfoSettingHTML() {
    const defaultDate = getFormatedDate();

    return `
      <h2>イベント情報</h2>
      <ul>
        <li>
          <label>テキスト: <input type="text" name="event-text" value="イベント名 / 部門名"></label>
          <p>トーナメント表の上部に出力されます。<br>イベント名や部門名などを想定しています。</p>
        </li>
        <li>
          <label>イベント日付: <input type="date" name="event-date" value="${defaultDate}"></label>
          <p>ロゴの下に生成されます。<br>イベントの開催日を入力します。</p>
        </li>
        <li>
          <label>イベントロゴなど: <input type="file" name="event-image" accept="image/*"></label>
          <p>トーナメント表の下部に出力されます。<br>イベントのロゴなどを想定しています。</p>
        </li>
      </ul>
    `;
  }

  getMatchNumSettingHTML() {
    return `
      <h2>エントリー数</h2>
      エントリー数を調整するUI
    `;
  }

  getOptionSettingHTML() {
    return `
      <h2>トーナメントの組み方</h2>
      <ul>
        <li>
          <input id="option-mode_seed" type="radio" name="option-mode" value="seed" checked>
          <label for="option-mode_seed">シード方式（高い順位と低い順位が対戦する形式）</label>
        </li>
        <li>
          <input id="option-mode_random" type="radio" name="option-mode" value="random">
          <label for="option-mode_random">ランダム方式（ランダムに位置が決まる形式）</label>
        </li>
        <li>
          <input id="option-mode_raw" type="radio" name="option-mode" value="raw">
          <label for="option-mode_raw">設定なし（入力順に出力されます）</label>
        </li>
      </ul>
    `;
  }

  getEntrySettingHTML() {
    const entryFormLength = 2 ** this.app.matchNum;

    return `
      <h2>エントリーリスト</h2>
      <ol>
        ${[...Array(entryFormLength)]
          .map(
            (_, index) => `
            <li>
              <label>名前: <input type="text" name="entry${index}-name"></label>
              <label>情報: <input type="text" name="entry${index}-desc"></label>
              <label>備考: <input type="text" name="entry${index}-info" value="${index + 1}位"></label>
            </li>
          `
          )
          .join('')}
      </ol>
    `;
  }

  async readImageAsDataURL(inputElement) {
    const file = inputElement.files?.[0];
    if (!file) return false;

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));

      reader.readAsDataURL(file);
    });
  }
}
