// // WeatherApp.jsx
// import React, { useState, useEffect } from 'react';
// import {
//   Cloud, CloudRain, CloudSnow, Sun, Moon, Wind, Droplets,
//   Eye, Gauge, Sunrise, Sunset, MapPin, Search, Navigation,
//   CloudDrizzle, CloudFog, Zap, Star, Heart, AlertTriangle,
//   Volume2, VolumeX, Settings
// } from 'lucide-react';
//
// const API_KEY = "109201f7c2a355f8340d51a1e6046ff8";
// const BASE_URL = "https://api.openweathermap.org/data/2.5";
// const GEO_URL = "https://api.openweathermap.org/geo/1.0";
//
// // API Functions
// const getCurrentWeather = async (city) => {
//   const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
//   if (!response.ok) throw new Error(response.status === 404 ? 'City not found' : 'Weather service unavailable');
//   const data = await response.json();
//   if (!data.dt) data.dt = Math.floor(Date.now() / 1000);
//   return data;
// };
//
// const getCurrentWeatherByCoords = async (lat, lon) => {
//   const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
//   if (!response.ok) throw new Error('Weather service unavailable');
//   const data = await response.json();
//   if (!data.dt) data.dt = Math.floor(Date.now() / 1000);
//   return data;
// };
//
// const getWeatherForecast = async (city) => {
//   const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
//   if (!response.ok) throw new Error('Forecast unavailable');
//   return await response.json();
// };
//
// const getWeatherForecastByCoords = async (lat, lon) => {
//   const response = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
//   if (!response.ok) throw new Error('Forecast unavailable');
//   return await response.json();
// };
//
// const searchCities = async (query) => {
//   const response = await fetch(`${GEO_URL}/direct?q=${query}&limit=5&appid=${API_KEY}`);
//   if (!response.ok) throw new Error('Search unavailable');
//   const data = await response.json();
//   return data.map((city) => ({
//     name: city.name,
//     lat: city.lat,
//     lon: city.lon,
//     country: city.country,
//     state: city.state || "",
//   }));
// };
//
// const WeatherApp = () => {
//   const [weather, setWeather] = useState(null);
//   const [forecast, setForecast] = useState(null);
//   const [hourly, setHourly] = useState([]);
//   const [city, setCity] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchInput, setSearchInput] = useState('');
//   const [suggestions, setSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [favorites, setFavorites] = useState([]);
//   const [units, setUnits] = useState('metric');
//   const [showSettings, setShowSettings] = useState(false);
//   const [soundEnabled, setSoundEnabled] = useState(false);
//
//   const getWeatherMode = (condition, isNight) => {
//     if (isNight) return 'night';
//     const lower = condition.toLowerCase();
//     if (lower.includes('thunder') || lower.includes('storm')) return 'storm';
//     if (lower.includes('rain') || lower.includes('drizzle')) return 'rainy';
//     if (lower.includes('snow') || lower.includes('sleet')) return 'snow';
//     if (lower.includes('fog') || lower.includes('mist') || lower.includes('haze')) return 'fog';
//     if (lower.includes('cloud')) return 'cloudy';
//     return 'bright';
//   };
//
//   const modeThemes = {
//     bright: {
//       bg: 'from-amber-400 via-orange-300 to-yellow-200',
//       cardBg: 'bg-white/25 backdrop-blur-xl',
//       text: 'text-gray-900',
//       subtext: 'text-gray-700',
//       accent: 'text-orange-600',
//       glow: 'shadow-2xl shadow-orange-300/50',
//       heroGlow: 'drop-shadow-2xl',
//       border: 'border-white/30'
//     },
//     cloudy: {
//       bg: 'from-slate-400 via-gray-400 to-blue-300',
//       cardBg: 'bg-white/20 backdrop-blur-xl',
//       text: 'text-gray-900',
//       subtext: 'text-gray-700',
//       accent: 'text-slate-700',
//       glow: 'shadow-2xl shadow-slate-400/40',
//       heroGlow: 'drop-shadow-xl',
//       border: 'border-white/25'
//     },
//     rainy: {
//       bg: 'from-slate-700 via-blue-600 to-slate-500',
//       cardBg: 'bg-white/10 backdrop-blur-2xl',
//       text: 'text-white',
//       subtext: 'text-blue-100',
//       accent: 'text-cyan-300',
//       glow: 'shadow-2xl shadow-blue-500/40',
//       heroGlow: 'drop-shadow-2xl',
//       border: 'border-white/20'
//     },
//     storm: {
//       bg: 'from-slate-950 via-purple-950 to-indigo-950',
//       cardBg: 'bg-white/5 backdrop-blur-3xl',
//       text: 'text-white',
//       subtext: 'text-purple-200',
//       accent: 'text-purple-400',
//       glow: 'shadow-2xl shadow-purple-600/50',
//       heroGlow: 'drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]',
//       border: 'border-purple-500/30'
//     },
//     snow: {
//       bg: 'from-blue-200 via-cyan-100 to-slate-100',
//       cardBg: 'bg-white/35 backdrop-blur-xl',
//       text: 'text-slate-800',
//       subtext: 'text-slate-600',
//       accent: 'text-blue-600',
//       glow: 'shadow-2xl shadow-blue-300/50',
//       heroGlow: 'drop-shadow-xl',
//       border: 'border-white/40'
//     },
//     fog: {
//       bg: 'from-gray-500 via-slate-400 to-gray-300',
//       cardBg: 'bg-white/15 backdrop-blur-2xl',
//       text: 'text-gray-900',
//       subtext: 'text-gray-700',
//       accent: 'text-gray-600',
//       glow: 'shadow-2xl shadow-gray-500/40',
//       heroGlow: 'drop-shadow-lg',
//       border: 'border-white/20'
//     },
//     night: {
//       bg: 'from-slate-950 via-indigo-950 to-blue-950',
//       cardBg: 'bg-white/5 backdrop-blur-3xl',
//       text: 'text-white',
//       subtext: 'text-blue-200',
//       accent: 'text-blue-400',
//       glow: 'shadow-2xl shadow-blue-600/40',
//       heroGlow: 'drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]',
//       border: 'border-blue-500/20'
//     }
//   };
//
//   useEffect(() => {
//     const saved = JSON.parse(localStorage.getItem('weatherPrefs') || '{}');
//     setUnits(saved.units || 'metric');
//     setSoundEnabled(saved.sound || false);
//     setFavorites(saved.favorites || []);
//     fetchWeather(saved.lastCity || 'London');
//   }, []);
//
//   const savePrefs = (prefs) => {
//     const current = JSON.parse(localStorage.getItem('weatherPrefs') || '{}');
//     localStorage.setItem('weatherPrefs', JSON.stringify({ ...current, ...prefs }));
//   };
//
//   const fetchWeatherByLocation = async () => {
//     try {
//       setLoading(true);
//       const pos = await new Promise((resolve, reject) => {
//         navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
//       });
//
//       const weatherData = await getCurrentWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
//       const forecastData = await getWeatherForecastByCoords(pos.coords.latitude, pos.coords.longitude);
//       processWeatherData(weatherData, forecastData);
//     } catch (err) {
//       console.error('Location error:', err);
//       setError('Could not get your location');
//       setLoading(false);
//     }
//   };
//
//   const fetchWeather = async (cityName) => {
//     try {
//       setLoading(true);
//       setError('');
//
//       const weatherData = await getCurrentWeather(cityName);
//       const forecastData = await getWeatherForecast(cityName);
//
//       processWeatherData(weatherData, forecastData);
//       savePrefs({ lastCity: cityName });
//     } catch (err) {
//       console.error('Weather error:', err);
//       setError(err.message);
//       setLoading(false);
//     }
//   };
//
//   const processWeatherData = (weatherData, forecastData) => {
//     const daily = forecastData.list.filter((item, i) => i % 8 === 0).slice(0, 7).map(item => ({
//       dt: item.dt,
//       temp: { max: item.main.temp_max, min: item.main.temp_min },
//       weather: item.weather,
//       pop: item.pop || 0
//     }));
//
//     const hourlyData = forecastData.list.slice(0, 8).map(item => ({
//       dt: item.dt,
//       temp: item.main.temp,
//       weather: item.weather,
//       pop: item.pop || 0
//     }));
//
//     setWeather(weatherData);
//     setForecast({ list: daily });
//     setHourly(hourlyData);
//     setCity(weatherData.name);
//     setLoading(false);
//   };
//
//   const handleSearchInput = async (value) => {
//     setSearchInput(value);
//     if (value.length > 2) {
//       try {
//         const cities = await searchCities(value);
//         setSuggestions(cities);
//         setShowSuggestions(true);
//       } catch (err) {
//         console.error(err);
//       }
//     } else {
//       setSuggestions([]);
//       setShowSuggestions(false);
//     }
//   };
//
//   const handleCitySelect = (cityData) => {
//     setSearchInput('');
//     setSuggestions([]);
//     setShowSuggestions(false);
//     fetchWeather(cityData.name);
//   };
//
//   const toggleFavorite = () => {
//     const newFavs = favorites.includes(city)
//     ? favorites.filter(f => f !== city)
//     : [...favorites, city];
//     setFavorites(newFavs);
//     savePrefs({ favorites: newFavs });
//   };
//
//   const toggleUnits = () => {
//     const newUnits = units === 'metric' ? 'imperial' : 'metric';
//     setUnits(newUnits);
//     savePrefs({ units: newUnits });
//   };
//
//   const toggleSound = () => {
//     const newSound = !soundEnabled;
//     setSoundEnabled(newSound);
//     savePrefs({ sound: newSound });
//   };
//
//   if (loading || !weather || !forecast) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
//       <div className="text-center">
//       <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
//       <div className="text-white text-2xl font-light">Loading weather...</div>
//       </div>
//       </div>
//     );
//   }
//
//   const isNight = weather.dt < weather.sys.sunrise || weather.dt > weather.sys.sunset;
//   const mode = getWeatherMode(weather.weather[0].main, isNight);
//   const theme = modeThemes[mode];
//   const isSevere = mode === 'storm' || (mode === 'rainy' && weather.wind.speed > 10);
//
//   const WeatherIcon = ({ size = 'w-20 h-20' }) => {
//     const icons = {
//       storm: <Zap className={size} />,
//       rainy: <CloudRain className={size} />,
//       snow: <CloudSnow className={size} />,
//       night: <Moon className={size} />,
//       cloudy: <Cloud className={size} />,
//       fog: <CloudFog className={size} />,
//       bright: <Sun className={size} />
//     };
//     return icons[mode] || <Sun className={size} />;
//   };
//
//   const AnimatedBackground = () => {
//     if (mode === 'rainy' || mode === 'storm') {
//       return (
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {Array.from({ length: mode === 'storm' ? 100 : 60 }).map((_, i) => (
//           <div
//           key={i}
//           className="absolute bg-white/20"
//           style={{
//             left: `${Math.random() * 100}%`,
//                                                                             top: `-${Math.random() * 20}%`,
//                                                                             width: '2px',
//                                                                             height: `${Math.random() * 40 + 30}px`,
//                                                                             animation: `rain ${Math.random() * 0.7 + 0.3}s linear infinite`,
//                                                                             animationDelay: `${Math.random() * 2}s`,
//                                                                             transform: 'rotate(10deg)'
//           }}
//           />
//         ))}
//         {mode === 'storm' && (
//           <div className="absolute inset-0 opacity-30 animate-pulse" style={{ animationDuration: '2s' }}>
//           <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
//           </div>
//         )}
//         </div>
//       );
//     }
//
//     if (mode === 'snow') {
//       return (
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {Array.from({ length: 40 }).map((_, i) => (
//           <div
//           key={i}
//           className="absolute bg-white rounded-full opacity-80"
//           style={{
//             left: `${Math.random() * 100}%`,
//                                                    top: `-${Math.random() * 20}%`,
//                                                    width: `${Math.random() * 6 + 3}px`,
//                                                    height: `${Math.random() * 6 + 3}px`,
//                                                    animation: `snow ${Math.random() * 5 + 3}s linear infinite`,
//                                                    animationDelay: `${Math.random() * 5}s`
//           }}
//           />
//         ))}
//         </div>
//       );
//     }
//
//     if (mode === 'fog') {
//       return (
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {Array.from({ length: 3 }).map((_, i) => (
//           <div
//           key={i}
//           className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
//           style={{
//             animation: `fog ${15 + i * 3}s ease-in-out infinite`,
//             animationDelay: `${i * 5}s`
//           }}
//           />
//         ))}
//         </div>
//       );
//     }
//
//     if (mode === 'night') {
//       return (
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {Array.from({ length: 50 }).map((_, i) => (
//           <Star
//           key={i}
//           className="absolute text-white"
//           style={{
//             left: `${Math.random() * 100}%`,
//                                                    top: `${Math.random() * 100}%`,
//                                                    width: `${Math.random() * 3 + 1}px`,
//                                                    height: `${Math.random() * 3 + 1}px`,
//                                                    opacity: Math.random() * 0.7 + 0.3,
//                                                    animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
//                                                    animationDelay: `${Math.random() * 3}s`
//           }}
//           />
//         ))}
//         </div>
//       );
//     }
//
//     return null;
//   };
//
//   return (
//     <div className={`min-h-screen bg-gradient-to-br ${theme.bg} transition-all duration-1000 relative overflow-hidden`}>
//     <AnimatedBackground />
//
//     <style>{`
//       @keyframes rain { to { transform: translateY(100vh) rotate(10deg); } }
//       @keyframes snow { to { transform: translateY(100vh) translateX(100px); opacity: 0; } }
//       @keyframes fog {
//         0%, 100% { transform: translateX(-100%); }
//         50% { transform: translateX(100%); }
//       }
//       @keyframes twinkle {
//         0%, 100% { opacity: 0.3; }
//         50% { opacity: 1; }
//       }
//       @keyframes float {
//         0%, 100% { transform: translateY(0px); }
//         50% { transform: translateY(-10px); }
//       }
//       `}</style>
//
//       <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
//       {/* Header with Search */}
//       <div className="mb-8">
//       <div className={`${theme.cardBg} rounded-3xl p-6 ${theme.glow} border ${theme.border} transition-all duration-500`}>
//       <div className="flex items-center gap-4 mb-4">
//       <button
//       onClick={fetchWeatherByLocation}
//       className={`${theme.accent} bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all transform hover:scale-105`}
//       title="Use my location"
//       >
//       <Navigation className="w-6 h-6" />
//       </button>
//       <div className="flex-1 relative">
//       <input
//       type="text"
//       value={searchInput}
//       onChange={(e) => handleSearchInput(e.target.value)}
//       onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
//       onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
//       placeholder="Search city..."
//       className={`w-full bg-white/10 ${theme.text} placeholder-current/50 border-none rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-lg`}
//       />
//       {showSuggestions && suggestions.length > 0 && (
//         <div className={`absolute top-full mt-2 w-full ${theme.cardBg} rounded-2xl shadow-2xl overflow-hidden z-50 border ${theme.border}`}>
//         {suggestions.map((city, i) => (
//           <button
//           key={i}
//           onClick={() => handleCitySelect(city)}
//           className={`w-full text-left px-6 py-4 ${theme.text} hover:bg-white/10 transition-all`}
//           >
//           <div className="font-semibold text-lg">{city.name}</div>
//           <div className={`text-sm ${theme.subtext}`}>{city.state ? `${city.state}, ` : ''}{city.country}</div>
//           </button>
//         ))}
//         </div>
//       )}
//       </div>
//       <button
//       onClick={toggleFavorite}
//       className={`${favorites.includes(city) ? 'text-red-500' : theme.accent} bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all transform hover:scale-105`}
//       >
//       <Heart className="w-6 h-6" fill={favorites.includes(city) ? 'currentColor' : 'none'} />
//       </button>
//       <button
//       onClick={() => setShowSettings(!showSettings)}
//       className={`${theme.accent} bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all transform hover:scale-105`}
//       >
//       <Settings className="w-6 h-6" />
//       </button>
//       </div>
//
//       {showSettings && (
//         <div className={`mt-4 pt-4 border-t ${theme.border} flex gap-4`}>
//         <button onClick={toggleUnits} className={`${theme.text} hover:${theme.accent} transition-all`}>
//         Units: {units === 'metric' ? '°C' : '°F'}
//         </button>
//         <button onClick={toggleSound} className={`${theme.text} hover:${theme.accent} transition-all flex items-center gap-2`}>
//         {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
//         Sound
//         </button>
//         </div>
//       )}
//       </div>
//       </div>
//
//       {error && (
//         <div className="mb-8 bg-red-500/20 backdrop-blur-md rounded-2xl p-4 text-white border border-red-500/30">
//         {error}
//         </div>
//       )}
//
//       {/* Hero Weather Section */}
//       <div className={`${theme.cardBg} rounded-[2.5rem] p-8 md:p-12 ${theme.glow} border ${theme.border} mb-8 transition-all duration-500 transform hover:scale-[1.01]`}>
//       <div className="flex items-center gap-3 mb-6">
//       <MapPin className={`w-6 h-6 ${theme.accent}`} />
//       <h2 className={`text-3xl md:text-4xl font-bold ${theme.text}`}>{city}</h2>
//       </div>
//
//       <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
//       <div>
//       <div className={`text-8xl md:text-9xl font-bold ${theme.text} mb-4 ${theme.heroGlow}`} style={{ animation: 'float 3s ease-in-out infinite' }}>
//       {Math.round(weather.main.temp)}°
//       </div>
//       <div className={`text-2xl md:text-3xl ${theme.text} opacity-90 capitalize mb-3`}>
//       {weather.weather[0].description}
//       </div>
//       <div className={`text-xl ${theme.subtext}`}>
//       Feels like {Math.round(weather.main.feels_like)}°
//       </div>
//       </div>
//       <div className={`flex justify-center ${theme.accent} ${theme.heroGlow}`} style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}>
//       <WeatherIcon size="w-48 h-48" />
//       </div>
//       </div>
//
//       {isSevere && (
//         <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
//         <AlertTriangle className="w-6 h-6 text-red-400" />
//         <span className={`${theme.text} font-semibold`}>Severe weather alert</span>
//         </div>
//       )}
//
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
//       {[
//         { icon: Droplets, label: 'Humidity', value: `${weather.main.humidity}%` },
//         { icon: Wind, label: 'Wind', value: `${weather.wind.speed} ${units === 'metric' ? 'm/s' : 'mph'}` },
//         { icon: Gauge, label: 'Pressure', value: `${weather.main.pressure} hPa` },
//         { icon: Eye, label: 'Visibility', value: `${(weather.visibility / 1000).toFixed(1)} km` }
//       ].map((item, i) => (
//         <div key={i} className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all transform hover:scale-105">
//         <item.icon className={`w-7 h-7 ${theme.accent} mb-2`} />
//         <div className={`text-sm ${theme.subtext} mb-1`}>{item.label}</div>
//         <div className={`text-xl font-bold ${theme.text}`}>{item.value}</div>
//         </div>
//       ))}
//       </div>
//
//       <div className="flex gap-8 pt-6 border-t border-white/10">
//       <div className="flex items-center gap-3">
//       <Sunrise className={`w-7 h-7 ${theme.accent}`} />
//       <div>
//       <div className={`text-sm ${theme.subtext}`}>Sunrise</div>
//       <span className={`text-lg font-semibold ${theme.text}`}>
//       {new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//       </span>
//       </div>
//       </div>
//       <div className="flex items-center gap-3">
//       <Sunset className={`w-7 h-7 ${theme.accent}`} />
//       <div>
//       <div className={`text-sm ${theme.subtext}`}>Sunset</div>
//       <span className={`text-lg font-semibold ${theme.text}`}>
//       {new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//       </span>
//       </div>
//       </div>
//       </div>
//       </div>
//
//       {/* Hourly Forecast */}
//       <div className={`${theme.cardBg} rounded-3xl p-8 ${theme.glow} border ${theme.border} mb-8 transition-all duration-500`}>
//       <h3 className={`text-2xl font-bold ${theme.text} mb-6`}>Hourly Forecast</h3>
//       <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
//       {hourly.map((hour, i) => {
//         const HourIcon = hour.weather[0].main === 'Rain' ? CloudRain : hour.weather[0].main === 'Clear' ? Sun : Cloud;
//         return (
//           <div key={i} className="text-center bg-white/5 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-all transform hover:scale-105 border border-white/10">
//           <div className={`text-sm ${theme.subtext} mb-3`}>
//           {new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//           </div>
//           <HourIcon className={`${theme.accent} w-8 h-8 mx-auto mb-3`} />
//           <div className={`text-xl font-bold ${theme.text} mb-2`}>
//           {Math.round(hour.temp)}°
//           </div>
//           <div className={`text-xs ${theme.subtext}`}>
//           {Math.round(hour.pop * 100)}%
//           </div>
//           </div>
//         );
//       })}
//       </div>
//       </div>
//
//       {/* 7-Day Forecast */}
//       <div className={`${theme.cardBg} rounded-3xl p-8 ${theme.glow} border ${theme.border} transition-all duration-500`}>
//       <h3 className={`text-2xl font-bold ${theme.text} mb-6`}>7-Day Forecast</h3>
//       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
//       {forecast.list.map((day, i) => {
//         const DayIcon = day.weather[0].main === 'Rain' ? CloudRain : day.weather[0].main === 'Clear' ? Sun : day.weather[0].main === 'Snow' ? CloudSnow : Cloud;
//         return (
//           <div key={i} className="text-center bg-white/5 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all transform hover:scale-105 border border-white/10">
//           <div className={`text-sm font-semibold ${theme.subtext} mb-3`}>
//           {new Date(day.dt * 1000).toLocaleDateString('en', { weekday: 'short' })}
//           </div>
//           <DayIcon className={`${theme.accent} w-12 h-12 mx-auto mb-3`} />
//           <div className={`text-2xl font-bold ${theme.text} mb-1`}>
//           {Math.round(day.temp.max)}°
//           </div>
//           <div className={`text-lg ${theme.subtext} mb-2`}>
//           {Math.round(day.temp.min)}°
//           </div>
//           <div className={`text-xs ${theme.subtext}`}>
//           {Math.round(day.pop * 100)}%
//           </div>
//           </div>
//         );
//       })}
//       </div>
//       </div>
//
//       {/* Favorites */}
//       {favorites.length > 0 && (
//         <div className={`${theme.cardBg} rounded-3xl p-8 ${theme.glow} border ${theme.border} mt-8 transition-all duration-500`}>
//         <h3 className={`text-2xl font-bold ${theme.text} mb-6`}>Favorites</h3>
//         <div className="flex flex-wrap gap-3">
//         {favorites.map((fav, i) => (
//           <button
//           key={i}
//           onClick={() => fetchWeather(fav)}
//           className={`px-6 py-3 ${theme.text} bg-white/10 hover:bg-white/20 rounded-full transition-all transform hover:scale-105 border ${theme.border}`}
//           >
//           {fav}
//           </button>
//         ))}
//         </div>
//         </div>
//       )}
//       </div>
//       </div>
//   );
// };
//
// export default WeatherApp;
