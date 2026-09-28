import { Droplets, Sunrise, Sunset } from 'lucide-react'
import type { DayForecast, HourForecast } from '../types'
import { displayDay, displayHour, displayTemperature, getWeatherLabel } from '../utils/weather'
import { WeatherIcon } from './WeatherIcon'

type Props = { hours: HourForecast[]; days: DayForecast[]; now: string; unit: 'C' | 'F' }

export function Forecast({ hours, days, now, unit }: Props) {
  const upcoming = hours.filter((hour) => hour.time >= now.slice(0, 13)).slice(0, 24)
  const today = now.slice(0, 10)
  const temps = days.flatMap((day) => [day.low, day.high])
  const min = Math.min(...temps)
  const range = Math.max(...temps) - min || 1
  const chartValues = upcoming.map((hour) => unit === 'F' ? hour.temperature * 9 / 5 + 32 : hour.temperature)
  const chartMin = Math.floor(Math.min(...chartValues) - 1)
  const chartMax = Math.ceil(Math.max(...chartValues) + 1)
  const chartRange = chartMax - chartMin || 1
  const points = chartValues.map((value, index) => `${24 + index * (552 / Math.max(chartValues.length - 1, 1))},${123 - (value - chartMin) / chartRange * 87}`).join(' ')

  return (
    <div className="forecast-grid">
      <section className="panel hourly-panel" aria-labelledby="hourly-heading">
        <div className="section-heading"><div><span className="eyebrow">短时趋势</span><h2 id="hourly-heading">未来 24 小时</h2></div><span className="section-meta">当地时间</span></div>
        <div className="hour-scroll" tabIndex={0} aria-label="横向滚动查看未来 24 小时天气">
          {upcoming.map((hour, index) => (
            <div className={`hour-item ${index === 0 ? 'first' : ''}`} key={hour.time}>
              <span className="hour-time">{index === 0 ? '现在' : displayHour(hour.time)}</span>
              <WeatherIcon code={hour.code} size={29} />
              <strong>{displayTemperature(hour.temperature, unit)}</strong>
              <span className="rain-chance"><Droplets size={12} aria-hidden="true" />{Math.round(hour.rainChance)}%</span>
            </div>
          ))}
        </div>
        <div className="temperature-chart">
          <div className="chart-heading"><span>温度走势</span><span>{unit === 'C' ? '摄氏度' : '华氏度'}</span></div>
          <svg viewBox="0 0 600 150" role="img" aria-label={`未来 24 小时气温范围：${displayTemperature(Math.min(...upcoming.map((hour) => hour.temperature)), unit)} 到 ${displayTemperature(Math.max(...upcoming.map((hour) => hour.temperature)), unit)}`} preserveAspectRatio="none">
            <defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8fb9ce" stopOpacity=".35"/><stop offset="1" stopColor="#8fb9ce" stopOpacity="0"/></linearGradient></defs>
            <line x1="24" y1="36" x2="576" y2="36" stroke="#dce9ef" strokeDasharray="3 5" />
            <line x1="24" y1="123" x2="576" y2="123" stroke="#dce9ef" strokeDasharray="3 5" />
            <polygon points={`24,140 ${points} 576,140`} fill="url(#chart-fill)" />
            <polyline points={points} fill="none" stroke="#76a9c1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="chart-axis"><span>现在</span><span>6 小时后</span><span>12 小时后</span><span>18 小时后</span><span>24 小时后</span></div>
        </div>
      </section>
      <section className="panel daily-panel" aria-labelledby="daily-heading">
        <div className="section-heading"><div><span className="eyebrow">接下来</span><h2 id="daily-heading">7 天预报</h2></div><span className="section-meta">最高 / 最低</span></div>
        <div className="daily-list">
          {days.map((day) => (
            <div className="day-row" key={day.date} title={`${day.date}：${getWeatherLabel(day.code)}`}>
              <span className="day-name">{displayDay(day.date, today)}</span>
              <div className="day-condition"><WeatherIcon code={day.code} size={22} /><span>{getWeatherLabel(day.code)}</span></div>
              <span className="day-rain"><Droplets size={13} aria-hidden="true" />{Math.round(day.rainChance)}%</span>
              <span className="day-low">{displayTemperature(day.low, unit)}</span>
              <div className="temp-track" aria-hidden="true"><span style={{ left: `${(day.low - min) / range * 100}%`, width: `${Math.max((day.high - day.low) / range * 100, 5)}%` }} /></div>
              <strong className="day-high">{displayTemperature(day.high, unit)}</strong>
            </div>
          ))}
        </div>
        <div className="sun-times"><span><Sunrise size={18} /> 日出 {displayHour(days[0].sunrise)}</span><span><Sunset size={18} /> 日落 {displayHour(days[0].sunset)}</span></div>
      </section>
    </div>
  )
}
