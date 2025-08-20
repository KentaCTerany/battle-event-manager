// import html2pdf from 'https://cdn.skypack.dev/html2pdf.js';

export const exportMedia = {
  htmlToPDF({ target, option, handler = () => {} }) {
    const headerStyleDisplay = document.querySelector('.BEM-app-header').style.display;
    const navStyleDisplay = document.querySelector('.BEM-app-side-nav').style.display;
    document.querySelector('.BEM-app-header').style.display = 'none';
    document.querySelector('.BEM-app-side-nav').style.display = 'none';

    window
      .html2pdf()
      .set(option)
      .from(target)
      .save()
      .then(() => {
        window.print();

        // handler();
        // document.querySelector('.BEM-app-header').style.display = headerStyleDisplay;
        // document.querySelector('.BEM-app-side-nav').style.display = navStyleDisplay;
      });
  },
};
