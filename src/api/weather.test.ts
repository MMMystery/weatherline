import { afterEach, describe, expect, it, vi } from 'vitest'
import { getWeather, searchLocations } from './weather'
import type { Location } from '../types'

const location: Location = {
  id: 1, name: '上海', country: '中国', latitude: 31.23,
  longitude: 121.47, timezone: 'Asia/Shanghai',
}

afterEach(() => vi.unstubAllGlobals())

describe('Open-Meteo integration', () => {
  it('encodes the search query and accepts valid locations', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      results: [location, { id: 2, name: 'Invalid result' }],
    }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchLocations(' 北京 ')).resolves.toEqual([location])
    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.searchParams.get('name')).toBe('北京')
    expect(url.searchParams.get('language')).toBe('zh')
  })

  it('reports API errors instead of presenting them as no search results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ error: true, reason: 'Rate limit' }), { status: 200 },
    )))
    await expect(searchLocations('北京')).rejects.toThrow('地点搜索暂时不可用')
  })

  it('translates invalid JSON into a useful error message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{invalid', { status: 200 })))
    await expect(getWeather(location)).rejects.toThrow('服务返回的数据无法读取')
  })

  it('rejects incomplete forecast data before rendering', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      current: {}, hourly: {}, daily: {},
    }), { status: 200 })))
    await expect(getWeather(location)).rejects.toThrow('天气数据不完整')
  })
})
