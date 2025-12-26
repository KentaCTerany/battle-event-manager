export default class BattleEventManagerDOM {
  constructor({ app }) {
    this.app = app;
    this.name = app.name;
    this.cs = app.cs;
  }

  build() {
    this.cs.log('build');
    this.buildHeader();
    this.buildMain();
  }

  buildHeader() {
    const { name } = this;
    const headerName = `${name}-header`;
    const html = `
      <header class="${name}__header ${headerName}">
        <h1 class="${headerName}__heading">Battle Event Manager</h1>
        <div class="${headerName}__logo">
          <img src="/img/common/logo.svg" alt="Battle Event Manager"/>
        </div>
      </header>
    `;

    document.body.insertAdjacentHTML('afterbegin', html);
    this.header = document.querySelector(`.${headerName}`);
  }

  buildMain() {
    const { name } = this;
    const mainName = `${name}-main`;
    const html = `
      <main id="${name}" class="${name}__main ${mainName}">        
        <div class="${mainName}__frame"></div>
      </main>
    `;

    this.header.insertAdjacentHTML('afterend', html);
    this.container = document.querySelector(`#${name}`);
  }

  getSetupHTML() {
    const { name } = this;
    const settingName = `${name}-event-setup`;

    return `
      <div class="${settingName}">
        <h2>イベント作成</h2>
        <fieldset>
          <legend>基本情報</legend>
          <label>
            <span>イベント名<span class="--form-alert">（必須）</span></span>
            <input type="text" name="event-name" placeholder="Battle Event vol.3">
            <span class="--form-alert-message"></span>
          </label>
          <label>
            <span>部門名など</span>
            <input type="text" name="event-sub-name" placeholder="1on1 freestyle side">
          </label>
          <label><span>日付</span><input type="Date" placeholder="" name="event-date"></label>
          <label><span>場所</span><input type="text" placeholder="ZAPP TOKYO" name="event-venue"></label>
        </fieldset>

        <button class="${settingName}__button">イベント作成</button>
      </div>
    `;
  }

  getEventSettingHTML() {
    const { name, app } = this;
    const { eventData } = app;
    const settingName = `${name}-event-setting`;

    return `
      <h2>イベント設定</h2>
      <div class="${settingName}">
        <fieldset>
          <legend>基本情報</legend>
          <label>
            <span>イベント名<span class="--form-alert">（必須）</span></span>
            <input type="text" name="event-name" value="${eventData.name ?? ''}" placeholder="Battle Event vol.3">
            <span class="--form-alert-message"></span>
          </label>
          <label>
            <span>部門名など</span>
            <input type="text" name="event-sub-name" value="${eventData.subName ?? ''}" placeholder="1on1 freestyle side">

          </label>
          <label><span>日付</span><input type="Date" placeholder="" name="event-date" value="${eventData.date ?? ''}"></label>
          <label><span>場所</span><input type="text" placeholder="ZAPP TOKYO" name="event-venue" value="${eventData.venue ?? ''}"></label>
          <label class="--logo-upload">
            <span>イベントロゴ（各種PDFに使用されます）</span>
            <div class="--preview">
              ${eventData.logo ? `<img src="${eventData.logo}" alt="イベントロゴ">` : ''}
            </div>
            <div class="--input-group">
              <input type="file" name="event-logo" accept="image/*">
              ${eventData.logo ? `<button class="--clear-logo">削除</button>` : ''}
            </div>
          </label>
        </fieldset>
        <fieldset>
          <legend>エントリーリストのインポート</legend>
          <label>
            <span>PDFファイルからインポート</span>
            <div class="--input-group">
              <input type="file" name="entry-list-pdf" accept=".pdf">
              <small>※ PDFファイルから参加者情報を読み込みます</small>
            </div>
          </label>
        </fieldset>
        ${this.getBattlerSettingHTML(settingName)}
        <button class="${settingName}__button">更新</button>
      </div>
    `;
  }

  getBattlerSettingHTML(settingName) {
    const defaultBattlerLength = 8;
    const { battlerList: savedBattlerList } = this.app.storage.savedData.eventData;
    const existSaved = savedBattlerList?.some((b) => b);

    // 保存されているバトラー数とデフォルトの数を比較して、大きい方を使用
    const targetLength = existSaved ? Math.max(defaultBattlerLength, savedBattlerList.length) : defaultBattlerLength;

    // 必要に応じて空オブジェクトで補完
    const battlers = existSaved ? [...savedBattlerList, ...Array(targetLength - savedBattlerList.length).fill({})] : Array(defaultBattlerLength).fill({});

    const createBattlerItem = (battler, index) => `
    <li class="--battler">
      <span class="--index">${index + 1}</span>
      <input type="text" name="battler-name" value="${battler?.name ?? ''}" ${!index ? `placeholder="参加者名"` : ''}>
      <input type="text" name="battler-desc" value="${battler?.desc ?? ''}" ${!index ? `placeholder="ジャンル・所属など"` : ''}>
      <input type="text" name="battler-info" value="${battler?.info ?? ''}" ${!index ? `placeholder="補足情報"` : ''}>
      <button class="${settingName}__battler-delete"></button>
    </li>
  `;

    const battlerFlamesHTML = battlers.slice(0, targetLength).map(createBattlerItem).join('');

    return `
    <fieldset class="${settingName}__battler">
      <legend>参加者情報</legend>
      <label>
        <ul>
          <li class="--head">
            <span></span>
            <span>名前</span>
            <span>情報1</span>
            <span>情報2</span>
          </li>
          ${battlerFlamesHTML}
        </ul>
        <button class="${settingName}__battler-add"></button>
      </label>
    </fieldset>
  `;
  }

  addBattler() {
    const { name } = this;
    const settingName = `${name}-event-setting`;
    const battlerContainer = document.querySelector(`.${settingName}__battler`);

    if (!battlerContainer) return;

    const ul = battlerContainer.querySelector('ul');
    const lastIndex = Number(ul.querySelector('li:last-child .--index').innerText);
    const html = `
        <li class="--battler">
          <span class="--index">${lastIndex + 1}</span>
          <input type="text" name="battler-name" value="">
          <input type="text" name="battler-desc" value="">
          <input type="text" name="battler-info" value="">
          <button class="${settingName}__battler-delete"></button>
        </li>`;

    ul.insertAdjacentHTML('beforeend', html);
  }

  getPrelimHTML() {
    const { name, app } = this;
    const { eventData, prelim } = app;
    const prelimName = `${name}-prelim`;

    return `
      <div class="${prelimName}">
        <h2>予選表作成</h2>
        ${prelim.html}
      </div>
    `;
  }

  getRankingHTML() {
    const { name, app } = this;
    const { eventData, ranking } = app;
    const rankingName = `${name}-ranking`;

    return `
      <div class="${rankingName}">
        <h2>順位表作成</h2>
        ${ranking.html}
      </div>
    `;
  }

  getTournamentHTML() {
    const { name, app } = this;
    const { eventData, tournament } = app;
    const tournamentName = `${name}-tournament`;

    return `
      <div class="${tournamentName}">
        <h2>トーナメント表作成</h2>
        ${tournament.html}
      </div>
    `;
  }

  getNavHTML() {
    const { name, app } = this;
    const { eventData } = app;
    const navName = `${name}-side-nav`;
    const navItems = [
      { name: 'イベント設定', mode: 'event-setting' },
      { name: '予選表作成', mode: 'prelim' },
      { name: '順位表作成', mode: 'ranking' },
      { name: 'トーナメント作成', mode: 'tournament' },
    ];
    const dataSepalator = eventData.date && eventData.venue ? '/' : '';

    this.cs.log(eventData);
    return `
      <nav class="${navName}">
        <ul>
          <li>
            <dl class="${navName}__event-board">
              <dd class="--id">${eventData.id}</dd>
              <dt class="--name">${eventData.name}</dt>
              ${eventData.subName ? `<dt class="--sub-name">${eventData.subName}</dt>` : ''}
              <dd>${eventData.date} ${dataSepalator} ${eventData.venue ? `@${eventData.venue}` : ''}</dd>
            </dl>
          </li>
          ${navItems.map(({ name, mode }, index) => `<li><button class="${index === app.mode.stateIndex ? '--active' : ''}" data-state-index="${index}" data-mode="${mode}">${name}</button></li>`).join('')}
        </ul>
      </nav>
    `;
  }

  getHomeHTML() {
    const { name, app } = this;
    const { eventData } = app;
    const homeName = `${name}-home`;
    // this.cs.log(eventData);

    return `
    <div class="${homeName}">
      <div class="${homeName}__event-board">
        <p class="--name">${eventData?.name}</p>
        <p class="--date">${eventData?.date}</p>
        <p class="--venue">${eventData?.venue}</p>
      </div>
    </div>
    `;
  }
}
