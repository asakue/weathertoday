const CONFIG = {
    API: {
        key: "9d7cde1f6d07ec55650544be1631307e",
        baseUrl: "https://api.openweathermap.org/data/2.5/weather",
        forecastUrl: "https://api.openweathermap.org/data/2.5/forecast"
    },
    defaultCity: 'Москва'
};

const DOM = (() => {
    const getElement = (id) => document.getElementById(id);
    const getQuery = (selector) => document.querySelector(selector);

    return {
        search: {
            input: getElement('input-box'),
            button: getElement('search-button')
        },
        weather: {
            icon: getElement('weather-icon'),
            city: getElement('city'),
            date: getElement('date'),
            temp: getElement('temp'),
            description: getElement('weather'),
            minMax: getElement('min-max'),
            humidity: getElement('humidity'),
            windSpeed: getElement('wind-speed'),
            pressure: getElement('pressure'),
            body: getQuery('.weather-body')
        },
        forecast: {
            button: getElement('toggle-forecast-button'),
            container: getElement('week-forecast'),
            list: getElement('forecast-list')
        },
        error: getQuery('.error-message'),
        loading: getQuery('.loading-screen')
    };
})();

const Utils = {
    formatDate() {
        const date = new Date();
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long'
        });
    },

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    convertPressure(hPa) {
        return (hPa * 0.750062).toFixed(1);
    },

    async fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    }
};

const UI = {
    toggleLoading(show) {
        DOM.loading.style.display = show ? 'flex' : 'none';
        if (show) {
            DOM.loading.innerHTML = '<div class="spinner"></div><p>Загрузка информации о погоде...</p>';
        }
    },

    toggleError(show, message = 'Город не найден. Пожалуйста, попробуйте ещё раз.') {
        DOM.error.style.display = show ? 'block' : 'none';
        DOM.weather.body.style.display = show ? 'none' : 'block';
        DOM.forecast.container.style.display = 'none';
        if (show) DOM.error.innerHTML = `<p>${message}</p>`;
    },

    updateWeather(data) {
        const { name, sys, main, weather, wind } = data;
        DOM.weather.city.textContent = `${name}, ${sys.country}`;
        DOM.weather.date.textContent = Utils.formatDate();
        DOM.weather.temp.innerHTML = `${Math.round(main.temp)}&deg;C`;
        DOM.weather.description.textContent = Utils.capitalize(weather[0].description);
        DOM.weather.icon.src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
        DOM.weather.minMax.innerHTML = `${Math.round(main.temp_min)}&deg;C (мин) / ${Math.round(main.temp_max)}&deg;C (макс)`;
        DOM.weather.humidity.textContent = `${main.humidity}%`;
        DOM.weather.windSpeed.textContent = `${wind.speed} м/с`;
        DOM.weather.pressure.textContent = `${Utils.convertPressure(main.pressure)} мм рт.ст.`;
    },

    updateForecast(data) {
        DOM.forecast.list.innerHTML = data.list
            .filter((_, index) => index % 8 === 0)
            .map(forecast => {
                const date = new Date(forecast.dt * 1000).toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short'
                });
                return `
                    <div class="forecast-item">
                        <span class="forecast-date">${date}</span>
                        <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Иконка погоды" class="forecast-icon">
                        <span class="forecast-temp">${Math.round(forecast.main.temp)}&deg;C</span>
                        <span class="forecast-weather">${Utils.capitalize(forecast.weather[0].description)}</span>
                    </div>
                `;
            }).join('');
    }
};

class WeatherApp {
    constructor() {
        this.currentCity = CONFIG.defaultCity;
        this.initEventListeners();
        this.getWeatherReport();
    }

    async getWeatherReport() {
        try {
            UI.toggleLoading(true);
            UI.toggleError(false);
            const data = await Utils.fetchData(
                `${CONFIG.API.baseUrl}?q=${this.currentCity}&units=metric&lang=ru&appid=${CONFIG.API.key}`
            );
            UI.updateWeather(data);
            DOM.weather.body.style.display = 'block';
        } catch (error) {
            UI.toggleError(true);
            console.error('Error fetching weather:', error);
        } finally {
            UI.toggleLoading(false);
        }
    }

    async getWeeklyForecast() {
        try {
            UI.toggleLoading(true);
            const data = await Utils.fetchData(
                `${CONFIG.API.forecastUrl}?q=${this.currentCity}&units=metric&lang=ru&appid=${CONFIG.API.key}`
            );
            UI.updateForecast(data);
        } catch (error) {
            console.error('Error fetching forecast:', error);
        } finally {
            UI.toggleLoading(false);
        }
    }

    initEventListeners() {
        DOM.search.button.addEventListener('click', () => this.handleSearch());
        DOM.search.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        DOM.forecast.button.addEventListener('click', () => this.toggleForecast());
    }

    handleSearch() {
        const searchValue = DOM.search.input.value.trim();
        if (searchValue) {
            this.currentCity = searchValue;
            this.getWeatherReport();
        }
    }

    toggleForecast() {
        const isVisible = DOM.forecast.container.style.display === 'block';
        DOM.forecast.container.style.display = isVisible ? 'none' : 'block';
        DOM.forecast.button.classList.toggle('active');
        if (!isVisible) this.getWeeklyForecast();
    }
}

document.addEventListener('DOMContentLoaded', () => new WeatherApp());

