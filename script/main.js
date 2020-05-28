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
      searchFormInput = document.querySelector('.search__form-input');

const loading = document.createElement('div');
loading.classList.add('loading');

const DBService = class {
    getData = async (url) => {
        const res = await fetch(url);
        if (res.ok){
            return res.json();            
        } else {
            throw new Error(`Не удалось получить данный по адресу ${url}`);
        }       
    }

    getTestData = () => this.getData('test.json');
    getTestCard = () => this.getData('card.json');
    getSearchResult = query => this.getData(`${SERVER}/search/tv?api_key=${API_KEY}&language=ru-RU&query=${query}`);
    getTvShow = id => this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
}
    
const renderCard = res => {
    tvShowsList.textContent = '';

    if (res.total_results == 0) {
        loading.remove();
        tvShowsList.innerHTML += (`<h4>По вашему запросу сериалов не найдено</h4>`);
        return;
    }

    res.results.forEach(item => {
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
    })
};

// search

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = searchFormInput.value.trim();
    searchFormInput.value = '';
    if (value) {
        tvShows.append(loading);
        new DBService().getSearchResult(value).then(renderCard);
    }
});

// open/cloze menu

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
});

document.addEventListener('click', event => {
    event.preventDefault();
    if (!event.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
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
    const card = event.target.closest('.tv-card'); 
    if (card) {     
        new DBService().getTvShow(card.id)
            .then(data => {
                posterWrapper.innerHTML = data.poster_path ? 
                    `<div class="poster__wrapper">
                        <div class="poster">
                            <div class="image__content">                            
                                <img class="tv-card__img"
                                src="${IMG_URL + data.poster_path}"
                                alt="${data.name}">
                            </div>        
                        </div>
                    </div>
                    ` : '';
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
    }
});

modal.addEventListener('click', event => {
    if (event.target.closest('.cross') ||
        event.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});