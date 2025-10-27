// src/components/Weather.tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

// Weather icon mapping based on WMO codes
function getWeatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 57) return "🌧️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}

export function Weather() {
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string>("");

  // Get latest cached weather
  const weather = useQuery(api.weather.getLatestWeather);
  const getWeatherForLocation = useMutation(api.weather.getWeatherForLocation);

  // Get user's location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ latitude, longitude });

          // Trigger weather fetch with coordinates
          getWeatherForLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(
            "Unable to get your location. Please enable location access."
          );
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, [getWeatherForLocation]);

  const handleRefresh = async () => {
    if (coordinates) {
      await getWeatherForLocation(coordinates);
    }
  };

  if (locationError) {
    return (
      <div className="space-y-4">
        <div className="text-red-500 text-center py-8 text-sm">
          {locationError}
        </div>
      </div>
    );
  }

  if (!coordinates) {
    return (
      <div className="space-y-4">
        <div className="text-gray-500 text-center py-8">
          Getting your location...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        {/* <span className="text-sm text-gray-600">
          {weather?.location || "Loading..."}
        </span> */}
        <button
          onClick={handleRefresh}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Refresh
        </button>
      </div>

      {weather === undefined ? (
        <div className="text-gray-500 text-center py-8">Loading weather...</div>
      ) : !weather ? (
        <div className="text-gray-500 text-center py-8">
          Fetching weather data...
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current Weather */}
          <div className="text-center">
            <div className="text-6xl mb-2">
              {getWeatherEmoji(weather.forecast?.[0]?.weatherCode || 0)}
            </div>
            <div className="text-4xl font-bold text-gray-800">
              {weather.temperature}°F
            </div>
            <div className="text-sm text-gray-600 capitalize mt-1">
              {weather.description}
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500">Feels Like</div>
              <div className="text-sm font-semibold text-gray-800">
                {weather.feelsLike}°F
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500">Humidity</div>
              <div className="text-sm font-semibold text-gray-800">
                {weather.humidity}%
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500">Wind</div>
              <div className="text-sm font-semibold text-gray-800">
                {weather.windSpeed} mph
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500">Precip</div>
              <div className="text-sm font-semibold text-gray-800">
                {weather.precipitation}"
              </div>
            </div>
          </div>

          {/* 3-Day Forecast */}
          {weather.forecast && weather.forecast.length > 0 && (
            <div className="border-t pt-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">
                3-Day Forecast
              </div>
              <div className="space-y-2">
                {weather.forecast.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600 w-16">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </span>
                    <span className="text-2xl">
                      {getWeatherEmoji(day.weatherCode)}
                    </span>
                    <div className="flex gap-2 text-gray-700">
                      <span className="font-semibold">{day.maxTemp}°</span>
                      <span className="text-gray-500">{day.minTemp}°</span>
                    </div>
                    {day.precipitation > 0 && (
                      <span className="text-xs text-blue-600">
                        {day.precipitation}"
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400 text-center">
            Updated {new Date(weather.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
