import { DBService } from "./classes/DBService.js";
import { Card } from "./classes/Card.js";
import { DEFAULT_CATEGORY } from './constants.js';
import { IMG_URL } from './constants.js';

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
      tvShowsHead = document.querySelector('.tv-shows__head'),
      modalContent = document.querySelector('.modal__content'),
      pagination = document.querySelector('.pagination');

const dbService = new DBService();

const openMenu = () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropdown();
};

const closeMenu = event => {
    if (!event.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        closeDropdown();
    }
};

const search = event => {
    event.preventDefault();
    const value = searchFormInput.value.trim();
    searchFormInput.value = '';
    if (value) {
        tvShows.append(loading);
        dbService.getSearchResult(value).then(renderCard);
    }
};

const closeDropdown = () => {
    leftMenu.querySelectorAll('.dropdown.active').forEach(item => {
        item.classList.remove('active');
    })
};

const changeImage = event => {
    const img = event.target.closest('.tv-card__img');
    if (event.target.matches('.tv-card__img') && img.dataset.backdrop) {
        [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
    }
};

const changePage = event => {
    event.preventDefault();
    const target = event.target;
    if (target.classList.contains('pages')) {
        tvShows.append(loading);
        dbService.getResultPage(target.textContent).then(response => {
            renderCard(response);
            window.scrollTo(0, 0);
        });
    }
};

const openDropdown = dropdown => {
    dropdown.classList.toggle('active');
    leftMenu.classList.add('openMenu');
    hamburger.classList.add('open');
};

const downloadTvCategory = (category, target) => {
    dbService.getCategory(category).then(response => renderCard(response, target));
};

const leftMenuHandler = event => {
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown');
    const menuLink = target.closest('.menu__link');
    const search = target.closest('#search');

    if (dropdown) {
        openDropdown(dropdown);
    }

    if (menuLink) {
        window.scrollTo(0, 0);
        downloadTvCategory(menuLink.dataset.category, target);
    }

    if (search) {
        tvShowsList.textContent = '';
        tvShowsHead.textContent = '';
    }
};

const renderModal = data => {
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
    if(data.homepage) {
        modalLink.href = data.homepage;
        modalLink.style.display = '';
    } else {
        modalLink.style.display = 'none';
    }
};

const showModal = event => {   
    event.preventDefault(); 
    const card = event.target.closest('.tv-card'); 
    if (card) {  
        preloader.style.display = 'block';
        
        dbService.getTvShow(card.id)
            .then(data => renderModal(data))
            .then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            })
            .catch(err => {
                alert("По данному сериалу нет никакой информации");
            })
            .finally(() => {
                preloader.style.display = '';
            });
    }
};

const closeModal = event => {
    if (event.target.closest('.cross') ||
        event.target.classList.contains('modal')) {
            event.preventDefault();
            document.body.style.overflow = '';
            modal.classList.add('hide');
    }
};

const renderCard = (response, target) => {
    tvShowsList.textContent = '';

    if (!response.total_results) {
        loading.remove();
        tvShowsHead.textContent = 'По вашему запросу сериалов не найдено';
        return;
    }

    tvShowsHead.textContent = target ? target.textContent : 'Результат поиска';

    response.results.forEach(item => {
        const card = Card.buildCard(item);

        loading.remove();
        tvShowsList.append(card);
    });

    //pagination    
    pagination.textContent = '';
    let totalPages = response.total_pages <= 10 ? response.total_pages : 10; // page limit
    if (!target && totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`;
        }
    }
};

const loading = document.createElement('div');

const registerListeners = () => {
    hamburger.addEventListener('click', openMenu);
    document.addEventListener('click', closeMenu);
    searchForm.addEventListener('submit', search);
    leftMenu.addEventListener('click', leftMenuHandler);
    pagination.addEventListener('click', changePage);
    tvShowsList.addEventListener('mouseover', changeImage);
    tvShowsList.addEventListener('mouseout', changeImage);
    tvShowsList.addEventListener('click', showModal);
    modal.addEventListener('click', closeModal);
};

const main = () => {
    registerListeners();
    loading.classList.add('loading');
    downloadTvCategory(DEFAULT_CATEGORY.category, DEFAULT_CATEGORY.title);
};

main();