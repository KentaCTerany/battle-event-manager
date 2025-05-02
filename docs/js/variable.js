window.BattleEventManager = {};
window.BattleEventManager.consoleCustomLog = ({ text, style }, contents = []) => {
  console.log(`%c${text}%c %cTournamentManager%c`, `color:${style.color}; background-color:${style.bgColor}; padding:2px 4px; border-radius:4px; margin:0.5rem 0 0.2rem;`, ``, `font-size:0.8rem;font-weight:700;`, ``, ...contents);
};
