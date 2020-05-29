const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const SERVER = 'https://api.themoviedb.org/3';
const API_KEY = '7156a2a8f8d4feec35f40b2dd33b2b3f';

const leftMenu = document.querySelector('.left-menu'),
      hamburger = document.querySelector('.hamburger'),
      tvShowsList = document.querySelector('.tv-shows__list'),
      modal = document.querySelector('.modal'),
      posterWrapper = document.querySelector('.poster__wrapper'),
      tvShows = document.querySelector('.tv-shows'),
      tvCardImg = document.querySelector('.tv-card__img'),
      modalTitle = document.querySelector('.modal__title'),
      genresList = document.querySelector('.genres-list'),
      rating = document.querySelector('.rating'),
      description = document.querySelector('.description'),
      modalLink = document.querySelector('.modal__link'),
      searchForm = document.querySelector('.search__form'),
      searchFormInput = document.querySelector('.search__form-input'),
      preloader = document.querySelector('.preloader'),
      dropdown = document.querySelector('.dropdown'),
      tvShowsHead = document.querySelector('.tv-shows__head'),
      modalContent = document.querySelector('.modal__content'),
      pagination = document.querySelector('.pagination');

const loading = document.createElement('div');
loading.classList.add('loading');

const DBService = class {
    getData = async (url) => {
        const response = await fetch(url);
        this.lastQuery = url;
        if (response.ok){
            return response.json();            
        } else {
            throw new Error(`Не удалось получить данный по адресу ${url}`);
        }
    }

    getTestData = () => this.getData('test.json');
    getTestCard = () => this.getData('card.json');

    getSearchResult = query => this.getData(`${SERVER}/search/tv?api_key=${API_KEY}&language=ru-RU&query=${query}`);
    getResultPage = page => this.getData(`${this.lastQuery}&page=${page}`);    
    getTvShow = id => this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
    getTopRated = () => this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`)
    getPopular = () => this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`)
    getToday = () => this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`)
    getWeak = () => this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`)
}

const dbService = new DBService();
    
const renderCard = (response, target) => {
    tvShowsList.textContent = '';

    if (!response.total_results) {
        loading.remove();
        tvShowsHead.textContent = 'По вашему запросу сериалов не найдено';
        return;
    }

    tvShowsHead.textContent = target ? target.textContent : 'Результат поиска';

    response.results.forEach(item => {
        const {
            backdrop_path: backdrop,
            name: title,
            poster_path: poster,
            vote_average: vote,
            id
        } = item;

        const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
        const backdropIMG = backdrop ? IMG_URL + backdrop : '';
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';
        
        const card = document.createElement('li');
        card.classList.add('tv-shows__item');
        card.innerHTML = `
            <a href="#" id=${id} class="tv-card">
                ${voteElem}
                <img class="tv-card__img"
                    src="${posterIMG}"
                    data-backdrop="${backdropIMG}"
                    alt=${title}>
                <h4 class="tv-card__head">${title}</h4>
            </a>
        `;

        loading.remove();
        tvShowsList.append(card);
    });

    pagination.textContent = '';

    if (!target && response.total_pages > 1) {
        for (let i = 1; i <= response.total_pages; i++) {
            pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`;
        }
    }
};

dbService.getPopular().then(renderCard);

// search

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = searchFormInput.value.trim();
    searchFormInput.value = '';
    if (value) {
        tvShows.append(loading);
        dbService.getSearchResult(value).then(renderCard);
    }
});

// open/cloze menu

const closeDropdown = () => {
    leftMenu.querySelectorAll('.dropdown.active').forEach(item => {
        item.classList.remove('active');
    })
}

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropdown();
});

document.addEventListener('click', event => {
    event.preventDefault();
    if (!event.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        closeDropdown();
    }
});

leftMenu.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }

    if (target.closest('#top-rated')) {        
        tvShows.append(loading);
        dbService.getTopRated().then(response => renderCard(response, target));
    }

    if (target.closest('#popular')) {
        tvShows.append(loading);
        dbService.getPopular().then(response => renderCard(response, target));
    }

    if (target.closest('#today')) {
        tvShows.append(loading);
        dbService.getToday().then(response => renderCard(response, target));
    }

    if (target.closest('#week')) {
        tvShows.append(loading);
        dbService.getWeak().then(response => renderCard(response, target));
    }

    if (target.closest('#search')) {
        tvShowsList.textContent = '';
        tvShowsHead.textContent = '';
    }
});

// change image

const changeImage = event => {
    const img = event.target.closest('.tv-card__img');
    if (event.target.matches('.tv-card__img') && img.dataset.backdrop) {
        [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
    }
};

tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);

// modal window

tvShowsList.addEventListener('click', event => {   
    event.preventDefault(); 
    const card = event.target.closest('.tv-card'); 
    if (card) {  
        preloader.style.display = 'block';
        
        dbService.getTvShow(card.id)
            .then(data => {
                if (data.poster_path) {
                    tvCardImg.src = IMG_URL + data.poster_path;
                    tvCardImg.alt = data.name;
                    posterWrapper.style.display = '';
                    modalContent.style.paddingLeft = '';
                } else {
                    posterWrapper.style.display = 'none';
                    modalContent.style.paddingLeft = '40px';
                }

                modalTitle.textContent = data.name;
                genresList.innerHTML = data.genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, '');
                rating.textContent = data.vote_average;
                description.textContent = data.overview;
                modalLink.href = data.homepage;
            })
            .then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            })
            .finally(() => {
                preloader.style.display = '';
            });
    }
});

modal.addEventListener('click', event => {
    if (event.target.closest('.cross') ||
        event.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});

// pagination

pagination.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    if (target.classList.contains('pages')) {
        tvShows.append(loading);
        dbService.getResultPage(target.textContent).then(response => {
            renderCard(response);
            window.scrollTo(0, 0);
        });
    }
});