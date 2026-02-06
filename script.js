const apiKey = "b77232cd316c29d308b660820361107a";

const cityInput = document.getElementById("city");
const result = document.getElementById("result");
const container = document.querySelector(".container");
const forecastContainer = document.getElementById("forecast");

let lottieAnimation = null;

// ENTER
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") getWeather();
});

async function getWeather() {
  const city = cityInput.value.trim();
  if (!city) return showError("Digite o nome de uma cidade");

  try {
    // CLIMA ATUAL
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`
    );
    const data = await response.json();

    if (data.cod !== 200) return showError("Cidade não encontrada");

    showWeather(data);

    // PREVISÃO FUTURA
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`
    );
    const forecastData = await forecastResponse.json();

    showForecast(forecastData);

  } catch {
    showError("Erro ao buscar dados");
  }
}

function showWeather(data) {
  container.classList.remove("search-mode");
  container.classList.add("weather-mode");

  changeBackground(data.weather[0].id, data);

  const isNight = data.dt < data.sys.sunrise || data.dt > data.sys.sunset;
  const periodoTexto = isNight ? "Noite 🌙" : "Dia ☀️";

  result.innerHTML = `
    <h2>${data.name}</h2>
    <p>🌡️ Temperatura: ${Math.round(data.main.temp)}°C</p>
    <p>🌡️ Sensação térmica: ${Math.round(data.main.feels_like)}°C</p>
    <p>☁️ ${capitalize(data.weather[0].description)}</p>
    <p>💧 Umidade: ${data.main.humidity}%</p>
    <p>🌬️ Vento: ${data.wind.speed} km/h</p>
    <p>🕒 Período: <strong>${periodoTexto}</strong></p>
  `;
}

/* ===== PREVISÃO FUTURA MIN / MAX ===== */
function showForecast(data) {
  forecastContainer.innerHTML = "";
  forecastContainer.classList.remove("hidden");

  const days = {};

  // Agrupa temperaturas por dia
  data.list.forEach(item => {
    const dateKey = new Date(item.dt * 1000).toLocaleDateString("pt-BR");

    if (!days[dateKey]) {
      days[dateKey] = [];
    }

    days[dateKey].push(item.main.temp);
  });

  // Próximos 4 dias (ignora hoje)
  Object.entries(days).slice(1, 5).forEach(([date, temps]) => {
    const min = Math.round(Math.min(...temps));
    const max = Math.round(Math.max(...temps));

    const dayName = new Date(date).toLocaleDateString("pt-BR", {
      weekday: "short"
    });

    forecastContainer.innerHTML += `
      <div class="forecast-day">
        <span>${dayName}</span>
        <span style="color:#60a5fa">Min ${min}°</span>
        <span style="color:#f87171">Max ${max}°</span>
      </div>
    `;
  });
}

function showError(msg) {
  forecastContainer.classList.add("hidden");
  result.style.display = "block";
  result.innerHTML = `<p style="color:#f87171;font-weight:bold">⚠️ ${msg}</p>`;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* ===== FUNDO + LOTTIE ===== */
function changeBackground(weatherId, data) {
  document.body.className = "";

  if (lottieAnimation) lottieAnimation.destroy();

  const isNight = data.dt < data.sys.sunrise || data.dt > data.sys.sunset;

  // ⛈️ Trovoada
  if (weatherId >= 200 && weatherId <= 232) {
    document.body.classList.add(isNight ? "night-rain" : "rain");
    playLottie(isNight ? "lottie/night-thunderstorm.json" : "lottie/thunderstorm.json");
    return;
  }

  // 🌧️ Chuva
  if (weatherId >= 300 && weatherId <= 531) {
    document.body.classList.add(isNight ? "night-rain" : "rain");
    playLottie(isNight ? "lottie/night-rain.json" : "lottie/rain.json");
    return;
  }

  // ❄️ Neve
  if (weatherId >= 600 && weatherId <= 622) {
    document.body.classList.add(isNight ? "night-snow" : "snow");
    playLottie(isNight ? "lottie/night-snow.json" : "lottie/snow.json");
    return;
  }

  // ☁️ Nublado
  if (weatherId >= 801 && weatherId <= 804) {
    document.body.classList.add(isNight ? "night-clouds" : "clouds");
    playLottie(isNight ? "lottie/night-clouds.json" : "lottie/clouds.json");
    return;
  }

  // ☀️ Limpo
  if (weatherId === 800) {
    document.body.classList.add(isNight ? "night" : "clear");
    playLottie(isNight ? "lottie/night.json" : "lottie/sun.json");
    return;
  }

  document.body.classList.add("default");
}

function playLottie(path) {
  lottieAnimation = lottie.loadAnimation({
    container: document.getElementById("lottie-bg"),
    renderer: "svg",
    loop: true,
    autoplay: true,
    path
  });
}