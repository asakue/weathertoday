document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const cityList = document.getElementById('cityList');
    const weatherInfo = document.getElementById('weatherInfo');

    // Обработчик клика на кнопку поиска
    searchBtn.addEventListener('click', () => {
        const cityName = cityInput.value.trim();
        if (cityName) {
            searchCities(cityName);
        } else {
            weatherInfo.innerHTML = '<p>Пожалуйста, введите название города.</p>';
        }
    });

    // Функция для поиска городов
    async function searchCities(cityName) {
        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=ru`;

        try {
            const response = await fetch(geocodingUrl);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }

            const data = await response.json();
            if (data && data.results && data.results.length > 0) {
                displayCityList(data.results);
            } else {
                weatherInfo.innerHTML = '<p>Город не найден. Попробуйте снова.</p>';
            }
        } catch (error) {
            console.error('Ошибка при поиске города:', error);
            weatherInfo.innerHTML = '<p>Произошла ошибка при поиске города. Проверьте подключение к интернету.</p>';
        }
    }

    // Функция для отображения списка городов
    function displayCityList(cities) {
        cityList.innerHTML = ''; // Очищаем список
        cities.forEach(city => {
            const cityElement = document.createElement('div');
            cityElement.textContent = `${city.name}, ${city.admin1 || ''}, ${city.country}`;
            cityElement.classList.add('city-item');

            // Обработчик клика на город
            cityElement.addEventListener('click', () => {
                getWeather(city.latitude, city.longitude);
                cityList.innerHTML = ''; // Очищаем список после выбора
            });

            cityList.appendChild(cityElement);
        });
    }

    // Функция для получения погоды
    async function getWeather(latitude, longitude) {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&forecast_days=1`;

        try {
            const response = await fetch(weatherUrl);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }

            const data = await response.json();
            if (data && data.hourly && data.hourly.time && data.hourly.temperature_2m) {
                displayWeather(data.hourly.time, data.hourly.temperature_2m);
            } else {
                weatherInfo.innerHTML = '<p>Данные о погоде недоступны.</p>';
            }
        } catch (error) {
            console.error('Ошибка при получении погоды:', error);
            weatherInfo.innerHTML = '<p>Произошла ошибка при получении погоды. Проверьте подключение к интернету.</p>';
        }
    }

    // Функция для отображения погоды
    function displayWeather(times, temperatures) {
        let weatherHTML = '<h2>Прогноз погоды на сегодня</h2>';
        weatherHTML += '<table>';
        weatherHTML += '<tr><th>Время</th><th>Температура (°C)</th></tr>';

        times.forEach((time, index) => {
            const formattedTime = time.split('T')[1]; // Оставляем только время
            weatherHTML += `<tr><td>${formattedTime}</td><td>${temperatures[index]}</td></tr>`;
        });

        weatherHTML += '</table>';
        weatherInfo.innerHTML = weatherHTML;
    }
});
