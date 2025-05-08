export default class TournamentGenerator {
  constructor({ tournamentApp }) {
    this.app = tournamentApp;
  }

  generateHTML(battlers, matchNum) {
    const matchTree = this.getMatchTree(battlers);
    return `
      <div class="BEM-tournament_body">
        ${this.getMatchHTML(matchTree, matchNum)}
      </div>
      <div class="BEM-tournament_option BEM-tournament-option">
        <button class="BEM-tournament-option_reset">ALL RESET</button>
      </div>
    `;
  }

  getTournamentSeedOrder() {
    const buildSeeds = (size) => {
      if (size === 1) return [1];
      const prev = buildSeeds(size / 2);
      return prev.flatMap((i) => [i, size + 1 - i]);
    };
    return buildSeeds(this.app.battlerList.length);
  }

  getMatchTree(battlers) {
    const depthCounters = {};

    const queue = battlers.map((battler, index) => ({
      id: crypto.randomUUID(),
      player: battler,
      children: null,
      depth: 0,
      matchIndex: index,
    }));

    depthCounters[0] = battlers.length;

    while (queue.length > 1) {
      const left = queue.shift();
      const right = queue.shift();

      const parentDepth = Math.max(left.depth, right.depth) + 1;

      if (depthCounters[parentDepth] === undefined) {
        depthCounters[parentDepth] = 0;
      }

      left.side = 'A';
      right.side = 'B';

      const parent = {
        id: crypto.randomUUID(),
        children: [left, right],
        depth: parentDepth,
        matchIndex: depthCounters[parentDepth],
      };

      depthCounters[parentDepth]++;

      queue.push(parent);
    }

    return queue[0];
  }

  getMatchHTML(node, depth) {
    if (!node) return '';

    if (!node.children) return this.renderLeaf(node);

    const isFinal = depth === this.app.matchNum;
    const childrenHTML = node.children
      .map((child) => {
        const html = this.getMatchHTML(child, depth - 1);
        return isFinal ? `<div class="BEM-tournament-block">${html}</div>` : html;
      })
      .join('');

    return this.renderMatch(node, childrenHTML, depth, isFinal);
  }

  renderLeaf(node) {
    const player = node.player || {};
    return `
      <div class="BEM-tournament-bracket" data-entry="${player.entryIndex}">
        <div class="BEM-tournament-bracket_info">${player.info}</div>
        <div class="BEM-tournament-bracket_container">
          <span class="-name">${player.name}</span>
          <span class="-desc">${player.desc}</span>
        </div>
      </div>
    `;
  }

  renderMatch(node, childrenHTML, depth, isFinal) {
    const sideAttribute = node.side ? `data-side="${node.side}"` : '';
    const battlers = node.children.map(({ player }) => player);

    return `
      <div class="BEM-tournament-match" ${sideAttribute} data-index="${depth}" data-id="${node.id}">
        <div class="BEM-tournament-match_bracket">
          ${childrenHTML}
        </div>
  
        <div class="BEM-tournament-match_result BEM-tournament-result" data-id="${node.id}">
          <div class="BEM-tournament-result_side -sideA"></div>
          <div class="BEM-tournament-result_desc" aria-hidden="true">延<br>長</div>
          <div class="BEM-tournament-result_side -sideB"></div>
          ${
            isFinal
              ? `<div class="BEM-tournament-result_winner">
                  <span class="-name"></span><span class="-desc"></span>
                </div>`
              : ''
          }
        </div>
  
        ${this.app.resultPanel.getResultPanelHTML({ depth, matchIndex: node.matchIndex, battlers })}
      </div>
    `;
  }
}
