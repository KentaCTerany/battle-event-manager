export default class RankingManager {
  constructor({ app } = {}) {
    this.app = app;
    this.cs = app?.cs;
    this.className = 'BEM-app-ranking';
    this.addEvents();
  }

  /**
   * ランキングデータを保存
   */
  saveRankingData() {
    if (!this.app?.eventData) return;

    const rankings = this.collectRankingData();
    // MapをObject形式に変換して保存
    const rankingsObject = {};
    for (const [key, value] of rankings) {
      rankingsObject[key] = value;
    }

    const rankingData = {
      maxRank: this.getMaxRank(),
      rankings: rankingsObject,
    };

    // eventDataにランキングデータを保存
    const updatedEventData = {
      ...this.app.eventData,
      ranking: rankingData,
    };
    this.app.updateEventData(updatedEventData);
  }

  /**
   * 保存されている順位データを取得
   */
  getSavedRankings() {
    const savedRankings = this.app?.eventData?.ranking?.rankings;
    if (!savedRankings) return new Map();

    // ObjectからMapに変換して返す
    return new Map(Object.entries(savedRankings));
  }

  get html() {
    const { className } = this;
    const judgeSheetFrameName = `${className}-judge-sheet`;
    const groups = this.getJudgeGroups();
    const option = this.app?.eventData?.prelim?.option;
    const isParallel = option?.parallelCount === 2;
    const isBattleFormat = option?.format === 'battle';

    // 2サークル進行の場合、AグループとBグループに分ける
    let groupedSheets = '';
    if (isParallel) {
      const aGroups = groups.filter((_, index) => index % 2 === 0);
      const bGroups = groups.filter((_, index) => index % 2 === 1);

      groupedSheets = `
        <div class="${judgeSheetFrameName}__circle-group" data-circle="A">
          <div class="${judgeSheetFrameName}__actions">
            <button type="button" class="${judgeSheetFrameName}__clear-ranks-btn">Aサークルの順位をクリア</button>
          </div>
          <div class="${judgeSheetFrameName}__judge-info">
            <div class="${judgeSheetFrameName}__judge-name">
              <span>ジャッジシート</span>
              <span class="input-space"></span>
            </div>
          </div>
          ${aGroups.map((group, groupIndex) => this.getJudgeSheetHTML(group, groupIndex * 2)).join('')}
        </div>
        <div class="${judgeSheetFrameName}__circle-group" data-circle="B">
          <div class="${judgeSheetFrameName}__actions">
            <button type="button" class="${judgeSheetFrameName}__clear-ranks-btn">Bサークルの順位をクリア</button>
          </div>
          <div class="${judgeSheetFrameName}__judge-info">
            <div class="${judgeSheetFrameName}__judge-name">
              <span>ジャッジシート</span>
              <span class="input-space"></span>
            </div>
          </div>
          ${bGroups.map((group, groupIndex) => this.getJudgeSheetHTML(group, groupIndex * 2 + 1)).join('')}
        </div>
      `;
    } else {
      // 1サークル進行の場合は、すべてのグループをまとめて表示
      groupedSheets = `
        <div class="${judgeSheetFrameName}__circle-group">
          <div class="${judgeSheetFrameName}__actions">
            <button type="button" class="${judgeSheetFrameName}__clear-ranks-btn">順位をクリア</button>
          </div>
          ${groups.map((group, groupIndex) => this.getJudgeSheetHTML(group, groupIndex)).join('')}
          <div class="${judgeSheetFrameName}__judge-info">
            <div class="${judgeSheetFrameName}__judge-name">
              <span>ジャッジ名:</span>
              <span class="input-space"></span>
            </div>
          </div>
        </div>
      `;
    }

    const html = `
      <div class="${className}">
        <div class="${className}__actions">
          <button type="button" class="${className}__print-judge-sheet-btn">ジャッジシート印刷</button>
          <button type="button" class="${className}__show-ranking-btn">ランキング表示</button>
        </div>
        <div class="${judgeSheetFrameName}${isParallel ? ' is-parallel' : ''}" data-is-battle="${isBattleFormat}">
          ${groupedSheets}
        </div>
      </div>
    `;

    // 非同期でDOMが構築された後に重複チェックを実行
    setTimeout(() => {
      const frameName = `${this.className}-judge-sheet`;
      const circleGroups = document.querySelectorAll(`.${frameName}__circle-group`);
      circleGroups.forEach((group) => {
        this.checkDuplicateRanks(group);
      });
    }, 0);

    return html;
  }

  /**
   * ジャッジシートのグループデータを取得
   */
  getJudgeGroups() {
    const option = this.app?.eventData?.prelim?.option;
    if (!this.app?.eventData?.battlerList || !option) {
      return [];
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

  /**
   * ジャッジシートのHTMLを生成
   */
  getJudgeSheetHTML(group, groupIndex) {
    const { className } = this;
    const option = this.app?.eventData?.prelim?.option;
    const frameName = `${className}-judge-sheet`;
    const isBattleFormat = option?.format === 'battle';

    return `
      <div class="${frameName}__group">
        <h3 class="${frameName}__group-title">${this.getGroupName(groupIndex)}</h3>
        <table class="${frameName}__table" border="1">
          <colgroup>
            <col class="${frameName}__col--order">
            ${isBattleFormat ? `<col class="${frameName}__col--number">` : ''}
            <col class="${frameName}__col--name">
            <col class="${frameName}__col--info">
            <col class="${frameName}__col--comment">
            <col class="${frameName}__col--rank">
          </colgroup>
          <thead>
            <tr>
              <th class="${frameName}__header--order">順</th>
              ${isBattleFormat ? `<th class="${frameName}__header--number">No.</th>` : ''}
              <th class="${frameName}__header--name">名前</th>
              <th class="${frameName}__header--info">所属</th>
              <th class="${frameName}__header--comment">コメント</th>
              <th class="${frameName}__header--rank">順位</th>
            </tr>
          </thead>
          <tbody>
            ${group
              .map((entry, index) => {
                // 対戦表形式の場合は[battler1, battler2]の形式
                const battlers = Array.isArray(entry) ? entry : [entry];
                return battlers
                  .map((battler, battleIndex) =>
                    battler
                      ? `
                <tr>
                  ${isBattleFormat && battleIndex === 0 ? `<td class="${frameName}__cell--order" rowspan="2">${index + 1}</td>` : !isBattleFormat ? `<td class="${frameName}__cell--order">${index + 1}</td>` : ''}
                  ${isBattleFormat ? `<td class="${frameName}__cell--number">${index * 2 + battleIndex + 1}</td>` : ''}
                  <td class="${frameName}__cell--name">${battler.name}</td>
                  <td class="${frameName}__cell--info">${battler.desc || ''}</td>
                  <td class="${frameName}__cell--comment ${frameName}__comment"></td>
                  <td class="${frameName}__cell--rank ${frameName}__rank">
                    <input
                      type="number" 
                      class="${frameName}__rank-input" 
                      min="1" 
                      value="${this.getSavedRank(battler.name, this.getCircleNameByIndex(groupIndex))}"
                      />
                  </td>
                </tr>
              `
                      : ''
                  )
                  .join('');
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * グループ名を取得
   */
  getMaxRank() {
    return 99; // 実質的な制限なし
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

  /**
   * 同じサークル内での順位の重複をチェック
   */
  checkDuplicateRanks(circleGroup) {
    const frameName = `${this.className}-judge-sheet`;
    const rankInputs = circleGroup.querySelectorAll(`.${frameName}__rank-input`);
    const ranks = new Map();

    // 一旦すべての重複表示をリセット
    rankInputs.forEach((input) => {
      input.classList.remove('duplicate-rank');
    });

    // 順位の出現回数をカウント
    rankInputs.forEach((input) => {
      if (input.value) {
        const rank = parseInt(input.value, 10);
        ranks.set(rank, (ranks.get(rank) || 0) + 1);
      }
    });

    // 重複している順位の入力欄をマーク
    ranks.forEach((count, rank) => {
      if (count > 1) {
        rankInputs.forEach((input) => {
          if (parseInt(input.value, 10) === rank) {
            input.classList.add('duplicate-rank');
          }
        });
      }
    });
  }

  /**
   * サークル内の順位をクリア
   */
  clearRanks(circleGroup) {
    const frameName = `${this.className}-judge-sheet`;
    const rankInputs = circleGroup.querySelectorAll(`.${frameName}__rank-input`);

    // すべての順位入力をクリア
    rankInputs.forEach((input) => {
      input.value = '';
      input.classList.remove('duplicate-rank');
    });

    // データを保存
    this.saveRankingData();
  }

  addEvents() {
    this.handleClick = (e) => {
      const isMatch = (selector) => e.target.matches(selector);
      if (isMatch(`.${this.className}__print-judge-sheet-btn`)) return this.printJudgeSheet(e);
      if (isMatch(`.${this.className}__show-ranking-btn`)) return this.showRankingWindow(e);
      if (isMatch(`.${this.className}-judge-sheet__clear-ranks-btn`)) {
        const circleGroup = e.target.closest(`.${this.className}-judge-sheet__circle-group`);
        if (circleGroup && confirm('このサークルの順位をすべてクリアしますか？')) {
          this.clearRanks(circleGroup);
        }
        return;
      }
    };

    this.handleMaxRankChange = (e) => {
      if (e.target.matches('input[name="max-rank"]')) {
        const totalMaxRank = parseInt(e.target.value, 10);
        const option = this.app?.eventData?.prelim?.option;
        const parallelCount = option?.parallelCount || 1;
        const maxRankPerCircle = parallelCount === 2 ? Math.ceil(totalMaxRank / 2) : totalMaxRank;
        const frameName = `${this.className}-judge-sheet`;
        const rankInputs = document.querySelectorAll(`.${frameName}__rank-input`);

        // 入力値の検証
        if (isNaN(totalMaxRank) || totalMaxRank < 1 || totalMaxRank > 16) {
          return;
        }

        // 入力フィールドのmaxと値を更新
        rankInputs.forEach((input) => {
          input.max = maxRankPerCircle;
          const currentValue = parseInt(input.value, 10);
          if (!isNaN(currentValue) && currentValue > maxRankPerCircle) {
            input.value = '';
          }
        });

        // eventDataを作成（ない場合）
        if (!this.app?.eventData) {
          this.app.eventData = {};
        }

        const updatedEventData = {
          ...this.app.eventData,
          ranking: {
            ...(this.app.eventData.ranking || {}),
            // 全体の予選通過バトラー数を保存
            maxRank: totalMaxRank,
            rankings: this.getSavedRankings(),
          },
        };

        this.app.updateEventData(updatedEventData);
      }
    };

    this.handleRankInput = (e) => {
      if (e.target.matches(`.${this.className}-judge-sheet__rank-input`)) {
        // 所属するサークルグループを取得して重複チェック
        const circleGroup = e.target.closest(`.${this.className}-judge-sheet__circle-group`);
        if (circleGroup) {
          this.checkDuplicateRanks(circleGroup);
        }
        this.saveRankingData();
      }
    };

    // イベントリスナーを追加
    document.addEventListener('click', this.handleClick);
    document.addEventListener('input', (e) => {
      if (e.target.matches(`.${this.className}-judge-sheet__rank-input`)) {
        this.handleRankInput(e);
      }
    });
  }

  /**
   * ランキングデータを収集
   */
  collectRankingData() {
    const frameName = `${this.className}-judge-sheet`;
    const circleGroups = document.querySelectorAll(`.${frameName}__circle-group`);
    const rankings = new Map();

    circleGroups.forEach((group) => {
      const circleName = group.dataset.circle || 'シングル';
      const rankingData = [];

      // グループ内の各エントリーを処理
      group.querySelectorAll('tbody tr').forEach((row) => {
        const name = row.querySelector('td:nth-child(2)').textContent;
        const desc = row.querySelector('td:nth-child(3)').textContent;
        const rankInput = row.querySelector(`.${frameName}__rank-input`);
        const rank = rankInput ? parseInt(rankInput.value, 10) : null;

        if (rank) {
          rankingData.push({ name, desc, rank });
        }
      });

      // ランク順にソート
      rankingData.sort((a, b) => a.rank - b.rank);
      rankings.set(circleName, rankingData);
    });

    return rankings;
  }

  /**
   * ランキングウィンドウを表示
   */
  showRankingWindow() {
    const rankings = this.collectRankingData();
    const eventName = this.app.eventData.name || 'イベント';
    const subName = this.app.eventData.subName || '';

    const rankingWindow = window.open('', 'Ranking', 'width=800,height=600');
    rankingWindow.document.write(`
      <html>
        <head>
          <title>ランキング - ${eventName}</title>
          <style>
            body { font-family: sans-serif; margin: 20px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            h2 { font-size: 20px; margin: 20px 0 10px; }
            .ranking-table { 
              border-collapse: collapse; 
              margin: 10px 0; 
              width: 100%;
            }
            .ranking-table th, .ranking-table td { 
              border: 1px solid #ccc; 
              padding: 8px; 
              text-align: left; 
            }
            .ranking-table th { background: #f0f0f0; }
            .ranking-table tr.empty-rank td {
              color: #999;
              font-style: italic;
            }
            @media print {
              .no-print { display: none; }
              h2 { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <h1>${eventName}${subName ? ` - ${subName}` : ''}</h1>
          <div class="no-print">
            <button onclick="window.print()">印刷</button>
          </div>
          ${Array.from(rankings.entries())
            .map(([circleName, data]) => {
              // 入力された順位のデータをそのまま使用
              const rankedData = data.sort((a, b) => a.rank - b.rank);

              return `
                  <h2>${circleName}サークル ランキング</h2>
                  <table class="ranking-table">
                    <thead>
                      <tr>
                        <th>順位</th>
                        <th>名前</th>
                        <th>所属</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rankedData
                        .map(
                          ({ rank, name, desc }) => `
                        <tr${name === '---' ? ' class="empty-rank"' : ''}>
                          <td>${rank}</td>
                          <td>${name}</td>
                          <td>${desc}</td>
                        </tr>
                      `
                        )
                        .join('')}
                    </tbody>
                  </table>
                `;
            })
            .join('')}
        </body>
      </html>
    `);
    rankingWindow.document.close();
  }

  /**
   * 保存された順位を取得
   */
  getSavedRank(name, circleName) {
    const savedRankings = this.getSavedRankings();
    const circleData = savedRankings.get(circleName);
    if (!circleData) return '';

    const entry = circleData.find((e) => e.name === name);
    return entry ? entry.rank : '';
  }

  /**
   * グループインデックスからサークル名を取得
   */
  getCircleNameByIndex(index) {
    const option = this.app?.eventData?.prelim?.option;
    const parallelCount = option?.parallelCount || 1;

    if (parallelCount === 2) {
      return index % 2 === 0 ? 'A' : 'B';
    }
    return 'シングル';
  }

  /**
   * ジャッジシートの印刷
   */
  printJudgeSheet() {
    // 現在のタイトルを保存
    const originalTitle = document.title;

    // イベント名と日付を含むファイル名を生成
    const eventName = this.app.eventData.name || 'イベント';
    const date = new Date().toLocaleDateString('ja-JP').replace(/\//g, '');
    document.title = `ジャッジシート_${eventName}_${date}`;

    // 印刷
    window.print();

    // タイトルを元に戻す
    document.title = originalTitle;
  }
}
