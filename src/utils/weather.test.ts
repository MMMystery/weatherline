import { describe, expect, it } from 'vitest'
import { displayDay, displayTemperature, getWeatherKind, getWeatherLabel } from './weather'

describe('weather presentation', () => {
  it('maps WMO codes into usable conditions', () => {
    expect(getWeatherKind(0)).toBe('clear')
    expect(getWeatherKind(63)).toBe('rain')
    expect(getWeatherKind(75)).toBe('snow')
    expect(getWeatherKind(95)).toBe('storm')
    expect(getWeatherLabel(3)).toBe('阴天')
  })

  it('converts temperatures without changing source data', () => {
    expect(displayTemperature(20, 'C')).toBe('20°')
    expect(displayTemperature(20, 'F')).toBe('68°')
  })

  it('labels today independently of the viewer timezone', () => {
    expect(displayDay('2026-09-28', '2026-09-28')).toBe('今天')
  })
})
