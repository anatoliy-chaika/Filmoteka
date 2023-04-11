import * as basicLightbox from 'basiclightbox';
import { API } from './JS/service';
import { filmBoxRef, listButton } from './JS/helpers';
import promice, { storage } from './JS/localStorage';
if (!storage.signIn) {
  window.location.replace('./index.html');
}
import {
  renderFilms,
  pagination,
  renderPagination,
} from './JS/renderFunctions';
import { spiner } from './JS/spiner.js';
import Notiflix from 'notiflix';
import 'basiclightbox/dist/basicLightbox.min.css';

listButton.addEventListener('click', onClick);
const queueBtn = document.querySelector('.js-queue');
queueBtn.click();

function onClick(evt) {
  const initFunc = () => {
    document
      .querySelector('.js-watched')
      .classList.toggle('buttons__style--focus');
    document
      .querySelector('.js-queue')
      .classList.toggle('buttons__style--focus');
    filmBoxRef.removeEventListener('click', onContainerClickWatch);
    filmBoxRef.removeEventListener('click', onContainerClickQueue);
  };

  if (evt.target.classList.contains('js-watched')) {
    (async () => {
      spiner.start();
      initFunc();
      const films = await storage.getTwentyFromWatch();
      if (films.length === 0) {
        filmBoxRef.innerHTML =
          '<div style="width: 100%;"><img src="https://myron5.github.io/goit-js-hw-07/img-watch.jpg" style="width: 100%; object-fit: cover;"></div>';
        Notiflix.Notify.warning("🙈 You haven't watched films");
        spiner.stop();
        return;
      } else {
        renderFilms(films, filmBoxRef);
        const paginationArr = pagination(
          storage.getPageWatch(),
          storage.getMaxWatch()
        );
        filmBoxRef.setAttribute('data-id', 'watch-gallery');
        renderPagination(paginationArr, filmBoxRef);
        filmBoxRef.addEventListener('click', onContainerClickWatch);
        spiner.stop();
      }
    })();
  } else if (evt.target.classList.contains('js-queue')) {
    (async () => {
      spiner.start();
      initFunc();
      const films = await storage.getTwentyFromQueue();
      if (films.length === 0) {
        filmBoxRef.innerHTML =
          '<div style="width: 100%;"><img src="https://myron5.github.io/goit-js-hw-07/img-queue.jpg" style="width: 100%; object-fit: cover;"></div>';
        Notiflix.Notify.warning("🗃 You haven't queued films");
        spiner.stop();
        return;
      } else {
        renderFilms(films, filmBoxRef);
        promice.then(() => {
          const paginationArr = pagination(
            storage.getPageQueue(),
            storage.getMaxQueue()
          );
          filmBoxRef.setAttribute('data-id', 'queue-gallery');
          renderPagination(paginationArr, filmBoxRef);
          filmBoxRef.addEventListener('click', onContainerClickQueue);
        });

        spiner.stop();
      }
    })();
  } else return;
}

function onContainerClickWatch(e) {
  onContainerClick(e, 'watch');
}

function onContainerClickQueue(e) {
  onContainerClick(e, 'queue');
}

async function onContainerClick(evt, section) {
  if (evt.target.classList.contains('js-films-list')) {
    return;
  }
  filmBoxRef.removeEventListener('click', onContainerClickWatch);
  filmBoxRef.removeEventListener('click', onContainerClickQueue);
  try {
    const filmId = Number(
      evt.target.closest('.movie_card').attributes.getNamedItem('js-id').value
    );
    const movie = await API.fetchById(filmId);
    if (!movie)
      throw new Error('❌ Something go wrong, so we can`t load your film');

    const modal = createModal(renderModalMarcup(movie, section), section);
    modal.show();
    modalCloseByBackdropClick(modal);
    onDeleteFilm(filmId, modal, section);
    checkAndDisableButtons(filmId, movie, section);

    // Отримую доступ до кнопки показу трейлеру та приховую її
    const trailerBtnRef = document.querySelector('.trailer-btn');
    trailerBtnRef.hidden = true;

    // У відповіді від сервера отримую інфо, чи є по обраному фільму масив з відео, а також перевіряю наявність саме трейлеру
    const videos = movie.videos.results;
    if (videos.length > 0) {
      videos.every(video => !video.type.includes('Trailer'))
        ? (trailerBtnRef.hidden = true)
        : (trailerBtnRef.hidden = false);
    }

    // Додаю слухач на кнопку трейлера, колбек ф-я якої одразу створює модалку з трейлером та показує її
    trailerBtnRef.addEventListener('click', () => {
      const film = videos.find(film => {
        if (film.type === 'Trailer') {
          return film;
        }
      });
      const trailerModalInsatance = createModalForTrailer(renderVideo(film));
      trailerModalInsatance.show();
      modalCloseByBackdropClick(trailerModalInsatance);
    });
  } catch (err) {
    Notiflix.Notify.failure(err.message);
    console.log(err.message);
  }
}

function createModal(markup, section) {
  const modal = basicLightbox.create(markup, {
    onShow: modalCloseByEsc,
    onClose: instance => {
      if (section == 'watch')
        filmBoxRef.addEventListener('click', onContainerClickWatch);
      else filmBoxRef.addEventListener('click', onContainerClickQueue);
    },
  });

  return modal;
}

function renderModalMarcup(
  {
    poster_path,
    original_title,
    vote_average,
    vote_count,
    popularity,
    genres,
    overview,
  },
  section
) {
  let delBtnMarkup = '';
  let addBtnMarkup = '';
  if (section == 'queue') {
    delBtnMarkup =
      '<button class="movie__to-queue" type="button">Delete from Queue</button>';
    addBtnMarkup =
      '<button class="movie__watched" type="button">add to Watched</button>';
  } else if (section == 'watch') {
    delBtnMarkup =
      '<button class="movie__to-watched" type="button">Delete from Watched</button>';
    addBtnMarkup =
      '<button class="movie__queue" type="button">add to queue</button>';
  }
  return `
  <div class="modal">
    <button class="button__modal" type="button">
    </button>
    <div class="movie__description-card">
      <div class="div__movie-img" >
        <img
          class="movie__img"
          src="https://image.tmdb.org/t/p/w500${poster_path}"
          alt="info of movie"
        />
      </div>
      <div class="movie__desc">
        <p class="movie__title">${original_title}</p>
        <table class="movie__characters">
          <tbody class="character__table">
            <tr>
              <td class="character">Vote / Votes</td>
              <td class="character__item "><span class="vote">${vote_average.toFixed(
                1
              )}</span><span class="vote__slash">/</span><span class="vote__grey">${vote_count}</span></td>
            </tr>
            <tr>
              <td class="character">Popularity</td>
              <td class="character__item">${popularity.toFixed(1)}</td>
            </tr>
            <tr>
              <td class="character">Original Title</td>
              <td class="character__item">${original_title}</td>
            </tr>
            <tr>
              <td class="character">Genre</td>
              <td class="character__item">${genres[0].name}</td>
            </tr>
          </tbody>
        </table>
        <p class="movie__about">About</p>
        <p class="movie__about-description">
        ${overview}
        </p>
        <ul class="button__list">
          <li class="button__item">${delBtnMarkup}</li>
          <li class="button__item">${addBtnMarkup}</li>
        </ul>
        <button class="trailer-btn trailer-btn--mtzero" type="button">watch trailer</button>
      </div>
    </div>
  </div>`;
}

function checkAndDisableButtons(filmId, movie, section) {
  const btnWatched = document.querySelector('.movie__watched');
  const btnQueue = document.querySelector('.movie__queue');

  const setWatchedClick = e => {
    e.preventDefault();
    if (e.target.hasAttribute('js-disabled')) {
      Notiflix.Notify.warning(
        '🎬 Your film has already sucessfully been added'
      );
      return;
    }

    storage.addFilmToWatch(movie);
    btnWatched.textContent = 'Moved to Watched';
    btnWatched.setAttribute('js-disabled', '');
  };

  const setQueueClick = e => {
    e.preventDefault();
    if (e.target.hasAttribute('js-disabled')) {
      Notiflix.Notify.warning(
        '🎬 Your film has already sucessfully been added'
      );
      return;
    }
    storage.addFilmToQueue(movie);
    btnQueue.textContent = 'Moved to Queue';
    btnQueue.setAttribute('js-disabled', '');
  };

  if (section == 'watch') {
    (async () => {
      if (await storage.checkQueue(filmId)) {
        btnQueue.textContent = 'Moved to Queue';
        btnQueue.setAttribute('js-disabled', '');
      }
      btnQueue.addEventListener('click', setQueueClick);
    })();
  } else if (section == 'queue') {
    (async () => {
      if (await storage.checkWatched(filmId)) {
        btnWatched.textContent = 'Moved to Watched';
        btnWatched.setAttribute('js-disabled', '');
      }
      btnWatched.addEventListener('click', setWatchedClick);
    })();
  }
}

function modalCloseByBackdropClick(instance) {
  const modalBtn = instance.element().querySelector('button');
  const onBackdropClick = e => {
    e.preventDefault();
    instance.close();
    modalBtn.removeEventListener('click', onBackdropClick);
  };
  modalBtn.addEventListener('click', onBackdropClick);
}

function modalCloseByEsc(instance) {
  const onPressEsc = e => {
    if (e.code !== 'Escape') return false;
    instance.close();
    document.removeEventListener('keydown', onPressEsc);
  };
  document.addEventListener('keydown', onPressEsc);
}

function createModalForTrailer(markup) {
  const trailerModal = basicLightbox.create(markup, {
    onShow: modalCloseByEsc,
  });
  return trailerModal;
}

function renderVideo({ key }) {
  return `<iframe
  width="1141"
  height="641"
  src="https://www.youtube.com/embed/${key}"
  frameborder="0"
  allowfullscreen
></iframe>
  <button type="button" class="button__trailer--close"></button>`;
}

function onDeleteFilm(filmId, modal, section) {
  const btnWatched = document.querySelector('.movie__to-watched');
  const btnQueue = document.querySelector('.movie__to-queue');

  const deleteWatchedClick = e => {
    (async () => {
      e.preventDefault();
      await storage.delFilmFromWatch(filmId);
      const filmsToWatch = await storage.getTwentyFromWatch();
      renderFilms(filmsToWatch, filmBoxRef);
      const paginationArr = pagination(
        storage.getPageWatch(),
        storage.getMaxWatch()
      );
      renderPagination(paginationArr, filmBoxRef);
      modal.close();
      if (filmsToWatch.length === 0) {
        const paginationUlRef = document.querySelector('.pagination');
        paginationUlRef.innerHTML = '';
        filmBoxRef.innerHTML =
          '<div style="width: 100%;"><img src="https://myron5.github.io/goit-js-hw-07/img-watch.jpg" style="width: 100%; object-fit: cover;"></div>';
        Notiflix.Notify.warning("🙈 You haven't watched films");
      }
    })();
  };

  const deleteQueueClick = e => {
    (async () => {
      e.preventDefault();
      await storage.delFilmFromQueue(filmId);
      const filmsToQueue = await storage.getTwentyFromQueue();
      renderFilms(filmsToQueue, filmBoxRef);
      const paginationArr = pagination(
        storage.getPageQueue(),
        storage.getMaxQueue()
      );
      renderPagination(paginationArr, filmBoxRef);
      modal.close();
      if (filmsToQueue.length === 0) {
        const paginationUlRef = document.querySelector('.pagination');
        paginationUlRef.innerHTML = '';
        filmBoxRef.innerHTML =
          '<div style="width: 100%;"><img src="https://myron5.github.io/goit-js-hw-07/img-queue.jpg" style="width: 100%; object-fit: cover;"></div>';
        Notiflix.Notify.warning("🗃 You haven't queued films");
      }
    })();
  };

  if (section == 'watch')
    btnWatched.addEventListener('click', deleteWatchedClick);
  else if (section == 'queue')
    btnQueue.addEventListener('click', deleteQueueClick);
}
