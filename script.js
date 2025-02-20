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

searchButton.addEventListener('click', () => {
    if (searchInput.value.trim()) {
        getWeatherReport(searchInput.value);
    }
});

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && searchInput.value.trim()) {
        getWeatherReport(searchInput.value);
    }
});

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
        console.error('Error fetching weather:', error);
        showError();
    } finally {
        hideLoading();
    }
}

function showWeatherReport(weather) {
    cityElement.textContent = `${weather.name}, ${weather.sys.country}`;
    dateElement.textContent = getFormattedDate();
    tempElement.innerHTML = `${Math.round(weather.main.temp)}&deg;C`;
    weatherElement.textContent = capitalizeFirstLetter(weather.weather[0].description);
    weatherIcon.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
    minMaxElement.innerHTML = `${Math.round(weather.main.temp_min)}&deg;C (min) / ${Math.round(weather.main.temp_max)}&deg;C (max)`;
    humidityElement.textContent = `${weather.main.humidity}%`;
    windSpeedElement.textContent = `${weather.wind.speed} m/s`;
    pressureElement.textContent = `${weather.main.pressure} hPa`;
    showWeatherBody();
}

function getFormattedDate() {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const days = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'
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
    weatherBody.style.display = 'none';
    errorMessage.style.display = 'none';
}

function hideLoading() {

}

function showError() {
    errorMessage.style.display = 'block';
    weatherBody.style.display = 'none';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showWeatherBody() {
    weatherBody.style.display = 'block';
    weatherBody.classList.add('active');
}

// ХУЛИ ТЫ ТУТ СМОТРИШЬ
document.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            () => {
                getWeatherReport('London'); 
            }
        );
    } else {
        getWeatherReport('London');
    }
});

// Получение погоды по координатам
async function getWeatherByCoords(lat, lon) {
    try {
        showLoading();
        const response = await fetch(
            `${weatherApi.baseUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApi.key}`
        );
        const weatherData = await response.json();
        showWeatherReport(weatherData);
        hideError();
    } catch (error) {
        console.error('Error fetching weather by coordinates:', error);
        showError();
    } finally {
        hideLoading();
    }
}

weatherIcon.onerror = function() {
    this.src = 'https://openweathermap.org/img/wn/02d@2x.png'; 
};

searchButton.addEventListener('mousedown', () => {
    searchButton.style.transform = 'scale(0.95)';
});

searchButton.addEventListener('mouseup', () => {
    searchButton.style.transform = 'scale(1)';
});

// Предотвращение отправки формы
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});

// Очистка поля ввода после успешного поиска
function clearSearchInput() {
    searchInput.value = '';
}
//закрой нахуй этот код
