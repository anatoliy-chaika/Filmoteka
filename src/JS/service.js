import axios from 'axios';
import Notiflix from 'notiflix';

class FILMAPI {
  #API_KEY;
  #BASE_URL;

  constructor() {
    this.#API_KEY = '1aec7afb2309fd39902ffda599461df1';
    this.#BASE_URL = 'https://api.themoviedb.org/3';
    this.searchQuery = '';
    this.page = 1;
    this.max = undefined;
  }

  async fetchPopularMovies() {
    try {
      const resp = await axios.get(
        `${this.#BASE_URL}/movie/popular?api_key=${
          this.#API_KEY
        }&language=en-US&page=${this.page}`
      );
      if (!resp.data.total_pages)
        throw new Error('💔 Sorry but we can`t load films');
      this.max = resp.data.total_pages;
      if (this.max > 500) this.max = 500;
      return resp.data.results;
    } catch (err) {
      Notiflix.Notify.failure(err.message);
      console.log(err.message);
    }
  }

  async fetchKeyword() {
    if (!this.searchQuery) return;
    try {
      const resp = await axios.get(
        `${this.#BASE_URL}/search/movie?api_key=${this.#API_KEY}&query=${
          this.searchQuery
        }&page=${this.page}`
      );
      if (!resp.data.page) throw new Error('💔 Sorry but we can`t load films');
      this.max = resp.data.total_pages;
      if (this.max > 500) this.max = 500;
      return resp.data.results;
    } catch (err) {
      Notiflix.Notify.failure(err.message);
      console.log(err.message);
    }
  }

  async fetchById(id) {
    try {
      const resp = await axios.get(
        `${this.#BASE_URL}/movie/${id}?api_key=${
          this.#API_KEY
        }&append_to_response=videos`
      );
      if (!resp.data)
        throw new Error(
          '💔 Sorry but we can`t load this film, please try again later'
        );
      return resp.data;
    } catch (err) {
      Notiflix.Notify.failure(err.message);
      console.log(err.message);
    }
  }

  incrementPage() {
    if (this.page === this.max) {
      return;
    }
    this.page += 1;
  }

  decrementPage() {
    if (this.page === 1) {
      return;
    }
    this.page -= 1;
  }

  setSearchQuery(value) {
    this.searchQuery = value;
  }

  setPage(value) {
    this.page = value;
  }

  setMax(value) {
    this.max = value;
  }

  resetPage() {
    this.page = 1;
  }

  getPage() {
    return this.page;
  }

  getMax() {
    return this.max;
  }

  getSearchQuery() {
    return this.searchQuery;
  }
}

export const API = new FILMAPI();
