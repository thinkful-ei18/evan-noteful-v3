/* global $ noteful api store */
'use strict';

$(document).ready(function () {
  noteful.bindEventListeners();

  api.search('/v3/notes')
    .then(response => {
      store.notes = response;
      noteful.render();
    });

  api.search('/v3/folders')
    .then(response => {
      store.folders = response;
      noteful.render();
    });

  // api.search('/v3/tags')
  //   .then(response => {
  //     store.tags = response;
  //     noteful.render();
  //   });

});

