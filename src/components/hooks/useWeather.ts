import axios from "axios";
import { z } from "zod";
import { SearchType } from "../../types";
import { useMemo, useState } from "react";
// function isWeatherResponse(weather: unknown): weather is Weather {
//   return (
//     Boolean(weather) &&
//     typeof weather === "object" &&
//     typeof (weather as Weather).name === "string" &&
//     typeof (weather as Weather).main.temp === "number" &&
//     typeof (weather as Weather).main.temp_max === "number" &&
//     typeof (weather as Weather).main.temp_min === "number"
//   );
// }

// Zod

const Weather = z.object({
  name: z.string(),
  main: z.object({
    temp: z.number(),
    temp_max: z.number(),
    temp_min: z.number(),
  }),
});

export type Weather = z.infer<typeof Weather>;

const initalState = {
  name: "",
  main: {
    temp: 0,
    temp_max: 0,
    temp_min: 0,
  },
};
export default function useWeather() {
  const [weather, setWeather] = useState<Weather>(initalState);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const fetchWeather = async (search: SearchType) => {
    const appId = import.meta.env.VITE_API_KEY;
    setLoading(true);
    setWeather(initalState);
    try {
      const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}`;
      const { data } = await axios(geoUrl);

      if (!data[0]) {
        setNotFound(true);
        return;
      } else {
        setNotFound(false);
      }

      const lat = data[0].lat;
      const lon = data[0].lon;

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`;

      // // Type Guards
      // const { data: weatherInfo } = await axios(weatherUrl);
      // const result = isWeatherResponse(weatherInfo);

      //Crear el type
      // const { data: weatherInfo } = await axios<Weather>(weatherUrl);
      // console.log(weatherInfo);

      // ZOD
      const { data: weatherInfo } = await axios<Weather>(weatherUrl);
      const result = Weather.safeParse(weatherInfo);
      if (result.success) {
        setWeather(result.data);
      }
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    } finally {
      setLoading(false);
    }
  };
  const hasWeatherData = useMemo(() => weather.name, [weather]);

  return {
    weather,
    loading,
    hasWeatherData,
    fetchWeather,
    notFound,
  };
}
