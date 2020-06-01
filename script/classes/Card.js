import {DEFAULT_IMG, IMG_URL} from "../constants.js";

export class Card {
    static buildCard(item) {
        const {
            backdrop_path: backdrop,
            name: title,
            poster_path: poster,
            vote_average: vote,
            id
        } = item;

        const posterIMG = poster ? IMG_URL + poster : DEFAULT_IMG;
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

        return card;
    }
}