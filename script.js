const weatherApi = {
    key: "9d7cde1f6d07ec55650544be1631307e",
    baseUrl: "https://api.openweathermap.org/data/2.5/weather"
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

// Город по умолчанию
let currentCity = 'Москва';

// Загрузка погоды при старте
document.addEventListener('DOMContentLoaded', () => {
    getWeatherReport(currentCity);
});

// Обработчик поиска
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

// Обработчик кнопки "Прогноз на неделю"
toggleForecastButton.addEventListener('click', () => {
    weekForecast.style.display = weekForecast.style.display === 'none' ? 'block' : 'none';
    toggleForecastButton.classList.toggle('active');

    if (weekForecast.style.display === 'block') {
        getWeeklyForecast(currentCity); // Загружаем прогноз для текущего города
    }
});

// Получение текущей погоды
async function getWeatherReport(city) {
    try {
        showLoading();
        const response = await fetch(
            `${weatherApi.baseUrl}?q=${city}&units=metric&appid=${weatherApi.key}`
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

// Получение прогноза на неделю
async function getWeeklyForecast(city) {
    try {
        showLoading();
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${weatherApi.key}`
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

// Отображение текущей погоды
function showWeatherReport(weather) {
    cityElement.textContent = `${weather.name}, ${weather.sys.country}`;
    dateElement.textContent = getFormattedDate();
    tempElement.innerHTML = `${Math.round(weather.main.temp)}&deg;C`;
    weatherElement.textContent = capitalizeFirstLetter(weather.weather[0].description);
    weatherIcon.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
    minMaxElement.innerHTML = `${Math.round(weather.main.temp_min)}&deg;C (мин) / ${Math.round(weather.main.temp_max)}&deg;C (макс)`;
    humidityElement.textContent = `${weather.main.humidity}%`;
    windSpeedElement.textContent = `${weather.wind.speed} м/с`;
    pressureElement.textContent = `${weather.main.pressure} гПа`;
    showWeatherBody();
}

// Отображение прогноза на неделю
function displayWeeklyForecast(forecastData) {
    forecastList.innerHTML = ''; // Очищаем список

    // Фильтруем данные, чтобы оставить только один прогноз на день
    const dailyForecasts = forecastData.list.filter((item, index) => index % 8 === 0);

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'short'
        });
        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <span class="forecast-date">${date}</span>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Иконка погоды" class="forecast-icon">
            <span class="forecast-temp">${temp}&deg;C</span>
        `;
        forecastList.appendChild(forecastItem);
    });
}

// Форматирование даты
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

// Капитализация первой буквы
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Показать экран загрузки
function showLoading() {
    document.querySelector('.loading-screen').style.display = 'flex';
}

// Скрыть экран загрузки
function hideLoading() {
    document.querySelector('.loading-screen').style.display = 'none';
}

// Показать ошибку
function showError() {
    errorMessage.style.display = 'block';
    weatherBody.style.display = 'none';
    weekForecast.style.display = 'none';
}

// Скрыть ошибку
function hideError() {
    errorMessage.style.display = 'none';
}

// Показать основное содержимое
function showWeatherBody() {
    weatherBody.style.display = 'block';
}

//опа гамгнат стайл

