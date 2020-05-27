const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY = '7156a2a8f8d4feec35f40b2dd33b2b3f';

const leftMenu = document.querySelector('.left-menu'),
      hamburger = document.querySelector('.hamburger'),
      tvShowsList = document.querySelector('.tv-shows__list'),
      modal = document.querySelector('.modal');

const DBService = class {
    getData = async (url) => {
        const res = await fetch(url);
        if (res.ok){
            return res.json();            
        } else {
            throw new Error(`Не удалось получить данный по адресу ${url}`);
        }       
    }

    getTestData = () => {
        return this.getData('test.json');
    }
}
    
const renderCard = res => {
    tvShowsList.textContent = '';

    res.results.forEach(item => {
        const {
            backdrop_path: backdrop,
            name: title,
            poster_path: poster,
            vote_average: vote
        } = item;

        const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
        const backdropIMG = backdrop ? IMG_URL + backdrop : '';
        const voteElem = vote > 0 ? `<span class="tv-card__vote">${vote}</span>` : '';
        
        const card = document.createElement('li');
        card.classList.add('tv-shows__item');
        card.innerHTML = `
            <a href="#" class="tv-card">
                ${voteElem}
                <img class="tv-card__img"
                    src="${posterIMG}"
                    data-backdrop="${backdropIMG}"
                    alt=${title}>
                <h4 class="tv-card__head">${title}</h4>
            </a>
        `;

        tvShowsList.append(card);
    })
};
    
new DBService().getTestData().then(renderCard);    
    

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
    if (event.target.matches('.tv-card__img') &&
        img.dataset.backdrop) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
    }
};

tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);

// modal window

tvShowsList.addEventListener('click', event => {    
    if (event.target.closest('.tv-card')) {
        document.body.style.overflow = 'hidden';
        modal.classList.remove('hide');
    }
});

modal.addEventListener('click', event => {
    if (event.target.closest('.cross') ||
        event.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});

// 