import type { Location, Weather } from '../types'

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'

async function getJson(url: URL, signal?: AbortSignal): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new Error('网络连接失败，请检查网络后重试。', { cause: error })
  }

  if (!response.ok) throw new Error(`天气服务暂时不可用（${response.status}），请稍后重试。`)
  return response.json()
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

export async function searchLocations(query: string, signal?: AbortSignal): Promise<Location[]> {
  const url = new URL(GEO_URL)
  url.search = new URLSearchParams({ name: query.trim(), count: '6', language: 'zh', format: 'json' }).toString()
  const data = await getJson(url, signal)
  if (!isRecord(data)) throw new Error('地点搜索结果无法读取，请重试。')
  if (!Array.isArray(data.results)) return []

  return data.results.filter((item): item is Location =>
    isRecord(item) && isNumber(item.id) && typeof item.name === 'string' &&
    typeof item.country === 'string' && isNumber(item.latitude) &&
    isNumber(item.longitude) && typeof item.timezone === 'string',
  )
}

export async function getWeather(location: Location, signal?: AbortSignal): Promise<Weather> {
  const url = new URL(WEATHER_URL)
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    forecast_days: '7',
    timezone: 'auto',
  }).toString()

  const data = await getJson(url, signal)
  if (!isRecord(data) || !isRecord(data.current) || !isRecord(data.hourly) || !isRecord(data.daily)) {
    throw new Error('天气数据暂时无法读取，请重试。')
  }

  const { current, hourly, daily } = data
  if (
    typeof current.time !== 'string' || !isNumber(current.temperature_2m) ||
    !isNumber(current.apparent_temperature) || !isNumber(current.relative_humidity_2m) ||
    !isNumber(current.precipitation) || !isNumber(current.wind_speed_10m) ||
    !isNumber(current.weather_code) || !isNumber(current.is_day) ||
    !Array.isArray(hourly.time) || !Array.isArray(hourly.temperature_2m) ||
    !Array.isArray(hourly.precipitation_probability) || !Array.isArray(hourly.weather_code) ||
    !Array.isArray(daily.time) || !Array.isArray(daily.temperature_2m_max) ||
    !Array.isArray(daily.temperature_2m_min) || !Array.isArray(daily.precipitation_probability_max) ||
    !Array.isArray(daily.weather_code) || !Array.isArray(daily.sunrise) || !Array.isArray(daily.sunset)
  ) {
    throw new Error('天气数据不完整，请稍后重试。')
  }

  const hourlyTimes = hourly.time as unknown[]
  const hourlyTemperatures = hourly.temperature_2m as unknown[]
  const hourlyRain = hourly.precipitation_probability as unknown[]
  const hourlyCodes = hourly.weather_code as unknown[]
  const dailyTimes = daily.time as unknown[]
  const dailyHighs = daily.temperature_2m_max as unknown[]
  const dailyLows = daily.temperature_2m_min as unknown[]
  const dailyRain = daily.precipitation_probability_max as unknown[]
  const dailyCodes = daily.weather_code as unknown[]
  const dailySunrise = daily.sunrise as unknown[]
  const dailySunset = daily.sunset as unknown[]

  const hours = hourlyTimes.map((time, index) => ({
    time,
    temperature: hourlyTemperatures[index],
    rainChance: hourlyRain[index],
    code: hourlyCodes[index],
  })).filter((hour): hour is { time: string; temperature: number; rainChance: number; code: number } =>
    typeof hour.time === 'string' && isNumber(hour.temperature) &&
    isNumber(hour.rainChance) && isNumber(hour.code),
  )

  const days = dailyTimes.map((date, index) => ({
    date,
    high: dailyHighs[index],
    low: dailyLows[index],
    rainChance: dailyRain[index],
    code: dailyCodes[index],
    sunrise: dailySunrise[index],
    sunset: dailySunset[index],
  })).filter((day): day is { date: string; high: number; low: number; rainChance: number; code: number; sunrise: string; sunset: string } =>
    typeof day.date === 'string' && isNumber(day.high) && isNumber(day.low) &&
    isNumber(day.rainChance) && isNumber(day.code) &&
    typeof day.sunrise === 'string' && typeof day.sunset === 'string',
  )

  if (hours.length < 24 || days.length < 7) throw new Error('预报数据不完整，请稍后重试。')

  return {
    current: {
      time: current.time,
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      windSpeed: current.wind_speed_10m,
      code: current.weather_code,
      isDay: current.is_day === 1,
    },
    hours,
    days,
  }
}
