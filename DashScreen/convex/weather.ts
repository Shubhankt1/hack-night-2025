import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to get weather description from WMO code
function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with hail",
  };
  return weatherCodes[code] || "Unknown";
}

// Internal Action: Fetch weather from Open-Meteo and store it
export const fetchAndStoreWeather = internalAction({
  args: {
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      // First, reverse geocode to get city name
      //   const geoResponse = await fetch(
      //     `https://geocoding-api.open-meteo.com/v1/search?latitude=${args.latitude}&longitude=${args.longitude}&count=1&language=en&format=json`
      //   );

      //   const geoData = await geoResponse.json();
      const city = "Unknown Location";

      // Fetch current weather and forecast from Open-Meteo
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?` +
          `latitude=${args.latitude}&` +
          `longitude=${args.longitude}&` +
          `current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&` +
          `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&` +
          `temperature_unit=fahrenheit&` +
          `wind_speed_unit=mph&` +
          `precipitation_unit=inch&` +
          `timezone=auto&` +
          `forecast_days=4`
      );

      if (!weatherResponse.ok) {
        throw new Error(`Open-Meteo API error: ${weatherResponse.statusText}`);
      }

      const data = await weatherResponse.json();

      console.log(data);

      // Process current weather
      const current = data.current;
      const weatherDescription = getWeatherDescription(current.weather_code);

      // Process forecast (next 3 days, skip today)
      const forecast = data.daily.time
        .slice(1, 4)
        .map((date: string, index: number) => ({
          date,
          maxTemp: Math.round(data.daily.temperature_2m_max[index + 1]),
          minTemp: Math.round(data.daily.temperature_2m_min[index + 1]),
          precipitation:
            Math.round(data.daily.precipitation_sum[index + 1] * 10) / 10,
          weatherCode: data.daily.weather_code[index + 1],
        }));

      const weatherData = {
        location: city,
        latitude: args.latitude,
        longitude: args.longitude,
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        description: weatherDescription,
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        precipitation: current.precipitation,
        timestamp: Date.now(),
        forecast,
      };

      await ctx.runMutation(internal.weather.storeWeather, weatherData);

      return { success: true, weather: weatherData };
    } catch (error) {
      console.error("Weather API error:", error);
      throw new Error(
        `Failed to fetch weather: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});

// Internal Mutation: Store weather data
export const storeWeather = internalMutation({
  args: {
    location: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    temperature: v.number(),
    feelsLike: v.number(),
    description: v.string(),
    humidity: v.number(),
    windSpeed: v.number(),
    precipitation: v.number(),
    timestamp: v.number(),
    forecast: v.array(
      v.object({
        date: v.string(),
        maxTemp: v.number(),
        minTemp: v.number(),
        precipitation: v.number(),
        weatherCode: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Remove old weather data for this location (within 50km radius)
    const allWeather = await ctx.db.query("weather").collect();

    for (const doc of allWeather) {
      // Simple distance check (approximately 50km = 0.5 degrees)
      const latDiff = Math.abs(doc.latitude - args.latitude);
      const lonDiff = Math.abs(doc.longitude - args.longitude);

      if (latDiff < 0.5 && lonDiff < 0.5) {
        await ctx.db.delete(doc._id);
      }
    }

    // Insert new weather data
    await ctx.db.insert("weather", args);

    return { success: true };
  },
});

// Public Mutation: Get weather (fetch from cache or trigger refresh if stale)
export const getWeatherForLocation = mutation({
  args: {
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    // Check if we have recent cached weather data (within 50km and less than 12 hours old)
    const allWeather = await ctx.db.query("weather").collect();

    const now = Date.now();
    const AGE_HOURS = 6 * 60 * 60 * 1000;

    for (const doc of allWeather) {
      const latDiff = Math.abs(doc.latitude - args.latitude);
      const lonDiff = Math.abs(doc.longitude - args.longitude);
      const age = now - doc.timestamp;

      // If within 50km radius and less than 12 hours old, return cached data
      if (latDiff < 0.5 && lonDiff < 0.5 && age < AGE_HOURS) {
        return {
          cached: true,
          weather: doc,
        };
      }
    }

    // No valid cache, trigger background refresh
    await ctx.scheduler.runAfter(0, internal.weather.fetchAndStoreWeather, {
      latitude: args.latitude,
      longitude: args.longitude,
    });

    // Return the closest weather data we have (even if stale) or null
    let closestWeather = null;
    let minDistance = Infinity;

    for (const doc of allWeather) {
      const latDiff = Math.abs(doc.latitude - args.latitude);
      const lonDiff = Math.abs(doc.longitude - args.longitude);
      const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);

      if (distance < minDistance) {
        minDistance = distance;
        closestWeather = doc;
      }
    }

    return {
      cached: false,
      weather: closestWeather,
      refreshing: true,
    };
  },
});

// Query: Get latest weather (for any location)
export const getLatestWeather = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null; // Not authenticated
    }
    const allWeather = await ctx.db.query("weather").collect();

    if (allWeather.length === 0) {
      return null;
    }

    // Return most recent weather data
    return allWeather.reduce((latest, current) => {
      return current.timestamp > latest.timestamp ? current : latest;
    });
  },
});
