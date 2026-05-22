import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Wind,
  Droplets,
  Gauge,
  Eye,
  Clock,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function weatherCodeToText(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Rain showers",
    81: "Heavy rain showers",
    82: "Violent rain showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm with hail",
  };
  return map[code] || "Clear sky";
}

function getThemeFromWeather(code) {
  if ([95, 96, 99].includes(code)) return "storm";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([1, 2, 3].includes(code)) return "clouds";
  if ([45, 48].includes(code)) return "mist";
  return "clear";
}

function getThemeBackground(theme) {
  switch (theme) {
    case "rain":
      return "bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.35),transparent_35%),linear-gradient(135deg,#0f172a_0%,#1e293b_35%,#334155_100%)]";
    case "snow":
      return "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_30%),linear-gradient(135deg,#94a3b8_0%,#cbd5e1_45%,#64748b_100%)]";
    case "storm":
      return "bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.25),transparent_35%),linear-gradient(135deg,#020617_0%,#111827_40%,#312e81_100%)]";
    case "clouds":
      return "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_30%),linear-gradient(135deg,#1f2937_0%,#475569_45%,#64748b_100%)]";
    case "mist":
      return "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_30%),linear-gradient(135deg,#334155_0%,#475569_45%,#94a3b8_100%)]";
    default:
      return "bg-[radial-gradient(circle_at_top,rgba(253,224,71,0.28),transparent_30%),linear-gradient(135deg,#0f172a_0%,#1d4ed8_45%,#38bdf8_100%)]";
  }
}

function formatHour(timeText) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timeText));
}

function formatDay(dateText) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(new Date(dateText));
}

function formatClock(timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: timeZone || undefined,
  }).format(new Date());
}

function weatherIconFromCode(code, className = "w-6 h-6") {
  if ([95, 96, 99].includes(code)) return <CloudLightning className={className} />;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain className={className} />;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow className={className} />;
  if ([1, 2, 3].includes(code)) return <Cloud className={className} />;
  return <Sun className={className} />;
}

function GlassCard({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20 ${className}`}>
    {children}
    </div>
  );
}

function AnimatedBackground({ theme }) {
  const backgroundClass = getThemeBackground(theme);

  return (
    <div className={`absolute inset-0 overflow-hidden ${backgroundClass}`}>
    <motion.div
    className="absolute -left-24 top-[-8rem] h-80 w-80 rounded-full bg-white/10 blur-3xl"
    animate={{ x: [0, 80, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
    />

    <motion.div
    className="absolute bottom-[-8rem] right-[-3rem] h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl"
    animate={{ x: [0, -70, 0], y: [0, -25, 0], scale: [1, 1.08, 1] }}
    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
    />

    {theme === "clear" && (
      <>
      <motion.div
      className="absolute right-16 top-16 h-40 w-40 rounded-full bg-yellow-200/30 blur-2xl"
      animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
      className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.18),transparent_35%)]"
      animate={{ opacity: [0.4, 0.65, 0.4] }}
      transition={{ duration: 6, repeat: Infinity }}
      />
      </>
    )}

    {theme === "clouds" && (
      <>
      {[...Array(5)].map((_, i) => (
        <motion.div
        key={`cloud-${i}`}
        className="absolute rounded-full bg-white/12 blur-2xl"
        style={{
          top: `${12 + i * 12}%`,
          width: `${180 + i * 35}px`,
          height: `${60 + i * 12}px`,
        }}
        initial={{ x: i % 2 === 0 ? "-25%" : "110%" }}
        animate={{ x: i % 2 === 0 ? "110%" : "-30%" }}
        transition={{ duration: 22 + i * 4, repeat: Infinity, ease: "linear" }}
        />
      ))}
      </>
    )}

    {theme === "rain" && (
      <>
      {[...Array(80)].map((_, i) => (
        <motion.div
        key={`rain-${i}`}
        className="absolute w-[1px] rounded-full bg-white/40"
        style={{
          left: `${(i * 1.27) % 100}%`,
                                     height: `${12 + (i % 10) * 2}px`,
                                     top: "-10%",
                                     rotate: "14deg",
        }}
        initial={{ y: "-10vh", opacity: 0.2 }}
        animate={{ y: "120vh", opacity: [0.15, 0.5, 0.15] }}
        transition={{ duration: 0.9 + (i % 8) * 0.12, repeat: Infinity, ease: "linear", delay: (i % 12) * 0.1 }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_35%)]" />
      </>
    )}

    {theme === "snow" && (
      <>
      {[...Array(40)].map((_, i) => (
        <motion.div
        key={`snow-${i}`}
        className="absolute rounded-full bg-white/85"
        style={{
          width: `${4 + (i % 4)}px`,
                                     height: `${4 + (i % 4)}px`,
                                     left: `${(i * 2.4) % 100}%`,
                                     top: "-5%",
        }}
        initial={{ y: "-5vh", x: 0, opacity: 0.7 }}
        animate={{ y: "110vh", x: [0, 12, -8, 0], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 7 + (i % 8), repeat: Infinity, ease: "linear", delay: (i % 10) * 0.25 }}
        />
      ))}
      </>
    )}

    {theme === "storm" && (
      <>
      {[...Array(60)].map((_, i) => (
        <motion.div
        key={`storm-rain-${i}`}
        className="absolute w-[1px] rounded-full bg-white/35"
        style={{
          left: `${(i * 1.7) % 100}%`,
                                     height: `${14 + (i % 8) * 2}px`,
                                     top: "-10%",
                                     rotate: "18deg",
        }}
        initial={{ y: "-10vh", opacity: 0.15 }}
        animate={{ y: "120vh", opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 0.8 + (i % 5) * 0.1, repeat: Infinity, ease: "linear", delay: (i % 9) * 0.08 }}
        />
      ))}
      <motion.div
      className="absolute inset-0 bg-white"
      animate={{ opacity: [0, 0, 0.14, 0, 0.22, 0] }}
      transition={{ duration: 5, repeat: Infinity, repeatDelay: 4 }}
      />
      </>
    )}

    {theme === "mist" && (
      <>
      {[...Array(4)].map((_, i) => (
        <motion.div
        key={`mist-${i}`}
        className="absolute rounded-full bg-white/10 blur-3xl"
        style={{
          top: `${20 + i * 16}%`,
          left: `${-10 + i * 10}%`,
          width: `${280 + i * 60}px`,
          height: `${90 + i * 18}px`,
        }}
        animate={{ x: [0, 100, 0], opacity: [0.16, 0.28, 0.16] }}
        transition={{ duration: 18 + i * 4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      </>
    )}
    </div>
  );
}

export default function PremiumWeatherApp() {
  const [query, setQuery] = useState("Colombo");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clock, setClock] = useState(formatClock());

  const currentTheme = useMemo(() => {
    const code = weatherData?.current?.weatherCode ?? 0;
    return getThemeFromWeather(code);
  }, [weatherData]);

  async function searchCity(city) {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const data = await response.json();

    if (!response.ok || !data?.results?.length) {
      throw new Error("City not found.");
    }

    return data.results[0];
  }

  function buildHourlyList(hourly) {
    if (!hourly?.time?.length) return [];

    const now = Date.now();
    const items = hourly.time.map((time, index) => ({
      time,
      temp: hourly.temperature_2m[index],
      weatherCode: hourly.weather_code[index],
    }));

    const futureItems = items.filter((item) => new Date(item.time).getTime() >= now);
    return (futureItems.length ? futureItems : items).slice(0, 8);
  }

  function buildDailyList(daily) {
    if (!daily?.time?.length) return [];

    return daily.time.slice(0, 7).map((date, index) => ({
      date,
      weatherCode: daily.weather_code[index],
      max: daily.temperature_2m_max[index],
      min: daily.temperature_2m_min[index],
      humidity: daily.relative_humidity_2m_mean[index],
    }));
  }

  async function fetchWeather(latitude, longitude, locationInfo) {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,wind_speed_10m,visibility,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean&timezone=auto&forecast_days=7`
    );

    const data = await response.json();

    if (!response.ok || !data?.current) {
      throw new Error("Could not load weather data.");
    }

    setWeatherData({
      location: locationInfo,
      timezone: data.timezone,
      current: {
        temp: data.current.temperature_2m,
        feelsLike: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m,
        pressure: data.current.pressure_msl,
        visibility: data.current.visibility,
        weatherCode: data.current.weather_code,
        text: weatherCodeToText(data.current.weather_code),
      },
      hourly: buildHourlyList(data.hourly),
                   daily: buildDailyList(data.daily),
    });
  }

  async function fetchByCity(city) {
    if (!city?.trim()) return;

    try {
      setLoading(true);
      setError("");
      const place = await searchCity(city);
      await fetchWeather(place.latitude, place.longitude, {
        name: place.name,
        region: place.admin1 || place.admin2 || "",
        country: place.country || "",
      });
    } catch (err) {
      setWeatherData(null);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchByCoords(latitude, longitude) {
    try {
      setLoading(true);
      setError("");

      let locationInfo = {
        name: "Current Location",
        region: "",
        country: "",
      };

      try {
        const geoResponse = await fetch(
          `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`
        );
        const geoData = await geoResponse.json();
        locationInfo = {
          name:
          geoData?.address?.city ||
          geoData?.address?.town ||
          geoData?.address?.village ||
          geoData?.address?.state ||
          "Current Location",
          region: geoData?.address?.state || "",
          country: geoData?.address?.country || "",
        };
      } catch {
        locationInfo = {
          name: "Current Location",
          region: "",
          country: "",
        };
      }

      await fetchWeather(latitude, longitude, locationInfo);
    } catch (err) {
      setWeatherData(null);
      setError(err.message || "Could not get your location weather.");
    } finally {
      setLoading(false);
    }
  }

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchByCoords(latitude, longitude);
      },
      () => {
        setError("Location access denied.");
      }
    );
  }

  useEffect(() => {
    fetchByCity("Colombo");
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setClock(formatClock(weatherData?.timezone));
    }, 1000);

    return () => clearInterval(id);
  }, [weatherData?.timezone]);

  const current = weatherData?.current;
  const hourly = weatherData?.hourly || [];
  const forecastDays = weatherData?.daily || [];
  const locationLabel = [weatherData?.location?.name, weatherData?.location?.region, weatherData?.location?.country]
  .filter(Boolean)
  .join(", ");

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
    <AnimatePresence mode="wait">
    <motion.div
    key={currentTheme}
    className="absolute inset-0"
    initial={{ opacity: 0, scale: 1.02 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1 }}
    >
    <AnimatedBackground theme={currentTheme} />
    </motion.div>
    </AnimatePresence>

    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/40 via-slate-900/20 to-black/55" />

    <div className="relative z-10 mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
    <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
    className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
    >
    <div>
    <h1 className="text-3xl font-bold tracking-tight md:text-5xl">WeatherSphere</h1>
    <p className="mt-2 text-sm text-white/75 md:text-base">
    Premium glass weather dashboard with animated live backgrounds
    </p>
    </div>

    <GlassCard className="p-3 md:p-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
    <div className="relative min-w-[260px] flex-1">
    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
    <input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && fetchByCity(query)}
    placeholder="Search city..."
    className="w-full rounded-2xl border border-white/15 bg-white/10 py-3 pl-11 pr-4 text-white placeholder:text-white/45 outline-none transition focus:border-white/30 focus:bg-white/15"
    />
    </div>
    <button
    onClick={() => fetchByCity(query)}
    className="rounded-2xl bg-white/15 px-5 py-3 font-medium backdrop-blur-md transition hover:bg-white/25"
    >
    Search
    </button>
    <button
    onClick={getCurrentLocation}
    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400/20 px-5 py-3 font-medium transition hover:bg-cyan-400/30"
    >
    <MapPin className="h-4 w-4" />
    Use my location
    </button>
    </div>
    </GlassCard>
    </motion.div>

    {error && (
      <GlassCard className="mb-6 border-red-300/30 bg-red-500/10 p-4 text-sm text-red-100">
      {error}
      </GlassCard>
    )}

    {loading && (
      <div className="mb-6 flex items-center gap-3 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
      <div className="h-3 w-3 animate-ping rounded-full bg-white" />
      <span className="text-sm text-white/85">Loading weather data...</span>
      </div>
    )}

    {current && (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2">
      <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6 }}
      >
      <GlassCard className="relative overflow-hidden p-6 md:p-8">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
      <div>
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
      <Clock className="h-3.5 w-3.5" />
      Local time: {clock}
      </div>
      <h2 className="text-2xl font-semibold md:text-3xl">{locationLabel}</h2>
      <p className="mt-2 text-white/70">{current.text}</p>
      <div className="mt-5 flex items-center gap-4">
      <div className="rounded-3xl bg-white/10 p-4">
      {weatherIconFromCode(current.weatherCode, "w-10 h-10")}
      </div>
      <div>
      <div className="text-6xl font-bold leading-none md:text-7xl">
      {Math.round(current.temp)}°
      </div>
      <div className="mt-2 text-sm text-white/70">
      Feels like {Math.round(current.feelsLike)}°C
      </div>
      </div>
      </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:min-w-[280px]">
      {[
        {
          label: "Humidity",
          value: `${current.humidity}%`,
          icon: <Droplets className="h-4 w-4" />,
        },
        {
          label: "Wind",
          value: `${current.wind} km/h`,
          icon: <Wind className="h-4 w-4" />,
        },
        {
          label: "Pressure",
          value: `${Math.round(current.pressure)} hPa`,
                 icon: <Gauge className="h-4 w-4" />,
        },
        {
          label: "Visibility",
          value: `${(current.visibility / 1000).toFixed(1)} km`,
                 icon: <Eye className="h-4 w-4" />,
        },
      ].map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 transition hover:bg-white/15">
        <div className="mb-2 flex items-center gap-2 text-white/70">
        {item.icon}
        <span className="text-sm">{item.label}</span>
        </div>
        <div className="text-lg font-semibold">{item.value}</div>
        </div>
      ))}
      </div>
      </div>
      </GlassCard>
      </motion.div>

      <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.6 }}
      className="mt-6"
      >
      <GlassCard className="p-6">
      <div className="mb-5 flex items-center justify-between">
      <h3 className="text-xl font-semibold">Hourly Forecast</h3>
      <span className="text-sm text-white/60">Next 8 hours</span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
      {hourly.map((hour, index) => (
        <motion.div
        key={index}
        whileHover={{ y: -4, scale: 1.02 }}
        className="rounded-2xl border border-white/15 bg-white/8 p-4 text-center"
        >
        <div className="text-sm text-white/70">{formatHour(hour.time)}</div>
        <div className="my-3 flex justify-center">
        {weatherIconFromCode(hour.weatherCode, "w-7 h-7")}
        </div>
        <div className="text-lg font-semibold">{Math.round(hour.temp)}°</div>
        </motion.div>
      ))}
      </div>
      </GlassCard>
      </motion.div>
      </div>

      <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.26, duration: 0.6 }}
      >
      <GlassCard className="h-full p-6">
      <div className="mb-5 flex items-center justify-between">
      <h3 className="text-xl font-semibold">7-Day Forecast</h3>
      <span className="text-sm text-white/60">Weekly view</span>
      </div>
      <div className="space-y-3">
      {forecastDays.map((day, index) => (
        <motion.div
        key={index}
        whileHover={{ x: 4 }}
        className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/8 px-4 py-3"
        >
        <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/10 p-2">
        {weatherIconFromCode(day.weatherCode, "w-5 h-5")}
        </div>
        <div>
        <div className="font-medium">{formatDay(day.date)}</div>
        <div className="text-xs text-white/60">{weatherCodeToText(day.weatherCode)}</div>
        </div>
        </div>
        <div className="text-right">
        <div className="font-semibold">
        {Math.round(day.max)}° / {Math.round(day.min)}°
        </div>
        <div className="text-xs text-white/60">Humidity {Math.round(day.humidity)}%</div>
        </div>
        </motion.div>
      ))}
      </div>
      </GlassCard>
      </motion.div>
      </div>
    )}
    </div>
    </div>
  );
}
