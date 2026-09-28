export type Location = {
  id: number
  name: string
  admin1?: string
  country: string
  latitude: number
  longitude: number
  timezone: string
}

export type CurrentWeather = {
  time: string
  temperature: number
  feelsLike: number
  humidity: number
  precipitation: number
  windSpeed: number
  code: number
  isDay: boolean
}

export type HourForecast = {
  time: string
  temperature: number
  rainChance: number
  code: number
}

export type DayForecast = {
  date: string
  high: number
  low: number
  rainChance: number
  code: number
  sunrise: string
  sunset: string
}

export type Weather = {
  current: CurrentWeather
  hours: HourForecast[]
  days: DayForecast[]
}
