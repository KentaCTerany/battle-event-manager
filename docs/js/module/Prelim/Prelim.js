export default class PrelimManager {
  constructor() {
    this.className = 'BEM-app-prelim';
    this.option = {};
  }
  get html() {
    return `
    ${this.getFormHTML()}
    `;
  }

  getFormHTML() {
    const { className } = this;
    return `
    <fieldset class="${className}__setting ${className}-setting">
      <legend>設定</legend>
      <div class="${className}-setting__item">
        <p>予選表形式</p>
        <div class="--labelList">
          <label>
            <span>リスト</span>
            <input type="radio" name="event-name" value="${className}">
            <span class="--form-alert-message"></span>
          </label>
          <label>
            <span>対戦表</span>
            <input type="radio" name="event-name" value="${className}">
            <span class="--form-alert-message"></span>
          </label>
        </div>
      </div>
    </fieldset>
    `;
  }

  getFrameHTML() {
    const { className } = this;
    return `
    <div></div>
    `;
  }
}
