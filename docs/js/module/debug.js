const getDebugModeState = () => !!new URL(location.href).searchParams.get('debug-mode');
const logger = ['log', 'warn', 'error'].reduce((acc, level) => {
  acc[level] = getDebugModeState() ? console[level].bind(console) : () => false;
  return acc;
}, {});

export const setDebugMode = () => {
  window.BEM_app = window.BEM_app || {};
  window.BEM_app.debug = window.BEM_app.debug || {};
  window.BEM_app.debug.state = getDebugModeState();
  window.BEM_app.debug.cs = logger;

  if (window.BEM_app.debug.state) logDebugMessage();
};

const logDebugMessage = () => {
  const texts = [' ■■■ DEBUG MODE ON ■■■ \n', '// window.BEM_app.debug.log()で記述されたログが出力されます\n// このモードは、debug-mode=1パラメータを付与してアクセスすることでONになります'];
  const bodyTextStyle = 'background-color:#fff; color:#333; line-height:1.5; padding-inline:0.5em;';
  const styleTexts = ['color:#620000; background-color:#FFE380; text-align:center; font-weight:bold; font-size: 1rem; line-height:1.5; margin-bottom: 0.25em;', bodyTextStyle];

  console.log('%c' + texts.map((text) => text).join('%c'), ...styleTexts);
};
