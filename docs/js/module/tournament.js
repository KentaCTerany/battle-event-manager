import html2pdf from 'https://cdn.skypack.dev/html2pdf.js'

const battlerList = [
  { name: '1位', desc: '( 所属 )', info: '1位' },
  { name: '2位', desc: '( 所属 )', info: '2位' },
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
]

export default class TournamentGenerator {
  constructor({ app, mode = 'random' }) {
    this.app = app
    this.mode = mode
    this.battlerList = battlerList

    this.container = null
    this.matchNum = null
  }

  init() {
    this.checkBattlerLength()
    this.generateTounament()
    this.setBattlers()
    // this.setMatch();
    this.addEvents()
  }

  addEvents() {
    document.addEventListener('click', (e) => {
      const { target } = e
      const hasClass = (className) => target.classList.contains(className)

      if (hasClass('BEMTournamentPDFControl_button')) this.exportToPDF()
    })
  }

  checkBattlerLength() {
    if (!this.isPowerOfTwo(this.battlerList.length)) this.fillBattlerListItem()
    this.matchNum = Math.log2(this.battlerList.length)
  }

  generateTounament() {
    if (this.matchNum < 2) {
      console.warn(
        'WARN: 参加者の数が足りません。トーナメントを生成するには3名以上の参加者が必要です。'
      )
      return
    }

    const html = `
    <div class="BEMTournamentPDFControl">
      <button class="BEMTournamentPDFControl_button">PDF出力</button>
    </div>

    <div class="BEMTournament">
      ${this.getMatchHTML()}
    </div>
    `

    this.app.container.insertAdjacentHTML('beforeend', html)
    this.container = this.app.container.querySelector('.BEMTournament')
  }

  createMatchInputPanel() {
    let panelHTML = `<div class="match-input-panel">`

    this.matchList.forEach((match, i) => {
      panelHTML += `
        <div class="match-input">
          <p>試合 ${i + 1} (${match.battlerA.name} vs ${
        match.battlerB.name
      })</p>
          <label><input type="radio" name="match-${match.id}" value="0"> ${
        match.battlerA.name
      }</label>
          <label><input type="radio" name="match-${match.id}" value="1"> ${
        match.battlerB.name
      }</label>
        </div>
      `
    })

    panelHTML += `</div>`

    // 生成したHTMLを指定した場所に挿入
    this.container.insertAdjacentHTML('beforeend', panelHTML)

    // ラジオボタン選択時に matchList を更新
    this.container.addEventListener('change', (e) => {
      const matchId = e.target.name.split('-')[1]
      const match = this.matchList.find((m) => m.id === parseInt(matchId))

      if (match) {
        match.winner = parseInt(e.target.value)
        this.updateTournamentWinner(match)
      }
    })
  }

  setBattlers() {
    const battlerContainerElems = this.app.container.getElementsByClassName(
      'BEMTournamentBattlerContainer'
    )

    ;[...battlerContainerElems].forEach((container, index) => {
      container.dataset.index = index + 1
    })

    if (this.mode === 'ranking') {
      this.setBattlersByRank()
    }
  }

  setBattlersByRank() {
    const { battlerList } = this
    const seedOrder = this.getTournamentSeedOrder()
    console.log(seedOrder)

    const arranged = seedOrder.map((seed) => battlerList[seed - 1])
    const battlerContainers = this.app.container.querySelectorAll(
      '.BEMTournamentBattlerContainer'
    )

    arranged.reverse().forEach((battler, index) => {
      const container = battlerContainers[index]
      const nameElem = container.querySelector('.-name')
      const descElem = container.querySelector('.-desc')
      const infoElem = container.querySelector(
        '.BEMTournamentBattlerContainer_info'
      )

      nameElem.textContent = battler.name
      descElem.textContent = battler.desc
      infoElem.textContent = battler.info
    })
  }

  getMatchHTML(index = 0) {
    const matchIndex = this.matchNum - index
    const isFinal = matchIndex === this.matchNum
    const battlerHTML = this.getBattlerHTML(index, matchIndex)

    return `
    <div class="BEMTournamentMatch${isFinal ? ' -final' : ''}">
      <div class="BEMTournamentMatch_battler">
        ${battlerHTML}
      </div>
      <div class="BEMTournamentMatch_game">
        <div class="BEMTournamentMatch_side -sideA"></div>
        <div class="-desc"></div>
        <div class="BEMTournamentMatch_side -sideB"></div>
        ${isFinal ? `<div class="BEMTournamentMatch_winner"></div>` : ''}
      </div>
    </div>
    `
  }

  getBattlerHTML(index, matchIndex) {
    let html = ''

    for (let i = 0; i < 2; i++) {
      // 初回 決勝戦の場合
      if (matchIndex === this.matchNum) {
        html += `<div class="BEMTournament_block">${this.getMatchHTML(
          index + 1
        )}</div>`

        // 最後 初戦の場合
      } else if (matchIndex === 1) {
        html += `
          <div class="BEMTournamentBattlerContainer">
            <div class="BEMTournamentBattlerContainer_info"></div>
            <div class="BEMTournamentBattlerContainer_card"><span class="-name"></span><span class="-desc"></span>
            </div>
          </div>`

        //それ以外 通常の試合
      } else {
        html += `${this.getMatchHTML(index + 1)}`
      }
    }
    if (matchIndex === 1) {
      html = `<div class="BEMTournamentBattler">${html}</div>`
    }
    return html
  }

  // シード順をトーナメント配置に並び替える関数
  getTournamentSeedOrder() {
    const buildSeeds = (size) => {
      if (size === 1) return [1]

      const prev = buildSeeds(size / 2)
      const result = []

      for (let i = 0; i < prev.length; i++) {
        result.push(prev[i])
        result.push(size + 1 - prev[i])
      }

      return result
    }

    return buildSeeds(this.battlerList.length)
  }

  fillBattlerListItem() {
    const battlersNum = this.battlerList.length
    const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(battlersNum)))
    const missingBattlers = nextPowerOfTwo - battlersNum

    for (let i = 0; i < missingBattlers; i++) {
      this.battlerList.push({ name: '', desc: '', info: '' })
    }
  }

  isPowerOfTwo(num) {
    return num > 0 && (num & (num - 1)) === 0
  }

  exportToPDF() {
    const element = this.container // トーナメント表を囲むDOM
    this.container.classList.add('-html2pdf')

    const opt = {
      margin: 0,
      filename: 'tournament.pdf',
      image: { type: 'jpg', quality: 1 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
    }

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        this.container.classList.remove('-html2pdf')
      })
  }
}
