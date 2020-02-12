const search = document.querySelector('.search__submit');
const celsius = document.querySelector(".temperature__celsius");
const fahrenheit = document.querySelector(".temperature__fahrenheit");
const temps = document.querySelector("body > header > div.settings > div.temperature").children;
const block = document.querySelector('.weather');
const curTemp = document.querySelector('.cur_degree');
const lang = document.querySelector('.lang-switch');
const text = document.querySelector('.search__text');
const coordBlock = document.querySelector('.coords');
const locBlock = document.querySelector('.location');
const refresh = document.querySelector('.refresh');
const loading = document.querySelector('.loading');
const dateBlock = document.querySelector('.date');
const futureForecast = document.querySelector('.future-forecast');
const curIcon = document.querySelector('.cur-icon');
const date = new Date();
const enterCode = 13;

const current_location_key = '32dd44973f7949';
const location_key = '50409b6b8c43408ead81d59f9b847c18';
const image_key = 'e63fc987bd14fc87fe8f840d5476f471c56691b6c8f80531381fcb0bb1b58d75';

const season = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
const daysOfWeek_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const daysOfWeek_RU = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const daysOfWeek_BE = ['Нядзеля', 'Панядзелак', 'Аўторак', 'Серада', 'Чацвер', 'Пятніца', 'Субота'];
const month_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const month_RU = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
const month_BE = ['Студзеня', 'Лютага', 'Сакавіка', 'Красавіка', 'Мая', 'Чэрвеня', 'Ліпеня', 'Жніўня', 'Верасня', 'Кастрычніка', 'Лістапада', 'Снежня'];
const shortDay_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const shortDay_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const shortDay_BE = ['Нд', 'Пн', 'Аў', 'Ср', 'Чц', 'Пт', 'Сб'];
const coords_EN = ['Latitude', 'Longitude'];
const coords_RU = ['Широта', 'Долгота'];
const coords_BE = ['Шырата', 'Даўгата'];

const currentWeatherCels = [];
const currentWeatherFahr = [];
const mapCoords = [];
const daysForward = [];
const dailyFahr = [];
const dailyCels = [];
const dailyIcons = [];
let curLang;
let city;
let getCity;
let translate;
let timeNow;
let curWeather;
let fav;
let myMap = null;

function initMap(cords) {
    ymaps.ready(() => {
        myMap = new ymaps.Map('map', {
            center: cords,
            zoom: 11
        })
    })
}

function getImage() {
    const seasonsNum = date.getMonth();
    const time = date.getHours();
    const partOfYear = season[seasonsNum];
    let partOfDay;
    if (time >= 6 && time < 12) {
        partOfDay = 'morning';
    }
    if (time >= 12 && time < 18) {
        partOfDay = 'afternoon';
    }
    if (time >= 18) {
        partOfDay = 'evening';
    }
    if (time >= 0 && time < 6) {
        partOfDay = 'night';
    }
    const searchImage = `${partOfYear}%20${partOfDay}%20${curWeather}`;
    const imageLink = `https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query=${searchImage}&client_id=${image_key}`;
    fetch(imageLink)
        .then(convertion => convertion.json())
        .then(image => {
            const result = image.urls.regular;
            document.body.style.backgroundImage = `url(${result})`;
        })
}

const usersLocationWeather = function() {
    const current_location_url = `https://ipinfo.io/json?token=${current_location_key}`;
    fetch(current_location_url)
        .then(locInfo => locInfo.json())
        .then(location => {
            city = location.city;
            const location_url = `https://api.opencagedata.com/geocode/v1/json?key=${location_key}&q=${city}&pretty=1&no_annotations=1&language=${curLang}`;
            fetch(location_url)
                .then(locat => locat.json())
                .then(location => {
                    getCity = location.results[0].formatted.split(',');
                    translate = `${getCity[0]}, ${getCity[getCity.length - 1]}`;
                    return location;
                })
                .then(loc => {
                    const weather_url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/29e270d552fb7ddfac1a8c371ae8dc03/${loc.results[0].geometry.lat},${loc.results[0].geometry.lng}?lang=${curLang}`;
                    fetch(weather_url, {headers: {}})
                        .then(weather => weather.json())
                        .then(data => {
                            for (let i = 1; i < 4; i += 1) {
                                const day = new Date(data.daily.data[i].time * 1000).getDay();
                                const temperFahr = Math.round((data.daily.data[i].temperatureHigh + data.daily.data[i].temperatureLow) / 2);
                                const temperCels = Math.round((((data.daily.data[i].temperatureHigh + data.daily.data[i].temperatureLow) / 2) - 32) * (5 / 9));
                                const icons = data.daily.data[i].icon;
                                dailyFahr.push(temperFahr);
                                dailyCels.push(temperCels);
                                daysForward.push(day);
                                dailyIcons.push(icons);
                            }
                            const options = { timeZone: data.timezone }
                            const localTime = new Date(new Date().toLocaleString('en-US', options));
                            const timeArr = `${localTime}`.split(' ');
                            const locTime = [];
                            const timeConv = timeArr[4].split(':').slice(0, 2).join(':');
                            const weekDay = shortDay_EN.indexOf(timeArr[0]);
                            const month = localTime.getMonth();
                            locTime.push(timeArr[2], timeConv, weekDay, month);
                            getCurrentTime(locTime);
                            getDailyWeather();
                            fav = data.currently.icon;
                            getFavicon(fav, document.querySelector('.favicon'));
                            mapCoords.push(data.latitude, data.longitude);
                            curWeather = data.currently.summary;
                            currentWeatherCels.push(data.currently.summary, Math.round((data.currently.apparentTemperature - 32) * (5 / 9)), Math.round(data.currently.windSpeed * 1.609 / 3.6), Math.round(data.currently.humidity * 100), Math.round((data.currently.temperature - 32) * (5 / 9)));
                            currentWeatherFahr.push(data.currently.summary, Math.round(data.currently.apparentTemperature), Math.round(data.currently.windSpeed * 1.609 / 3.6), Math.round(data.currently.humidity * 100), Math.round(data.currently.temperature));
                            setIcon(data.currently.icon, curIcon);
                            init();
                            getImage();
                            return data;
                        })
                        .then(info => {
                            let cords = [info.latitude,info.longitude];
                            ymaps.ready(initMap(cords));
                        })
                })
        })
        .finally(() => {
            setTimeout(loaded, 2000);
            setInterval(setFavicon, 100);
        });
}

const loadForecast = function(lang) {
    currentWeatherCels.length = 0;
    currentWeatherFahr.length = 0;
    mapCoords.length = 0;
    dailyFahr.length = 0;
    daysForward.length = 0;
    dailyCels.length = 0;
    dailyIcons.length = 0;
    const location_url = `https://api.opencagedata.com/geocode/v1/json?key=${location_key}&q=${city}&pretty=1&no_annotations=1&language=${lang}`;
    fetch(location_url)
        .then(data => data.json())
        .then(location => {
        getCity = location.results[0].formatted.split(',');
        translate = `${getCity[0]}, ${getCity[getCity.length - 1]}`;
        const weather_url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/29e270d552fb7ddfac1a8c371ae8dc03/${location.results[0].geometry.lat},${location.results[0].geometry.lng}?lang=${lang}`;
        fetch(weather_url, { method: 'GET', mode: 'cors' })
            .then(forecast => forecast.json())
            .then(data => {
                const options = { timeZone: data.timezone }
                const localTime = new Date(new Date().toLocaleString('en-US', options));
                const timeArr = `${localTime}`.split(' ');
                const weekDay = shortDay_EN.indexOf(timeArr[0]);
                const month = localTime.getMonth();
                const locTime = [];
                const timeConv = timeArr[4].split(':').slice(0, 2).join(':');
                let day = localTime.getDay();
                locTime.push(timeArr[2], timeConv, weekDay, month);
                getCurrentTime(locTime);
                if (weekDay !== date.getDay()) {
                    for (let i = 2; i < 5; i += 1) {
                        day++;
                        if (day > 6) {
                            day = 0;
                        }
                        const temperFahr = Math.round((data.daily.data[i].temperatureHigh + data.daily.data[i].temperatureLow) / 2);
                        const temperCels = Math.round((((data.daily.data[i].temperatureHigh + data.daily.data[i].temperatureLow) / 2) - 32) * (5 / 9));
                        const icons = data.daily.data[i].icon;
                        dailyFahr.push(temperFahr);
                        dailyCels.push(temperCels);
                        daysForward.push(day);
                        dailyIcons.push(icons);
                    }
                } else {
                    for (let i = 1; i < 4; i += 1) {
                        day++;
                        if (day > 6) {
                            day = 0;
                        }
                        const temperFahr = Math.round((data.daily.data[i].temperatureHigh + data.daily.data[i].temperatureLow) / 2);
                        const temperCels = Math.round((((data.daily.data[i].temperatureHigh + data.daily.data[i].temperatureLow) / 2) - 32) * (5 / 9));
                        const icons = data.daily.data[i].icon;
                        dailyFahr.push(temperFahr);
                        dailyCels.push(temperCels);
                        daysForward.push(day);
                        dailyIcons.push(icons);
                    }
                }
                getDailyWeather();
                fav = data.currently.icon;
                getFavicon(fav, document.querySelector('.favicon'));
                mapCoords.push(data.latitude, data.longitude);
                currentWeatherCels.push(data.currently.summary, Math.round((data.currently.apparentTemperature - 32) * (5 / 9)), Math.round(data.currently.windSpeed * 1.609 / 3.6), Math.round(data.currently.humidity * 100), Math.round((data.currently.temperature - 32) * (5 / 9)));
                currentWeatherFahr.push(data.currently.summary, Math.round(data.currently.apparentTemperature), Math.round(data.currently.windSpeed * 1.609 / 3.6), Math.round(data.currently.humidity * 100), Math.round(data.currently.temperature));
                setIcon(data.currently.icon, curIcon);
                init();
                return data;
            })
            .then(info => {
                myMap.setCenter([info.latitude, info.longitude]);
                setInterval(setFavicon, 100);
            })
    })
}

function loaded() {
    loading.style.display = 'none'
}

function setIcon(icon, iconID) {
    const skycons = new Skycons({ color: '#fff' });
    const currentIcon = icon.replace(/-/g, '_').toUpperCase();
    skycons.play();
    return skycons.set(iconID, Skycons[currentIcon]);
}

function getFavicon(icon, iconID) {
    const skycons = new Skycons({ color: '#000' });
    const currentIcon = icon.replace(/-/g, '_').toUpperCase();
    skycons.play();
    return skycons.set(iconID, Skycons[currentIcon]);
}

function setFavicon() {
    document.querySelector("link[rel*='icon']").href = document.querySelector('.favicon').toDataURL();
}

function getCurrentTime(locTime) {
    const getTime = locTime[1].split(':');
    let hours = getTime[0];
    let minutes = getTime[1];
    let currentDate = +locTime[0];
    let currentDay;
    let currentMonth;
    dateBlock.textContent = '';
    if (curLang === 'en') {
        currentDay = shortDay_EN[locTime[2]];
        currentMonth = month_EN[locTime[3]];
    }
    if (curLang === 'ru') {
        currentDay = shortDay_RU[locTime[2]];
        currentMonth = month_RU[locTime[3]];
    }
    if (curLang === 'be') {
        currentDay = shortDay_BE[locTime[2]];
        currentMonth = month_BE[locTime[3]];
    }
    timeNow = `${hours}:${minutes}`;
    dateBlock.textContent = `${currentDay} ${currentDate} ${currentMonth} ${timeNow}`;
}

function init() {
    const latitGrad = `${mapCoords[0]}`.split('.');
    const longGrad = `${mapCoords[1]}`.split('.');
    const latit = `${latitGrad[0]}° ${latitGrad[1].slice(0, 2)}'`;
    const longit = `${longGrad[0]}° ${longGrad[1].slice(0, 2)}'`;
    let currentWeather = [];
    coordBlock.textContent = '';
    block.textContent = '';
    locBlock.textContent = translate;
    if (celsius.classList.contains('active-temp')) {
        currentWeather = currentWeatherCels;
    }
    if (fahrenheit.classList.contains('active-temp')) {
        currentWeather = currentWeatherFahr;
    }
    curTemp.innerText = `${currentWeather[currentWeather.length - 1]}°`;
    if (curLang === 'en') {
        search.textContent = 'Search';
        text.placeholder = 'Search city or ZIP'
        block.insertAdjacentHTML('afterbegin', `
        <p class = "weather__item">${currentWeather[0]}</p>
        <p class = "weather__item">Feels like: ${currentWeather[1]}°</p>
        <p class = "weather__item">Wind: ${currentWeather[2]} m/s</p>
        <p class = "weather__item">Humidity: ${currentWeather[3]}%</p>`);
        coordBlock.insertAdjacentHTML('afterbegin', `
        <div class = "lan">${coords_EN[0]}: ${latit}</div>
        <div class = "long">${coords_EN[1]}: ${longit}</div>
        `)
    }
    if (curLang === 'be') {
        text.placeholder = 'Пошук горада ці індэкса';
        search.textContent = 'Шукаць';
        block.insertAdjacentHTML('afterbegin', `
        <p class = "weather__item">${currentWeather[0]}</p>
        <p class = "weather__item">Адчуваецца як: ${currentWeather[1]}°</p>
        <p class = "weather__item">Вецер: ${currentWeather[2]} м/с</p>
        <p class = "weather__item">Вільготнасць: ${currentWeather[3]}%</p>`);
        coordBlock.insertAdjacentHTML('afterbegin', `
        <div class = "lan">${coords_BE[0]}: ${latit}</div>
        <div class = "long">${coords_BE[1]}: ${longit}</div>
        `)
    }
    if (curLang === 'ru') {
        search.textContent = 'Искать';
        text.placeholder = 'Поиск города или индекса';
        block.insertAdjacentHTML('afterbegin', `
        <p class = "weather__item">${currentWeather[0]}</p>
        <p class = "weather__item">Ощущается как: ${currentWeather[1]}°</p>
        <p class = "weather__item">Ветер: ${currentWeather[2]} м/с</p>
        <p class = "weather__item">Влажность: ${currentWeather[3]}%</p>`);
        coordBlock.insertAdjacentHTML('afterbegin', `
        <div class = "lan">${coords_RU[0]}: ${latit}</div>
        <div class = "long">${coords_RU[1]}: ${longit}</div>
        `)
    }
}

function changeTemp(e) {
    for (let i = 0; i < temps.length; i+= 1) {
        temps[i].classList.remove('active-temp');
    }
    e.target.classList.add('active-temp');
    init();
    getDailyWeather();
}

function pressed(e) {
    if(e.keyCode === enterCode) {
        city = text.value;
        e.preventDefault();
        loadForecast();
        getImage();
    }
}

function getDailyWeather() {
    futureForecast.textContent = '';
    let daysOfWeek = [];
    let dailyWeather = [];
    if (celsius.classList.contains('active-temp')) {
        dailyWeather = dailyCels;
    }
    if (fahrenheit.classList.contains('active-temp')) {
        dailyWeather = dailyFahr;
    }
    if (curLang === 'be') {
        daysOfWeek = daysOfWeek_BE;
    }
    if (curLang === 'ru') {
        daysOfWeek = daysOfWeek_RU;
    }
    if (curLang === 'en') {
        daysOfWeek = daysOfWeek_EN;
    }
    for (let i = 0; i < 3; i += 1) {
        futureForecast.insertAdjacentHTML('beforeend', `
        <div class = "fut-weather">
        <div class = "next-day">${daysOfWeek[daysForward[i]]}</div>
        <div class = "next-temp">${dailyWeather[i]}°
            <div class = "weather-icon">
                <canvas class = "daily-icon"></canvas>
            </div>
        </div>
        </div>
        `)
        setIcon(dailyIcons[i], document.querySelectorAll('.daily-icon')[i]);
    }
}

search.addEventListener('click', loadForecast);
search.onmousemove = () => {
    city = text.value;
}
lang.addEventListener('change', (e) => {
    curLang = e.target.value.toLowerCase();
    loadForecast(curLang);
});
window.onload = () => {
    curLang = 'en';
    lang.value = curLang.toUpperCase();
    if (localStorage.getItem('usersLang')) {
        curLang = localStorage.getItem('usersLang');
        lang.value = curLang.toUpperCase();
    }
    celsius.classList.add('active-temp');
    usersLocationWeather();
}
celsius.addEventListener('click', changeTemp);
fahrenheit.addEventListener('click', changeTemp);
text.addEventListener('keydown', pressed);
refresh.addEventListener('click', getImage);
search.addEventListener('click', getImage);
window.onbeforeunload = () => {
    localStorage.setItem('usersLang', curLang);
}
