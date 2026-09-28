import { ArrowUpRight, CloudRain, Droplets, Wind } from 'lucide-react'
import type { CurrentWeather, DayForecast, Location } from '../types'
import { displayHour, displayTemperature, getWeatherKind, getWeatherLabel } from '../utils/weather'
import { WeatherIcon } from './WeatherIcon'

type Props = {
  location: Location
  current: CurrentWeather
  today: DayForecast
  unit: 'C' | 'F'
}

export function CurrentConditions({ location, current, today, unit }: Props) {
  const kind = getWeatherKind(current.code)
  return (
    <section className={`current-card weather-${kind} ${current.isDay ? 'daytime' : 'nighttime'}`} aria-label={`${location.name}当前天气`}>
      <div className="sky-art" aria-hidden="true">
        <div className="sky-orb" />
        <div className="sky-cloud sky-cloud-one" />
        <div className="sky-cloud sky-cloud-two" />
      </div>
      <div className="current-topline"><span className="eyebrow light">当前天气</span><span className="update-time">当地时间 {displayHour(current.time)} 更新</span></div>
      <div className="current-main">
        <div>
          <p className="location-name">{location.name}<span>{location.admin1 && location.admin1 !== location.name ? `, ${location.admin1}` : ''}</span></p>
          <p className="location-country">{location.country}</p>
          <div className="temperature-line"><strong>{displayTemperature(current.temperature, unit)}</strong><span>{unit === 'C' ? 'C' : 'F'}</span></div>
          <div className="condition-line"><WeatherIcon code={current.code} isDay={current.isDay} size={26} /><span>{getWeatherLabel(current.code)}</span></div>
          <p className="feels-like">体感 {displayTemperature(current.feelsLike, unit)} · 今日 {displayTemperature(today.high, unit)} / {displayTemperature(today.low, unit)}</p>
        </div>
        <div className="hero-icon" aria-hidden="true"><WeatherIcon code={current.code} isDay={current.isDay} size={115} /></div>
      </div>
      <div className="current-stats">
        <div><Droplets size={19} /><span>湿度</span><strong>{Math.round(current.humidity)}%</strong></div>
        <div><Wind size={19} /><span>风速</span><strong>{Math.round(current.windSpeed)} <small>km/h</small></strong></div>
        <div><CloudRain size={19} /><span>降水</span><strong>{current.precipitation.toFixed(1)} <small>mm</small></strong></div>
        <div><ArrowUpRight size={19} /><span>最高温</span><strong>{displayTemperature(today.high, unit)}</strong></div>
      </div>
    </section>
  )
}
