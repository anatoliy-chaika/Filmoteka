import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// import { initializeApp } from 'firebase/app';
// import {
//   getAuth,
//   signInWithPopup,
//   GoogleAuthProvider,
//   signOut,
// } from 'firebase/auth';

import { firebaseConfig } from './helpers';
import { storage } from './localStorage';
import Notiflix from 'notiflix';

firebase.initializeApp(firebaseConfig);
const account = JSON.parse(localStorage.getItem('account'));

if (account) {
  document.getElementById('signin').classList.add('close');
  document.getElementById('signout').classList.remove('close');
  document.getElementById('googleUser').style.display = 'block';
  renderGoogleUser(account.photo);
  document
    .querySelector('.firebases')
    .insertAdjacentHTML(
      'beforebegin',
      '<li><a class="nav__link nav__link--library" href="my-library.html">MY LIBRARY</a></li>'
    );
} else {
  const login = document.getElementById('signin');
  login.addEventListener('click', signinUser);
}

const logout = document.getElementById('signout');
logout.addEventListener('click', signoutUser);

function signinUser() {
  const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .signInWithPopup(googleAuthProvider)
    .then(function (data) {
      document.getElementById('signin').classList.add('close');
      document.getElementById('signout').classList.remove('close');
      document.getElementById('googleUser').style.display = 'block';
      renderGoogleUser(data.user.photoURL);
      document
        .querySelector('.firebases')
        .insertAdjacentHTML(
          'beforebegin',
          '<li><a class="nav__link nav__link--library" href="my-library.html">MY LIBRARY</a></li>'
        );

      localStorage.setItem(
        'account',
        JSON.stringify({
          email: data.user.email,
          photo: data.user.photoURL,
          id: data.user.uid,
        })
      );

      storage.resetConstructor();

      firebase.auth().signOut();
    })
    .catch(function (error) {
      console.log(error);
    });
}

function signoutUser() {
  const account = JSON.parse(localStorage.getItem('account'));
  if (!account) {
    Notiflix.Notify.warning('➡ You have to sign in first');
    console.log('➡ You have to sign in first');
  } else {
    localStorage.removeItem('account');
    document.getElementById('signin').classList.remove('close');
    document.getElementById('signout').classList.add('close');
    document.getElementById('googleUser').style.display = 'none';
    document.querySelector('.nav__link--library').parentNode.remove();
    storage.resetConstructor();
  }

  const login = document.getElementById('signin');
  login.addEventListener('click', signinUser);
}

function renderGoogleUser(photo) {
  document.getElementById('googleUser').innerHTML = `
          <img class="user-img" src="${photo}">
        `;
}
