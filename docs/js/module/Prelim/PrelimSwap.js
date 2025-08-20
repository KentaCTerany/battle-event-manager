export default class PrelimSwap {
  /**
   * @param {Object} params
   * @param {import('./Prelim').default} params.prelim - 予選表マネージャーのインスタンス
   */
  constructor({ prelim }) {
    this.prelim = prelim;
    this.className = prelim.className;
  }

  initialize() {
    this.addEventListeners();
  }

  addEventListeners() {
    document.addEventListener('dragstart', this.handleDragStart.bind(this));
    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('dragend', this.handleDragEnd.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
  }

  removeEventListeners() {
    document.removeEventListener('dragstart', this.handleDragStart.bind(this));
    document.removeEventListener('dragover', this.handleDragOver.bind(this));
    document.removeEventListener('dragend', this.handleDragEnd.bind(this));
    document.removeEventListener('drop', this.handleDrop.bind(this));
  }

  /**
   * 要素がドラッグ可能かどうかを判定
   */
  isDraggable(element) {
    if (!element) return false;
    const option = this.prelim.app?.eventData?.prelim?.option;
    if (!option) return false;
    return option.format === 'list' ? element.matches(`.${this.className}-frame__entry`) : element.matches(`td[draggable="true"]`);
  }

  /**
   * インデックスを計算する共通関数
   */
  calculateIndex(groupIndex, entryIndex, option) {
    const battlerList = this.prelim.app.eventData.battlerList;
    let groupCount;

    if (option.format === 'list') {
      groupCount = Math.max(2, Math.ceil(battlerList.length / option.membersPerGroup));
      // 同時進行サークル数が2の場合、サークル数を偶数に調整
      if (option.parallelCount === 2 && groupCount % 2 !== 0) {
        groupCount += 1;
      }
      return entryIndex * groupCount + groupIndex;
    } else {
      const parallelCount = option.parallelCount || 1;
      const entryInGroup = Math.floor(entryIndex / 2);
      // 計算式: (対戦カード番号 * 2 * サークル数) + (左右の位置: 0 or 1) + (サークル番号 * 2)
      return entryInGroup * 2 * parallelCount + (entryIndex % 2) + groupIndex * 2;
    }
  }

  /**
   * ドラッグ開始時の処理
   */
  handleDragStart(e) {
    const option = this.prelim.app?.eventData?.prelim?.option;
    if (!option) return;

    const dragTarget = option.format === 'list' ? e.target.closest(`.${this.className}-frame__entry`) : e.target.closest('td[draggable="true"]');
    if (!dragTarget || !this.isDraggable(dragTarget)) return;

    const entry = dragTarget.closest(`.${this.className}-frame__entry`);
    if (!entry) return;

    const groupIndex = parseInt(option.format === 'list' ? entry.dataset.groupIndex : dragTarget.dataset.groupIndex);
    const entryIndex = parseInt(option.format === 'list' ? entry.dataset.entryIndex : dragTarget.dataset.entryIndex);

    const battlerList = this.prelim.app.eventData.battlerList;
    const currentIndexes = this.prelim.app.eventData.prelim?.battlerIndexes || [...battlerList.keys()];

    const index = this.calculateIndex(groupIndex, entryIndex, option);
    const battlerIndex = currentIndexes[index];
    const battler = battlerList[battlerIndex];

    // ドラッグデータを設定
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        groupIndex,
        entryIndex,
        format: option.format,
      })
    );

    // ドラッグ効果を設定
    e.dataTransfer.effectAllowed = 'move';

    console.log('ドラッグ開始:', {
      位置: {
        グループ: groupIndex,
        順番: entryIndex,
      },
      フォーマット: option.format,
      バトラー: battler
        ? {
            名前: battler.name,
            所属: battler.desc,
          }
        : null,
    });
  }

  /**
   * ドラッグ中の処理
   * @param {DragEvent} e
   */
  handleDragOver(e) {
    const entry = e.target.closest(`.${this.className}-frame__entry`);
    if (!entry) return;

    // ドロップを許可
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  /**
   * ドラッグ終了時の処理
   * @param {DragEvent} e
   */
  handleDragEnd(e) {}

  /**
   * ドロップ時の処理
   * @param {DragEvent} e
   */
  handleDrop(e) {
    const entry = e.target.closest(`.${this.className}-frame__entry`);
    if (!entry) return;

    e.preventDefault(); // ブラウザのデフォルトのドロップ動作を防止

    try {
      // バトラー情報を取得
      const option = this.prelim.app?.eventData?.prelim?.option;
      if (!option) return;

      // リスト形式の場合はtr要素、対戦表形式の場合はtd要素を対象とする
      const dropTarget = option.format === 'list' ? entry : e.target;
      if (!this.isDraggable(dropTarget)) return;

      // ドラッグ開始時のデータを取得
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (option.format !== dragData.format) return; // 形式が一致しない場合は処理しない

      const toGroup = parseInt(option.format === 'list' ? entry.dataset.groupIndex : dropTarget.dataset.groupIndex);
      const toEntry = parseInt(option.format === 'list' ? entry.dataset.entryIndex : dropTarget.dataset.entryIndex);

      // 現在のインデックスリストとバトラーリストを取得
      const battlerList = this.prelim.app.eventData.battlerList;
      const currentIndexes = this.prelim.app.eventData.prelim?.battlerIndexes || [...battlerList.keys()];
      const parallelCount = option.parallelCount || 1;

      // インデックスとバトラー情報の取得
      let fromIndex, toIndex;
      if (option.format === 'list') {
        const groupCount = Math.max(2, Math.ceil(battlerList.length / option.membersPerGroup));
        fromIndex = dragData.entryIndex * groupCount + dragData.groupIndex;
        toIndex = toEntry * groupCount + toGroup;
      } else {
        // 対戦表形式の場合のインデックス計算
        const fromEntryInGroup = Math.floor(dragData.entryIndex / 2);
        const toEntryInGroup = Math.floor(toEntry / 2);
        // (グループ内のエントリー番号 * 2 * サークル数) + (左右の位置) + (サークル番号 * 2)
        fromIndex = fromEntryInGroup * 2 * parallelCount + (dragData.entryIndex % 2) + dragData.groupIndex * 2;
        toIndex = toEntryInGroup * 2 * parallelCount + (toEntry % 2) + toGroup * 2;
      }

      const fromBattlerIndex = currentIndexes[fromIndex];
      const toBattlerIndex = currentIndexes[toIndex];
      const fromBattler = battlerList[fromBattlerIndex];
      const toBattler = battlerList[toBattlerIndex];

      console.log('ドロップ操作:', {
        移動元: {
          位置: {
            グループ: dragData.groupIndex,
            順番: dragData.entryIndex,
          },
          バトラー: fromBattler
            ? {
                名前: fromBattler.name,
                所属: fromBattler.desc,
              }
            : null,
        },
        移動先: {
          位置: {
            グループ: toGroup,
            順番: toEntry,
          },
          バトラー: toBattler
            ? {
                名前: toBattler.name,
                所属: toBattler.desc,
              }
            : null,
        },
        フォーマット: option.format,
      });

      // 入れ替え処理を実行
      this.swapEntries(dragData.groupIndex, dragData.entryIndex, toGroup, toEntry);
    } catch (error) {
      console.error('Drop processing error:', error);
    }
  }

  /**
   * エントリーの入れ替え
   * @param {number} fromGroup - 移動元のグループインデックス
   * @param {number} fromEntry - 移動元のエントリーインデックス
   * @param {number} toGroup - 移動先のグループインデックス
   * @param {number} toEntry - 移動先のエントリーインデックス
   */
  swapEntries(fromGroup, fromEntry, toGroup, toEntry) {
    // バトラーリストとオプション情報を取得
    const option = this.prelim.app?.eventData?.prelim?.option;
    if (!option) return;

    const battlerList = this.prelim.app.eventData.battlerList;
    if (!battlerList) return;

    // 現在のインデックスリストを取得（なければバトラーリストの順序を使用）
    const currentIndexes = this.prelim.app.eventData.prelim?.battlerIndexes || [...battlerList.keys()];

    // 移動元と移動先のインデックスを計算
    const fromIndex = this.calculateIndex(fromGroup, fromEntry, option);
    const toIndex = this.calculateIndex(toGroup, toEntry, option);

    // インデックスが範囲内の場合のみ処理
    if (fromIndex < battlerList.length && toIndex < battlerList.length) {
      // インデックスリストで位置を入れ替え
      const newIndexes = [...currentIndexes];
      [newIndexes[fromIndex], newIndexes[toIndex]] = [newIndexes[toIndex], newIndexes[fromIndex]];

      // 更新されたインデックスリストを保存
      this.prelim.app.updateEventData({
        prelim: {
          ...this.prelim.app.eventData.prelim,
          battlerIndexes: newIndexes,
        },
      });

      // 画面を再描画
      this.prelim.app.mode.render();

      console.log('位置の入れ替えが完了しました:', {
        フォーマット: option.format,
        インデックス: {
          移動元: fromIndex,
          移動先: toIndex,
        },
        新しい順序: newIndexes,
      });
    }
  }

  /**
   * クリーンアップ処理
   */
  destroy() {
    this.removeEventListeners();
  }
}
