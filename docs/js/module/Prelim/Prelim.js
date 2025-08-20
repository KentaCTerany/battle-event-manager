import PrelimSwap from './PrelimSwap.js';

export default class PrelimManager {
  constructor({ app } = {}) {
    this.app = app;
    this.cs = app?.cs;
    this.className = 'BEM-app-prelim';

    // ドラッグ&ドロップ機能の初期化
    this.swap = new PrelimSwap({ prelim: this });

    // アプリケーションの初期化が完了してから実行
    if (app) {
      // 初期化時にprelim.optionがない場合は作成
      requestAnimationFrame(() => {
        if (!this.app?.eventData?.prelim?.option) {
          this.app.updateEventData({
            prelim: {
              ...this.app?.eventData?.prelim,
              option: {
                membersPerGroup: 5, // デフォルト値
                format: 'list', // デフォルト値
                parallelCount: 1, // 同時進行サークル数（デフォルト1）
                display: {
                  // 表示設定
                  eventName: true,
                  subName: true,
                  logo: true,
                  customTitle: '', // カスタムタイトル
                },
              },
            },
          });
        }
      });
    }
  }
  get html() {
    const { className } = this;
    const option = this.app?.eventData?.prelim?.option;

    return `
    ${this.getFormHTML()}
    ${this.getFrameHTML()}
      <div class="${className}-setting__buttons">
        <button type="button" class="${className}__pdf-btn">PDF出力</button>
      </div>
    `;
  }

  getFormHTML() {
    const { className } = this;
    const option = this.app?.eventData?.prelim?.option;
    if (!option) return '';

    return `
    <fieldset class="${className}__setting ${className}-setting">
      <legend>設定</legend>
      <div class="${className}-setting__item">
        <p>表示設定</p>
        <div class="--labelList">
          <label>
            <input type="checkbox" class="${className}__display-input" name="display-event-name" ${option.display?.eventName ? 'checked' : ''}>
            <span>イベント名</span>
          </label>
          <label>
            <input type="checkbox" class="${className}__display-input" name="display-sub-name" ${option.display?.subName ? 'checked' : ''}>
            <span>部門名</span>
          </label>
          <label>
            <input type="checkbox" class="${className}__display-input" name="display-logo" ${option.display?.logo ? 'checked' : ''}>
            <span>ロゴ</span>
          </label>
          <div class="--input-group">
            <input 
              type="text" 
              class="${className}__custom-title-input"
              name="custom-title" 
              value="${option.display?.customTitle || ''}"
              placeholder="任意のタイトル"
            >
          </div>
        </div>
      </div>
      <div class="${className}-setting__item">
        <p>予選表形式</p>
        <div class="--labelList">
          <label>
            <span>リスト</span>
            <input type="radio" name="format" value="list" ${option.format === 'list' ? 'checked' : ''}>
          </label>
          <label>
            <span>対戦表</span>
            <input type="radio" name="format" value="battle" ${option.format === 'battle' ? 'checked' : ''}>
          </label>
        </div>
      </div>
      <div class="${className}-setting__item">
        <p>同時進行サークル数</p>
        <div class="--input-group">
          <input 
            type="number" 
            name="parallelCount" 
            value="${option.parallelCount}"
            min="1"
            max="2"
            class="${className}__parallel-input"
          >
          <span>サークル</span>
        </div>
      </div>
      ${
        option.format === 'list'
          ? `
      <div class="${className}-setting__item">
        <p>1グループの人数</p>
        <div class="--input-group">
          <input 
            type="number" 
            name="membersPerGroup" 
            value="${option.membersPerGroup}"
            min="2"
            max="20"
            class="${className}__members-input"
          >
          <span>名</span>
        </div>
      </div>
      `
          : ''
      }
    </fieldset>
    <div class="${className}-setting__buttons">
        <button type="button" class="${className}__shuffle-btn">シャッフル</button>
        <button type="button" class="${className}__update-btn">更新</button>
    </div>
    `;
  }

  getFrameHTML() {
    const { className } = this;
    const groups = this.getGroups();
    const frameName = `${className}-frame`;

    const { eventData } = this.app;
    const option = this.app?.eventData?.prelim?.option;
    const display = option?.display || {};

    return `
    <div class="${className}__frame ${frameName}">
      <div class="${frameName}__header">
        ${
          display.logo && eventData.logo
            ? `
          <div class="${frameName}__logo">
            <img src="${eventData.logo}" alt="イベントロゴ">
          </div>
        `
            : ''
        }
        <div class="${frameName}__title">
          ${display.eventName ? `<h3>${eventData.name || ''}</h3>` : ''}
          ${display.subName && eventData.subName ? `<p>${eventData.subName}</p>` : ''}
          ${display.customTitle ? `<p class="custom-title">${display.customTitle}</p>` : ''}
        </div>
      </div>
      <div class="${frameName}__groups ${option?.format === 'battle' ? '--battle' : '--list'}">
        ${groups
          .map(
            (group, groupIndex) => `
              <table border="2" class="${frameName}__group">
                <colgroup>
                  ${
                    option?.format === 'battle'
                      ? `
                    <col style="width: 4em;">
                    <col style="width: calc((100% - 4em) / 2);">
                    <col style="width: calc((100% - 4em) / 2);">
                    `
                      : `
                    <col style="width: 2em;">
                    <col style="width: calc((100% - 2em) / 2);">
                    <col style="width: calc((100% - 2em) / 2);">
                    `
                  }
                </colgroup>
                <thead>
                  <tr>
                    <th colspan="3">${this.getGroupName(groupIndex)}</th>
                  </tr>
                </thead>
                <tbody>
                  ${group
                    .map((entry, entryIndex) => {
                      if (option?.format === 'battle') {
                        // 対戦表形式の場合、entryは[battler1, battler2]の形式
                        const [battler1, battler2] = entry;
                        return `
                            <tr class="${frameName}__entry">
                              <td>${entryIndex + 1}</td>
                              <td ${battler1 ? `draggable="true" data-group-index="${groupIndex}" data-entry-index="${entryIndex * 2}"` : ''}>
                                ${battler1?.name ?? ''}${battler1?.desc ? `（${battler1?.desc}）` : ''}
                              </td>
                              <td ${battler2 ? `draggable="true" data-group-index="${groupIndex}" data-entry-index="${entryIndex * 2 + 1}"` : ''}>
                                ${battler2?.name ?? ''}${battler2?.desc ? `（${battler2?.desc}）` : ''}
                              </td>
                            </tr>
                          `;
                      } else {
                        // リスト形式の場合
                        return `
                            <tr 
                              class="${frameName}__entry"
                              draggable="true"
                              data-group-index="${groupIndex}"
                              data-entry-index="${entryIndex}"
                            >
                              <td>${entryIndex + 1}</td>
                              <td>${entry?.name ?? ''}</td>
                              <td>${entry?.desc ?? ''}</td>
                            </tr>
                          `;
                      }
                    })
                    .join('')}
                  </tbody>
                </table>
            `
          )
          .join('')}
      </div>
    </div>
    `;
  }

  getGroups() {
    const option = this.app?.eventData?.prelim?.option;
    if (!this.app?.eventData?.battlerList || !option) {
      return Array.from({ length: 2 }, () => Array(5).fill(null));
    }

    const originalList = this.app.eventData.battlerList;
    // インデックスの配列から実際のバトラーデータを取得
    const battlers = (this.app.eventData.prelim?.battlerIndexes || [...originalList.keys()]).map((index) => originalList[index]).filter((battler) => battler != null);

    if (option.format === 'battle') {
      // 対戦表形式の場合
      const parallelCount = option.parallelCount || 1;
      const battles = [];

      // 対戦カードを作成
      for (let i = 0; i < battlers.length; i += 2) {
        battles.push([battlers[i] || null, battlers[i + 1] || null]);
      }

      // 同時進行サークル数に応じてグループを分割
      const groups = Array.from({ length: parallelCount }, () => []);
      battles.forEach((battle, index) => {
        const groupIndex = index % parallelCount;
        groups[groupIndex].push(battle);
      });

      return groups;
    } else {
      // リスト形式の場合
      const membersPerGroup = option.membersPerGroup;
      let groupCount = Math.max(2, Math.ceil(battlers.length / membersPerGroup));

      // 同時進行サークル数が2の場合、サークル数を偶数に調整
      if (option.parallelCount === 2 && groupCount % 2 !== 0) {
        groupCount += 1;
      }

      const groups = Array.from({ length: groupCount }, () => Array(membersPerGroup).fill(null));

      this.cs.log('バトラーを各順番ごとに配置', battlers, membersPerGroup, groupCount);

      battlers.forEach((battler, index) => {
        const memberIndex = Math.floor(index / groupCount); // 何番目の出場者か
        const groupIndex = index % groupCount; // どのグループに入るか

        // メンバー数を超えない範囲で配置
        if (memberIndex < membersPerGroup) {
          groups[groupIndex][memberIndex] = battler;
        }
      });

      return groups;
    }
  }

  getGroupName(index) {
    const option = this.app?.eventData?.prelim?.option;
    const format = option?.format;
    const parallelCount = option?.parallelCount ?? 1;

    if (format === 'battle') {
      // 対戦表形式の場合は単純にA, B, C, ...
      return `${String.fromCharCode(65 + index)}サークル`;
    } else {
      // リスト形式の場合
      if (parallelCount === 1) {
        // A, B, C, ... の形式
        return `${String.fromCharCode(65 + index)}サークル`;
      } else {
        // A-1, B-1, A-2, B-2, ... の形式
        const circleNumber = Math.floor(index / 2) + 1;
        const circleLetter = String.fromCharCode(65 + (index % 2));
        return `${circleLetter}-${circleNumber}サークル`;
      }
    }
  }

  addEvents() {
    const handleClick = (e) => {
      const isMatch = (selector) => e.target.matches(selector);
      if (isMatch(`.${this.className}__update-btn`)) return this.onClickUpdate(e);
      if (isMatch(`.${this.className}__shuffle-btn`)) return this.onClickShuffle(e);
      if (isMatch(`.${this.className}__pdf-btn`)) return this.exportToPDF(e);
    };

    const handleChange = (e) => {
      // 変更されたinput要素がこのコンポーネントに属しているか確認
      const container = document.querySelector(`.${this.className}`);
      if (!container?.contains(e.target)) return;

      // 各inputタイプに応じた処理
      if (e.target.matches(`.${this.className}__members-input`)) {
        this.onChangeMembersCount(e);
      } else if (e.target.matches(`.${this.className}__parallel-input`)) {
        this.onChangeParallelCount(e);
      } else if (e.target.matches('input[name="format"]')) {
        this.onChangeFormat(e);
      } else if (e.target.matches('input[name^="display-"]')) {
        this.onChangeDisplay(e);
      } else if (e.target.matches(`.${this.className}__custom-title-input`)) {
        this.onChangeCustomTitle(e);
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('change', handleChange);

    // ドラッグ&ドロップ機能の初期化
    this.swap.initialize();
  }

  onChangeMembersCount(e) {
    this.cs.log('グループあたりの人数を変更');
    this.app.updateEventData({
      prelim: {
        ...this.app.eventData.prelim,
        option: {
          ...this.app.eventData.prelim.option,
          membersPerGroup: parseInt(e.target.value, 10),
        },
      },
    });
    this.app.mode.render();
  }

  onChangeParallelCount(e) {
    this.cs.log('同時進行サークル数を変更');
    this.app.updateEventData({
      prelim: {
        ...this.app.eventData.prelim,
        option: {
          ...this.app.eventData.prelim.option,
          parallelCount: parseInt(e.target.value, 10),
        },
      },
    });
    this.app.mode.render();
  }

  onChangeFormat(e) {
    this.cs.log('予選表形式を変更');
    this.app.updateEventData({
      prelim: {
        ...this.app.eventData.prelim,
        option: {
          ...this.app.eventData.prelim.option,
          format: e.target.value,
        },
      },
    });
    this.app.mode.render();
  }

  onChangeDisplay(e) {
    // キャメルケースに変換（例：display-event-name → eventName）
    const displayKey = e.target.name
      .replace('display-', '')
      .split('-')
      .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
      .join('');

    this.cs.log('表示設定を変更:', displayKey);

    // 現在の表示設定を取得（ない場合はデフォルト値を使用）
    const currentDisplay = this.app?.eventData?.prelim?.option?.display || {
      eventName: true,
      subName: true,
      logo: true,
    };

    this.app.updateEventData({
      prelim: {
        ...this.app.eventData.prelim,
        option: {
          ...this.app.eventData.prelim.option,
          display: {
            ...currentDisplay,
            [displayKey]: e.target.checked,
          },
        },
      },
    });
    this.app.mode.render();
  }

  exportToPDF() {
    // 現在のタイトルを保存
    const originalTitle = document.title;

    // イベント名と日付を含むファイル名を生成
    const eventName = this.app.eventData.name || 'イベント';
    const date = new Date().toLocaleDateString('ja-JP').replace(/\//g, '');
    document.title = `予選表_${eventName}_${date}`;

    // 印刷
    window.print();

    // タイトルを元に戻す
    document.title = originalTitle;
  }

  onClickShuffle() {
    this.cs.log('バトラーリストをシャッフル');
    if (!this.app?.eventData?.battlerList) return;

    // インデックスの配列をシャッフル（Fisher-Yates アルゴリズム）
    const indexes = [...this.app.eventData.battlerList.keys()];
    for (let i = indexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }

    // シャッフルされたインデックスリストを保存
    this.app.updateEventData({
      prelim: {
        ...this.app.eventData.prelim,
        battlerIndexes: indexes,
      },
    });

    // 画面を再描画
    this.app.mode.render();
  }

  onChangeCustomTitle(e) {
    // 現在の表示設定を取得
    const currentDisplay = this.app?.eventData?.prelim?.option?.display || {
      eventName: true,
      subName: true,
      logo: true,
      customTitle: '',
    };

    this.app.updateEventData({
      prelim: {
        ...this.app.eventData.prelim,
        option: {
          ...this.app.eventData.prelim.option,
          display: {
            ...currentDisplay,
            customTitle: e.target.value,
          },
        },
      },
    });
    this.app.mode.render();
  }

  onClickUpdate() {
    const prelimData = this.app.eventData.prelim || {};
    const battlerList = this.app.eventData.battlerList || [];
    const currentIndexes = prelimData.battlerIndexes || [...Array(battlerList.length).keys()];

    // バトラーリストの長さに基づいてインデックスリストを調整
    let newIndexes = currentIndexes;

    if (battlerList.length !== currentIndexes.length) {
      if (battlerList.length > currentIndexes.length) {
        // バトラーが増えた場合、新しいインデックスを末尾に追加
        const newIndices = [...Array(battlerList.length).keys()].slice(currentIndexes.length);
        newIndexes = [...currentIndexes, ...newIndices];
      } else {
        // バトラーが減った場合、存在しないバトラーのインデックスを除外
        newIndexes = currentIndexes.filter((index) => index < battlerList.length);
      }
    }

    // 更新されたインデックスリストを保存
    this.app.updateEventData({
      prelim: {
        ...prelimData,
        battlerIndexes: newIndexes,
      },
    });
    this.app.mode.render();
  }
}
