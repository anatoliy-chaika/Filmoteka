import * as basicLightbox from 'basiclightbox';
import { API } from './service';
import { filmBoxRef } from './helpers';
import { storage } from './localStorage.js';
import Notiflix from 'notiflix';
import 'basiclightbox/dist/basicLightbox.min.css';

filmBoxRef.addEventListener('click', onContainerClick);

async function onContainerClick(evt) {
  if (evt.target.classList.contains('js-films-list')) return;

  filmBoxRef.removeEventListener('click', onContainerClick);
  try {
    const filmId = Number(
      evt.target.closest('.movie_card').attributes.getNamedItem('js-id').value
    );
    const movie = await API.fetchById(filmId);
    if (!movie)
      throw new Error('❌ Something go wrong, so we can`t load your film');
    const modal = createModal(renderModalMarcup(movie));
    modal.show();
    document.body.style.overflow = 'hidden';
    modalCloseByBackdropClick(modal);
    checkAndDisableButtons(filmId, movie);

    // Отримую доступ до кнопки показу трейлеру та приховую її
    const trailerBtnRef = document.querySelector('.trailer-btn');
    trailerBtnRef.style.display = 'none';

    // У відповіді від сервера отримую інфо, чи є по обраному фільму масив з відео, а також перевіряю наявність саме трейлеру
    const videos = movie.videos.results;
    if (videos.length > 0) {
      videos.every(video => !video.type.includes('Trailer'))
        ? (trailerBtnRef.style.display = 'none')
        : (trailerBtnRef.style.display = 'block');
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

function checkAndDisableButtons(filmId, movie) {
  const btnWatched = document.querySelector('.movie__to-watched');
  const btnQueue = document.querySelector('.movie__to-queue');

  if (!storage.signIn) {
    btnWatched.style.display = 'none';
    btnQueue.style.display = 'none';
    return;
  }

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

  (async () => {
    if (await storage.checkWatched(filmId)) {
      btnWatched.textContent = 'Moved to Watched';
      btnWatched.setAttribute('js-disabled', '');
    }
  })();

  (async () => {
    if (await storage.checkQueue(filmId)) {
      btnQueue.textContent = 'Moved to Queue';
      btnQueue.setAttribute('js-disabled', '');
    }
  })();

  btnWatched.addEventListener('click', setWatchedClick);
  btnQueue.addEventListener('click', setQueueClick);
}

function createModal(markup) {
  const modal = basicLightbox.create(markup, {
    onShow: modalCloseByEsc,
    onClose: () => {
      document.body.style.overflow = '';
      filmBoxRef.addEventListener('click', onContainerClick);
    },
  });

  return modal;
}

function renderModalMarcup({
  poster_path,
  original_title,
  vote_average,
  vote_count,
  popularity,
  genres,
  overview,
}) {
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
              <td class="character__item">${
                genres.length === 0 ? 'Another genre' : genres[0].name
              }</td>
            </tr>
          </tbody>
        </table>
        <p class="movie__about">About</p>
        <p class="movie__about-description">
        ${overview}
        </p>
        <ul class="button__list">
          <li class="button__item">
            <button class="movie__to-watched" type="button">
              add to Watched
            </button>
          </li>
          <li class="button__item">
            <button class="movie__to-queue" type="button">add to queue</button>
          </li>
        </ul>
        <button class="trailer-btn" type="button">watch trailer</button>
      </div>
    </div>
  </div>`;
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

export function modalCloseByEsc(instance) {
  const onPressEsc = e => {
    if (e.code !== 'Escape') return false;
    instance.close();
    document.removeEventListener('keydown', onPressEsc);
  };
  document.addEventListener('keydown', onPressEsc);
}

export function createModalForTrailer(markup) {
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
