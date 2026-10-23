// src/worker/weather.js: fuente de JOSEMI-OS.
const weatherLabels = {
  0: "despejado",
  1: "mayormente despejado",
  2: "parcialmente nublado",
  3: "nublado",
  45: "niebla",
  48: "niebla con escarcha",
  51: "llovizna débil",
  53: "llovizna",
  55: "llovizna intensa",
  61: "lluvia débil",
  63: "lluvia",
  65: "lluvia intensa",
  71: "nieve débil",
  73: "nieve",
  75: "nieve intensa",
  80: "chubascos débiles",
  81: "chubascos",
  82: "chubascos fuertes",
  95: "tormenta",
  96: "tormenta con granizo",
  99: "tormenta con granizo fuerte",
};

async function weather(payload, origin) {
  const city = typeof payload.city === "string" ? payload.city.trim().slice(0, 100) : "";
  if (city.length < 2) return json({ error: "Indica una ciudad" }, 400, origin);
  try {
    const geoURL = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoURL.searchParams.set("name", city);
    geoURL.searchParams.set("count", "1");
    geoURL.searchParams.set("language", "es");
    const placeResponse = await fetch(geoURL.toString(), { signal: AbortSignal.timeout(8000) });
    if (!placeResponse.ok) throw new Error("Geocoding API unavailable");
    const places = await placeResponse.json();
    const place = places.results?.[0];
    if (!place) return json({ error: "No se ha encontrado la ciudad", city }, 404, origin);

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(place.latitude));
    url.searchParams.set("longitude", String(place.longitude));
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    );
    url.searchParams.set("timezone", "auto");
    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Forecast API unavailable");
    const result = await response.json();
    const current = result.current;
    if (!current || typeof current.temperature_2m !== "number") throw new Error("No weather data");

    return json(
      {
        source: "Open-Meteo",
        city: place.name,
        country: place.country || "",
        time: current.time,
        temperature_c: current.temperature_2m,
        feels_like_c: current.apparent_temperature,
        humidity_percent: current.relative_humidity_2m,
        wind_kmh: current.wind_speed_10m,
        conditions: weatherLabels[current.weather_code] || "condiciones variables",
        attribution: "https://open-meteo.com/",
      },
      200,
      origin,
    );
  } catch (error) {
    if (timedOut(error))
      return json(
        { error: "La consulta del tiempo ha tardado demasiado. Inténtalo de nuevo." },
        504,
        origin,
      );
    return json({ error: "No se ha podido consultar el tiempo" }, 502, origin);
  }
}
