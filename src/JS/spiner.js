import Notiflix from 'notiflix';

export const spiner = {
  options: {
    svgSize: '90px',
    svgColor: 'rgba(255, 0, 27, 1)',
    messageFontSize: '16px',
    messageColor: 'rgba(255, 0, 27, 1)'
  },

  start() {
    return Notiflix.Loading.pulse('Searching films...', this.options);
  },

  stop() {
    Notiflix.Loading.remove();
  },
};