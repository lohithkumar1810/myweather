import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import * as THREE from 'three';
import CLOUDS from 'vanta/dist/vanta.clouds.min';

const Dashboard = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [city, setCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const vantaRef = useRef(null);

  useEffect(() => {
    let vantaEffect;
    if (vantaRef.current) {
      vantaEffect = CLOUDS({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        skyColor: 0x68b8d7,
        cloudColor: 0xadc1e8,
        cloudShadowColor: 0x183550,
        sunColor: 0xff9919,
        sunGlareColor: 0xff6633,
        sunPosition: {x: 3, y: 2, z: -1},
        speed: 1.2
      });
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  const fetchWeather = async (queryParam) => {
    setLoading(true);
    setError('');
    try {
      const [currentRes, forecastRes] = await Promise.all([
        api.get(`/weather/current?${queryParam}`),
        api.get(`/weather/forecast?${queryParam}`)
      ]);
      setWeather(currentRes.data);
      setForecast(forecastRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weather data');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(`lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
        },
        () => {
          fetchWeather('city=London');
        }
      );
    } else {
      fetchWeather('city=London');
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeather(`city=${searchQuery}`);
      setCity(searchQuery);
    }
  };

  return (
    <div ref={vantaRef} className="absolute inset-0 w-full min-h-screen z-0 -mt-20 pt-20">
      <div className="container mx-auto p-4 relative z-10 h-full overflow-y-auto pb-20">
        
        <div className="flex justify-center mb-8 pt-6">
          <form onSubmit={handleSearch} className="w-full max-w-lg flex gap-2 shadow-xl rounded-xl">
            <input 
              type="text" 
              placeholder="Search for a city..." 
              className="flex-1 glassmorphism px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-white/70 text-lg transition-shadow border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-blue-600/80 hover:bg-blue-600 backdrop-blur-md text-white px-8 py-3 rounded-xl transition-all shadow-lg font-medium text-lg border border-white/20">
              Search
            </button>
          </form>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white shadow-lg"></div>
          </div>
        )}

        {error && (
          <div className="glassmorphism bg-red-500/30 text-white p-4 max-w-lg mx-auto text-center font-medium border-red-500/50 shadow-lg">
            {error}
          </div>
        )}

        {!loading && weather && (
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            <div className="glassmorphism p-8 w-full lg:w-1/3 flex flex-col items-center transform hover:scale-[1.02] transition-transform duration-300">
              <h2 className="text-4xl font-bold mb-2 tracking-tight drop-shadow-md">{weather.name}, {weather.sys.country}</h2>
              <p className="text-xl text-white/80 capitalize mb-6">{weather.weather[0].description}</p>
              
              <div className="flex items-center justify-center mb-6">
                <img 
                  src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
                  alt="weather icon" 
                  className="w-32 h-32 filter drop-shadow-xl"
                />
                <span className="text-7xl font-light tracking-tighter drop-shadow-lg">{Math.round(weather.main.temp)}&deg;</span>
              </div>
              
              <div className="w-full grid grid-cols-2 gap-4 mt-4 pt-6 border-t border-white/20">
                <div className="text-center">
                  <p className="text-sm text-white/70 uppercase tracking-wider mb-1">Humidity</p>
                  <p className="text-2xl font-semibold drop-shadow">{weather.main.humidity}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/70 uppercase tracking-wider mb-1">Wind Speed</p>
                  <p className="text-2xl font-semibold drop-shadow">{weather.wind.speed} m/s</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/70 uppercase tracking-wider mb-1">Feels Like</p>
                  <p className="text-2xl font-semibold drop-shadow">{Math.round(weather.main.feels_like)}&deg;</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/70 uppercase tracking-wider mb-1">Pressure</p>
                  <p className="text-2xl font-semibold drop-shadow">{weather.main.pressure} hPa</p>
                </div>
              </div>
            </div>

            {forecast && (
              <div className="glassmorphism p-8 w-full lg:w-2/3 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 drop-shadow">
                  <svg className="w-6 h-6 text-yellow-300 drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  5-Day Forecast
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {forecast.list.filter((item, index) => index % 8 === 0).map((day, i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-4 flex flex-col items-center border border-white/20 hover:bg-white/20 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-1">
                      <p className="font-medium text-white/90 drop-shadow">{new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}</p>
                      <img 
                        src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`} 
                        alt="icon" 
                        className="w-16 h-16 my-2 filter drop-shadow-md"
                      />
                      <p className="text-2xl font-semibold mb-1 drop-shadow">{Math.round(day.main.temp)}&deg;</p>
                      <p className="text-xs text-white/80 capitalize text-center leading-tight">{day.weather[0].description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
