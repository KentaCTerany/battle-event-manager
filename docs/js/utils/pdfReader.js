import { pdfjsLib } from '../lib/pdf.js';

export class PDFReader {
  constructor() {
    // WorkerSrcは既にpdf.jsで設定されているので、ここでは設定不要
  }

  async readPDF(file) {
    try {
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      // デフォルトのオプションを使用してPDFを読み込む
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        ...pdfjsLib.DEFAULT_OPTIONS,
      });
      const pdf = await loadingTask.promise;
      const textContent = await this.extractText(pdf);
      return this.parseEntries(textContent);
    } catch (error) {
      console.error('PDFの読み取りに失敗しました:', error);
      throw error;
    }
  }

  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async extractText(pdf) {
    let fullText = '';
    console.log(`PDFの総ページ数: ${pdf.numPages}`);

    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`ページ ${i} の処理開始`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // 各テキスト要素の位置情報も含めて取得
      const items = textContent.items.map((item) => ({
        text: item.str,
        x: Math.round(item.transform[4]), // X座標
        y: Math.round(item.transform[5]), // Y座標
        fontSize: Math.round(item.transform[0]), // フォントサイズ
      }));

      // Y座標でグループ化（同じ行のテキスト）
      const lineGroups = {};
      items.forEach((item) => {
        const y = item.y;
        if (!lineGroups[y]) {
          lineGroups[y] = [];
        }
        lineGroups[y].push(item);
      });

      // Y座標で降順ソート（上から下）
      const sortedYs = Object.keys(lineGroups).sort((a, b) => b - a);

      // 各行のテキストを結合
      sortedYs.forEach((y) => {
        // X座標でソート（左から右）
        const lineItems = lineGroups[y].sort((a, b) => a.x - b.x);
        const lineText = lineItems.map((item) => item.text).join(' ');
        if (lineText.trim()) {
          fullText += lineText + '\n';
        }
      });

      console.log(`ページ ${i} から抽出されたテキスト:`, fullText);
    }
    return fullText;
  }

  parseEntries(text) {
    console.log('解析開始テキスト:', text);

    // 空行を除去し、意味のある行だけを抽出
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    console.log('処理対象の行:', lines);

    const entries = [];
    let currentEntry = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      console.log('処理中の行:', line);

      // タブまたは複数のスペースで分割
      const parts = line.split(/[\t\s]{2,}/).map((part) => part.trim());
      console.log('分割結果:', parts);

      if (parts[0] === 'ﾁｪｯｸ') continue;

      if (parts.length >= 2) {
        // 2つ以上の要素がある場合はエントリーとして扱う
        entries.push({
          name: parts[1] || '',
          desc: parts[3] || '',
          info: '',
        });
      }
    }

    console.log('解析結果:', entries);
    return entries;
  }
}
