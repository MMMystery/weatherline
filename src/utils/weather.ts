export type WeatherKind = 'clear' | 'cloud' | 'rain' | 'snow' | 'storm' | 'fog'

export function getWeatherKind(code: number): WeatherKind {
  if (code === 0 || code === 1) return 'clear'
  if (code === 2 || code === 3) return 'cloud'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 67 || code >= 80 && code <= 82) return 'rain'
  if (code >= 71 && code <= 77 || code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'storm'
  return 'cloud'
}

export function getWeatherLabel(code: number): string {
  if (code === 0) return '晴朗'
  if (code === 1) return '大致晴朗'
  if (code === 2) return '局部多云'
  if (code === 3) return '阴天'
  if (code === 45 || code === 48) return '有雾'
  if (code >= 51 && code <= 57) return '毛毛雨'
  if (code >= 61 && code <= 67) return '有雨'
  if (code >= 71 && code <= 77) return '有雪'
  if (code >= 80 && code <= 82) return '阵雨'
  if (code === 85 || code === 86) return '阵雪'
  if (code >= 95) return '雷雨'
  return '天气多变'
}

export const displayTemperature = (value: number, unit: 'C' | 'F') =>
  `${Math.round(unit === 'F' ? value * 9 / 5 + 32 : value)}°`

export const displayHour = (time: string) => time.slice(11, 16)

export function displayDay(date: string, today: string): string {
  if (date === today) return '今天'
  const input = new Date(`${date}T12:00:00Z`)
  return new Intl.DateTimeFormat('zh-CN', { weekday: 'short', timeZone: 'UTC' }).format(input)
}
