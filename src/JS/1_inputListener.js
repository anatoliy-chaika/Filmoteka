import { filmBoxRef, formRef } from './helpers';
import { API } from './service';
import { renderFilms, pagination, renderPagination } from './renderFunctions';
import { spiner } from './spiner.js';
import Notiflix from 'notiflix';

(async () => {
  spiner.start();
  const popularFilmsList = await API.fetchPopularMovies();
  renderFilms(popularFilmsList, filmBoxRef);
  const paginationArr = pagination(API.getPage(), API.getMax());
  renderPagination(paginationArr, filmBoxRef);
  spiner.stop();
})();

async function onSubmit(e) {
  e.preventDefault();
  API.resetPage();
  const value = e.target[0].value;
  if (value) {
    spiner.start();
    API.setSearchQuery(value);
    const filmListData = await API.fetchKeyword();
    if (!filmListData.length) {
      filmBoxRef.innerHTML =
        '<div style="width: 100%;"><img src="https://myron5.github.io/goit-js-hw-07/img-keyword.jpg" style="width: 100%; object-fit: cover;"></div>';
      Notiflix.Notify.warning('💔 Sorry but we can`t find films for this word');
      spiner.stop();
      return;
    }
    renderFilms(filmListData, filmBoxRef);
    const paginationArr = pagination(API.getPage(), API.getMax());
    renderPagination(paginationArr, filmBoxRef);
    spiner.stop();
  }
}

formRef.addEventListener('submit', onSubmit);
