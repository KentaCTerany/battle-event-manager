// PDF.js v2.10.377
const pdfjsLib = window.pdfjsLib;

if (pdfjsLib) {
  // ワーカーとCMAPのパスを設定
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
  // CMAPのベースパスを設定
  const CMAP_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.10.377/cmaps/';
  const CMAP_PACKED = true;

  // デフォルトの設定を上書き
  const DEFAULT_OPTIONS = {
    cMapUrl: CMAP_URL,
    cMapPacked: CMAP_PACKED,
    standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.10.377/standard_fonts/',
  };

  // PDFの読み込み設定をエクスポート
  pdfjsLib.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
}

export { pdfjsLib };
