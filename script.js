const weatherApi = {
    key: "9d7cde1f6d07ec55650544be1631307e",
    baseUrl: "https://api.openweathermap.org/data/2.5/weather",
    forecastUrl: "https://api.openweathermap.org/data/2.5/forecast"
};

const weatherTranslations = {
    "clear sky": "ясное небо",
    "few clouds": "небольшая облачность",
    "scattered clouds": "рассеянные облака",
    "broken clouds": "облачно с прояснениями",
    "shower rain": "ливневый дождь",
    "rain": "дождь",
    "thunderstorm": "гроза",
    "snow": "снег",
    "mist": "туман",
    "overcast clouds": "пасмурно",
    "light rain": "легкий дождь",
    "moderate rain": "умеренный дождь",
    "heavy intensity rain": "сильный дождь",
    "light snow": "легкий снег",
    "moderate snow": "умеренный снег",
    "heavy snow": "сильный снег",
    "light shower snow": "легкий снегопад",
    "shower snow": "снегопад",
    "light intensity drizzle": "легкий моросящий дождь",
    "drizzle": "моросящий дождь",
    "heavy intensity drizzle": "сильный моросящий дождь",
    "light intensity shower rain": "легкий ливень",
    "heavy intensity shower rain": "сильный ливень",
    "ragged shower rain": "прерывистый ливень",
    "light intensity shower snow": "легкий снегопад",
    "heavy intensity shower snow": "сильный снегопад",
    "ragged shower snow": "прерывистый снегопад",
    "thunderstorm with light rain": "гроза с легким дождем",
    "thunderstorm with rain": "гроза с дождем",
    "thunderstorm with heavy rain": "гроза с сильным дождем",
    "light thunderstorm": "легкая гроза",
    "heavy thunderstorm": "сильная гроза",
    "ragged thunderstorm": "прерывистая гроза",
    "thunderstorm with light drizzle": "гроза с легким моросящим дождем",
    "thunderstorm with drizzle": "гроза с моросящим дождем",
    "thunderstorm with heavy drizzle": "гроза с сильным моросящим дождем"
};

const searchInput = document.getElementById('input-box');
const searchButton = document.getElementById('search-button');
const weatherIcon = document.getElementById('weather-icon');
const cityElement = document.getElementById('city');
const dateElement = document.getElementById('date');
const tempElement = document.getElementById('temp');
const weatherElement = document.getElementById('weather');
const minMaxElement = document.getElementById('min-max');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const pressureElement = document.getElementById('pressure');
const weatherBody = document.querySelector('.weather-body');
const errorMessage = document.querySelector('.error-message');
const toggleForecastButton = document.getElementById('toggle-forecast-button');
const weekForecast = document.getElementById('week-forecast');
const forecastList = document.getElementById('forecast-list');
let currentCity = 'Москва';
document.addEventListener('DOMContentLoaded', () => {
    getWeatherReport(currentCity);
});
searchButton.addEventListener('click', () => {
    if (searchInput.value.trim()) {
        currentCity = searchInput.value;
        getWeatherReport(currentCity);
    }
});
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && searchInput.value.trim()) {
        currentCity = searchInput.value;
        getWeatherReport(currentCity);
    }
});
toggleForecastButton.addEventListener('click', () => {
    weekForecast.style.display = weekForecast.style.display === 'none' ? 'block' : 'none';
    toggleForecastButton.classList.toggle('active');

    if (weekForecast.style.display === 'block') {
        getWeeklyForecast(currentCity); 
    }
});
async function getWeatherReport(city) {
    try {
        showLoading();
        const response = await fetch(
            `${weatherApi.baseUrl}?q=${city}&units=metric&lang=ru&appid=${weatherApi.key}`
        );
        const weatherData = await response.json();
        if (weatherData.cod === '404') {
            showError();
        } else {
            showWeatherReport(weatherData);
            hideError();
        }
    } catch (error) {
        console.error('Ошибка при получении данных о погоде:', error);
        showError();
    } finally {
        hideLoading();
    }
}
async function getWeeklyForecast(city) {
    try {
        showLoading();
        const response = await fetch(
            `${weatherApi.forecastUrl}?q=${city}&units=metric&lang=ru&appid=${weatherApi.key}`
        );
        const forecastData = await response.json();
        displayWeeklyForecast(forecastData);
        hideError();
    } catch (error) {
        console.error('Ошибка при получении прогноза на неделю:', error);
        showError();
    } finally {
        hideLoading();
    }
}
function showWeatherReport(weather) {
    cityElement.textContent = `${weather.name}, ${weather.sys.country}`;
    dateElement.textContent = getFormattedDate();
    tempElement.innerHTML = `${Math.round(weather.main.temp)}&deg;C`;
    const weatherDescription = weather.weather[0].description.toLowerCase();
    const translatedDescription = weatherTranslations[weatherDescription] || weatherDescription;
    weatherElement.textContent = capitalizeFirstLetter(translatedDescription);
    weatherIcon.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
    minMaxElement.innerHTML = `${Math.round(weather.main.temp_min)}&deg;C (мин) / ${Math.round(weather.main.temp_max)}&deg;C (макс)`;
    humidityElement.textContent = `${weather.main.humidity}%`;
    windSpeedElement.textContent = `${weather.wind.speed} м/с`;
    pressureElement.textContent = `${weather.main.pressure} гПа`;
    showWeatherBody();
}
function displayWeeklyForecast(forecastData) {
    forecastList.innerHTML = ''; 
    const dailyForecasts = forecastData.list.filter((item, index) => index % 8 === 0);
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'short'
        });
        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;
        const weatherDescription = forecast.weather[0].description.toLowerCase();
        const translatedDescription = weatherTranslations[weatherDescription] || weatherDescription;
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <span class="forecast-date">${date}</span>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Иконка погоды" class="forecast-icon">
            <span class="forecast-temp">${temp}&deg;C</span>
            <span class="forecast-weather">${capitalizeFirstLetter(translatedDescription)}</span>
        `;
        forecastList.appendChild(forecastItem);
    });
}
function getFormattedDate() {
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    const days = [
        'Воскресенье', 'Понедельник', 'Вторник', 'Среда',
        'Четверг', 'Пятница', 'Суббота'
    ];
    const now = new Date();
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    return `${date} ${month} (${day}), ${year}`;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function showLoading() {
    document.querySelector('.loading-screen').innerHTML = `
        <div class="spinner"></div>
        <p>Загрузка информации о погоде...</p>
    `;
    document.querySelector('.loading-screen').style.display = 'flex';
}

function hideLoading() {
    document.querySelector('.loading-screen').style.display = 'none';
}

function showError() {
    errorMessage.innerHTML = '<p>Город не найден. Пожалуйста, попробуйте ещё раз.</p>';
    errorMessage.style.display = 'block';
    weatherBody.style.display = 'none';
    weekForecast.style.display = 'none';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showWeatherBody() {
    weatherBody.style.display = 'block';
}
//опа гамгнат стайл

