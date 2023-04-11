import Notiflix from 'notiflix';
import { initializeApp } from 'firebase/app';
import { getDatabase, get, set, ref } from 'firebase/database';
import { firebaseConfig } from './helpers';

class FilmsLocalStorage {
  #WATCH_KEY;
  #QUEUE_KEY;

  #database;

  constructor() {}

  async resetConstructor() {
    this.pageWatch = 1;
    this.pageQueue = 1;

    this.signIn = true;

    const account = JSON.parse(localStorage.getItem('account'));
    if (!account) {
      Notiflix.Notify.warning('➡ You have to sign in first');
      console.log('➡ You have to sign in first');
      this.signIn = false;
      return Promise.reject('fail');
    }

    this.uid = account.id;

    this.#WATCH_KEY = /users/ + 'watch' + this.uid;
    this.#QUEUE_KEY = /users/ + 'queue' + this.uid;

    const app = initializeApp(firebaseConfig);
    this.#database = getDatabase(app);

    try {
      const snapshotWatch = await get(ref(this.#database, this.#WATCH_KEY));
      const snapshotQueue = await get(ref(this.#database, this.#QUEUE_KEY));

      const filmsArrWatch = snapshotWatch.val() || [];
      const filmsArrQueue = snapshotQueue.val() || [];

      this.maxWatch = Math.ceil(filmsArrWatch.length / 20);
      this.maxQueue = Math.ceil(filmsArrQueue.length / 20);
    } catch (err) {
      this.signIn = false;
      Notiflix.Notify.warning(
        '👾 There is problem with Internet, try again later'
      );
      console.log(err.message);
      return;
    }

    return Promise.resolve('sucess');
  }

  incrementPageWatch() {
    if (this.pageWatch === this.maxWatch) {
      return;
    }
    this.pageWatch += 1;
  }

  decrementPageWatch() {
    if (this.pageWatch === 1) {
      return;
    }
    this.pageWatch -= 1;
  }

  incrementPageQueue() {
    if (this.pageQueue === this.maxQueue) {
      return;
    }
    this.pageQueue += 1;
  }

  decrementPageQueue() {
    if (this.pageQueue === 1) {
      return;
    }
    this.pageQueue -= 1;
  }

  async getTwentyFromWatch() {
    try {
      const snapshot = await get(ref(this.#database, this.#WATCH_KEY));
      const filmsArr = snapshot.val() || [];
      const from = 20 * (this.pageWatch - 1);
      const to = 20 * this.pageWatch - 1;
      return filmsArr.slice(from, to);
    } catch (err) {
      Notiflix.Notify.warning(
        '👾 There is problem with Internet, try again later'
      );
      console.log(err);
    }
  }

  async getTwentyFromQueue() {
    try {
      const snapshot = await get(ref(this.#database, this.#QUEUE_KEY));
      const filmsArr = snapshot.val() || [];
      const from = 20 * (this.pageQueue - 1);
      const to = 20 * this.pageQueue - 1;
      return filmsArr.slice(from, to);
    } catch (err) {
      Notiflix.Notify.warning(
        '👾 There is problem with Internet, try again later'
      );
      console.log(err);
    }
  }

  async checkWatched(id) {
    try {
      const snapshot = await get(ref(this.#database, this.#WATCH_KEY));
      const filmsArr = snapshot.val() || [];

      return filmsArr.some(film => film.id == id);
    } catch (err) {
      Notiflix.Notify.warning(
        '👾 There is problem with Internet, try again later'
      );
      console.log(err);
    }
  }

  async checkQueue(id) {
    try {
      const snapshot = await get(ref(this.#database, this.#QUEUE_KEY));
      const filmsArr = snapshot.val() || [];

      return filmsArr.some(film => film.id == id);
    } catch (err) {
      Notiflix.Notify.warning(
        '👾 There is problem with Internet, try again later'
      );
      console.log(err);
    }
  }

  async addFilmToWatch(film) {
    try {
      const snapshot = await get(ref(this.#database, this.#WATCH_KEY));
      const filmsArr = snapshot.val() || [];

      filmsArr.unshift(film);
      set(ref(this.#database, this.#WATCH_KEY), filmsArr);
    } catch (err) {
      Notiflix.Notify.warning(
        '👾 There is problem with Internet, try again later'
      );
      console.log(err);
    }
  }

  async addFilmToQueue(film) {
    try {
      const snapshot = await get(ref(this.#database, this.#QUEUE_KEY));
      const filmsArr = snapshot.val() || [];

      filmsArr.unshift(film);
      set(ref(this.#database, this.#QUEUE_KEY), filmsArr);
    } catch (err) {
      Notiflix.Notify.warning(
        '👾 There is problem with Internet, try again later'
      );
      console.log(err);
    }
  }

  async delFilmFromWatch(id) {
    try {
      const snapshot = await get(ref(this.#database, this.#WATCH_KEY));
      let filmsArr = snapshot.val() || [];

      filmsArr = filmsArr.filter(film => film.id != id);
      set(ref(this.#database, this.#WATCH_KEY), filmsArr);
    } catch (err) {
      Notiflix.Notify.warning(
        '👾 There is problem with Internet, try again later'
      );
      console.log(err);
    }
  }

  async delFilmFromQueue(id) {
    try {
      const snapshot = await get(ref(this.#database, this.#QUEUE_KEY));
      let filmsArr = snapshot.val() || [];

      filmsArr = filmsArr.filter(film => film.id != id);
      set(ref(this.#database, this.#QUEUE_KEY), filmsArr);
    } catch (err) {
      Notiflix.Notify.warning(
        '👾 There is problem with Internet, try again later'
      );
      console.log(err);
    }
  }

  setPageWatch(value) {
    this.pageWatch = value;
  }

  setPageQueue(value) {
    this.pageQueue = value;
  }

  getPageWatch() {
    return this.pageWatch;
  }

  getPageQueue() {
    return this.pageQueue;
  }

  getMaxWatch() {
    return this.maxWatch;
  }

  getMaxQueue() {
    return this.maxQueue;
  }
}

let storage;

export default (async () => {
  storage = new FilmsLocalStorage();
  await storage.resetConstructor();
})();

export { storage };
