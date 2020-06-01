import { SERVER } from "../constants.js";
import { API_KEY } from "../constants.js";
import { LANGUAGE } from "../constants.js";

export class DBService {
    getData = async (url, id) => {
        const response = await fetch(url);
        if (!id) this.lastQuery = url;
        if (response.ok){
            return response.json();            
        } else {
            throw new Error(`Не удалось получить данный по адресу ${url}`);
        }
    }

    getTestData = () => this.getData('test.json');
    getTestCard = () => this.getData('card.json');

    getSearchResult = query => this.getData(`${SERVER}/search/tv?api_key=${API_KEY}&language=${LANGUAGE}&query=${query}`);
    getResultPage = page => this.getData(`${this.lastQuery}&page=${page}`);    
    getTvShow = id => this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=${LANGUAGE}`, id);
    getCategory = category => this.getData(`${SERVER}/tv/${category}?api_key=${API_KEY}&language=${LANGUAGE}`);
}