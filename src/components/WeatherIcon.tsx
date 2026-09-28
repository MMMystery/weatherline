import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Moon, Sun } from 'lucide-react'
import { getWeatherKind } from '../utils/weather'

type Props = { code: number; isDay?: boolean; size?: number; className?: string }

export function WeatherIcon({ code, isDay = true, size = 28, className }: Props) {
  const kind = getWeatherKind(code)
  const common = { size, strokeWidth: 1.7, className, 'aria-hidden': true as const }
  if (kind === 'clear') return isDay ? <Sun {...common} /> : <Moon {...common} />
  if (kind === 'cloud') return code === 2 && isDay ? <CloudSun {...common} /> : <Cloud {...common} />
  if (kind === 'fog') return <CloudFog {...common} />
  if (kind === 'snow') return <CloudSnow {...common} />
  if (kind === 'storm') return <CloudLightning {...common} />
  return code >= 51 && code <= 57 ? <CloudDrizzle {...common} /> : <CloudRain {...common} />
}
