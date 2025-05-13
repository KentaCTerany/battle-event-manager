export default class TournamentSetting {
  constructor({ tournamentApp }) {
    this.app = tournamentApp;
  }

  addSettingEvents() {
    // const bindEvents = (array, event, handler) => array.forEach((elem) => elem.addEventListener(event, handler.bind(this)));
    this.form = this.app.form;
    this.form.addEventListener('submit', this.onSubmitForm.bind(this));
    // bindEvents(descInputs, 'change', this.onChangePanelCheckbox);
  }

  onSubmitForm(e) {
    e.preventDefault();

    const inputs = this.form.querySelectorAll('input');
    const formData = {
      battlerList: [],
    };

    inputs.forEach((input) => {
      if (input.name.includes('entry')) {
        const replacedName = input.name.replace('entry', '');
        const entryKey = replacedName.substr(replacedName.indexOf('-') + 1);
        const entryIndex = Number(replacedName.substr(0, replacedName.indexOf('-')));

        if (!formData.battlerList[entryIndex]) formData.battlerList[entryIndex] = {};
        formData.battlerList[entryIndex][entryKey] = String(input.value) || '';
      } else if (input.name.includes('mode')) {
        if (!input.checked) return;
        formData.mode = input.value;
      } else {
        formData[input.name] = input.value.trim();
      }
    });

    this.formData = formData;

    this.app.battlerList = this.formData.battlerList;
    this.app.mode = this.formData.mode;
    this.app.initTournament();
  }

  updateBattlerList() {}

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
    return `
      <h2>イベント情報</h2>
      <ul>
        <li>
          <label>テキスト: <input type="text" name="eventText"></label>
          <p>トーナメント表の上部に出力されます。<br>イベント名や部門名などを想定しています。</p>
        </li>
        <li>
          <label>イベント日付: <input type="date" name="eventDate"></label>
          <p>ロゴの下に生成されます。<br>イベントの開催日を入力します。</p>
        </li>
        <li>
          <label>イベントロゴなど: <input type="file" name="image" accept="image/*"></label>
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
}
