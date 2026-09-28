import { useEffect, useState } from 'react'
import { ArrowRight, CloudSun, RefreshCw } from 'lucide-react'
import { getWeather } from './api/weather'
import { CurrentConditions } from './components/CurrentConditions'
import { Forecast } from './components/Forecast'
import { LocationSearch } from './components/LocationSearch'
import type { Location, Weather } from './types'

const DEFAULT_LOCATION: Location = {
  id: 1796236, name: '上海', admin1: '上海', country: '中国',
  latitude: 31.2304, longitude: 121.4737, timezone: 'Asia/Shanghai',
}

function savedLocation(): Location {
  try {
    const value = JSON.parse(localStorage.getItem('weatherline-location') || 'null')
    if (value && typeof value.name === 'string' && typeof value.latitude === 'number' &&
        typeof value.longitude === 'number' && typeof value.timezone === 'string') return value
  } catch { /* Invalid local data falls back to the default city. */ }
  return DEFAULT_LOCATION
}

function App() {
  const [location, setLocation] = useState<Location>(savedLocation)
  const [weather, setWeather] = useState<Weather | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errorKind, setErrorKind] = useState<'weather' | 'location'>('weather')
  const [reload, setReload] = useState(0)
  const [locating, setLocating] = useState(false)
  const [unit, setUnit] = useState<'C' | 'F'>('C')

  useEffect(() => {
    const controller = new AbortController()
    getWeather(location, controller.signal)
      .then((data) => { if (!controller.signal.aborted) { setWeather(data); setError(''); setLoading(false) } })
      .catch((caught) => { if (!controller.signal.aborted) { setErrorKind('weather'); setError(caught instanceof Error ? caught.message : '天气加载失败，请重试。'); setLoading(false) } })
    return () => controller.abort()
  }, [location, reload])

  function selectLocation(next: Location) {
    setLocation(next)
    setWeather(null)
    setLoading(true)
    setError('')
    try { localStorage.setItem('weatherline-location', JSON.stringify(next)) } catch { /* Storage is optional. */ }
  }

  function retry() { setWeather(null); setLoading(true); setError(''); setReload((count) => count + 1) }

  function locate() {
    if (!navigator.geolocation) { setErrorKind('location'); setError('当前浏览器不支持定位，请搜索城市名称。'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords
      try {
        // Open-Meteo does not offer reverse geocoding. Coordinates remain an honest label.
        selectLocation({ id: Date.now(), name: '当前位置', country: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`, latitude, longitude, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
      } finally { setLocating(false) }
    }, () => { setLocating(false); setErrorKind('location'); setError('无法获取位置。请允许定位权限，或搜索城市名称。') }, { timeout: 10000, maximumAge: 300000 })
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="brand"><span className="brand-mark"><CloudSun size={25} strokeWidth={1.8} /></span><span>weatherline<span className="brand-period">.</span></span></div>
        <div className="header-right"><span className="header-caption">看清天气，安排今天</span><span className="header-separator" /><span className="header-live"><i /> 实时天气</span></div>
      </header>

      <main>
        <div className="intro-row">
          <div><span className="eyebrow intro-eyebrow">YOUR DAILY FORECAST</span><h1>天气，<em>一目了然。</em></h1><p>从此刻到未来一周，出门前知道该怎么准备。</p></div>
          <div className="intro-note"><span className="note-line" /><span>把每一天<br />过得更有把握</span></div>
        </div>

        <div className="toolbar">
          <LocationSearch onSelect={selectLocation} onLocate={locate} locating={locating} />
          <div className="unit-toggle" role="group" aria-label="温度单位">
            <button type="button" className={unit === 'C' ? 'selected' : ''} aria-pressed={unit === 'C'} onClick={() => setUnit('C')}>°C</button>
            <button type="button" className={unit === 'F' ? 'selected' : ''} aria-pressed={unit === 'F'} onClick={() => setUnit('F')}>°F</button>
          </div>
        </div>

        {error && <div className="error-banner" role="alert"><span>{error}</span><button type="button" onClick={errorKind === 'weather' ? retry : () => setError('')}>{errorKind === 'weather' ? '重试' : '关闭'} <ArrowRight size={16} /></button></div>}

        {loading && !weather && <div className="loading-panel" role="status"><span className="loading-spinner" /><strong>正在获取 {location.name} 的天气</strong><span>预报马上就来</span></div>}

        {!loading && weather && (
          <div className="weather-content">
            <CurrentConditions location={location} current={weather.current} today={weather.days[0]} unit={unit} />
            <Forecast hours={weather.hours} days={weather.days} now={weather.current.time} unit={unit} />
          </div>
        )}
        {!loading && !weather && !error && <div className="loading-panel">还没有天气数据。搜索城市开始查看。</div>}
      </main>

      <footer className="site-footer"><span>weatherline. <span className="footer-muted">让天气信息更简单。</span></span><div><span>数据来自 <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></span><button type="button" onClick={retry} aria-label="刷新天气" title="刷新天气"><RefreshCw size={16} /></button></div></footer>
    </div>
  )
}

export default App
