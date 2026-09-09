const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');

searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keyup', (e) => { if(e.key === 'Enter') getWeather() });

async function getWeather(){
  const city = cityInput.value.trim();
  if(!city){ showError("Please enter city name"); return; }

  const loader = document.getElementById('loader');
  const errorDiv = document.getElementById('error');
  const resultDiv = document.getElementById('result-card');

  try{
    loader.style.display = "block";
    errorDiv.style.display = "none";
    resultDiv.style.display = "none";

    // Step 1: City name -> Lat/Lon vaangarom (Geocoding API - FREE)
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
    const geoData = await geoRes.json();
    
    if(!geoData.results || geoData.results.length === 0){
      throw new Error("City not found! Perambalur spelling check pannu da.");
    }
    
    const { latitude, longitude, name, country } = geoData.results[0];

    // Step 2: Lat/Lon vechu weather vaangarom (Open-Meteo - FREE, No Key)
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature,weather_code`);
    
    if(!weatherRes.ok) throw new Error("Weather fetch failed");

    const data = await weatherRes.json();
    const current = data.current; // nested JSON parsing

    document.getElementById('cityName').innerText = `${name}, ${country}`;
    document.getElementById('desc').innerText = `Weather Code: ${current.weather_code} - Live`;
    document.getElementById('temp').innerText = current.temperature_2m + "°C";
    document.getElementById('humidity').innerText = current.relative_humidity_2m + "%";
    document.getElementById('wind').innerText = current.wind_speed_10m + " km/h";
    document.getElementById('feels').innerText = current.apparent_temperature + "°C";

    resultDiv.style.display = "block";

  } catch(err){
    showError(err.message);
  } finally {
    loader.style.display = "none";
  }
}

function showError(msg){
  const e = document.getElementById('error');
  e.innerText = msg;
  e.style.display = "block";
}

// Default
window.onload = () => {
  cityInput.value = "Perambalur";
  getWeather();
}
