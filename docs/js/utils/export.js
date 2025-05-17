// import html2pdf from 'https://cdn.skypack.dev/html2pdf.js';

export const exportMedia = {
  htmlToPDF({ target, option, handler = () => {} }) {
    window
      .html2pdf()
      .set(option)
      .from(target)
      .save()
      .then(() => {
        handler();
      });
  },
};
