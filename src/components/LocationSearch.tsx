import { useEffect, useId, useRef, useState } from 'react'
import { LocateFixed, MapPin, Search, X } from 'lucide-react'
import { searchLocations } from '../api/weather'
import type { Location } from '../types'

type Props = {
  onSelect: (location: Location) => void
  onLocate: () => void
  locating: boolean
}

export function LocationSearch({ onSelect, onLocate, locating }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Location[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [active, setActive] = useState(0)
  const listId = useId()
  const searchVersion = useRef(0)

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const matches = await searchLocations(term, controller.signal)
        if (!controller.signal.aborted) {
          setResults(matches)
          setActive(0)
        }
      } catch (caught) {
        if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : '地点搜索失败，请重试。')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 320)
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [query])

  function choose(location: Location) {
    searchVersion.current += 1
    onSelect(location)
    setQuery('')
    setResults([])
    setOpen(false)
    setError('')
  }

  async function submit() {
    const term = query.trim()
    if (term.length < 2) {
      setError('请输入至少 2 个字，或使用当前位置。')
      setOpen(true)
      return
    }
    if (results.length) {
      choose(results[active] ?? results[0])
      return
    }
    setLoading(true)
    setOpen(true)
    setError('')
    const version = searchVersion.current
    try {
      const matches = await searchLocations(term)
      if (version !== searchVersion.current) return
      if (matches.length) choose(matches[0])
      else setResults([])
    } catch (caught) {
      if (version === searchVersion.current) setError(caught instanceof Error ? caught.message : '地点搜索失败，请重试。')
    } finally {
      if (version === searchVersion.current) setLoading(false)
    }
  }

  return (
    <div className="search-area" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
      <div className="search-box" role="search">
        <Search size={20} aria-hidden="true" />
        <input
          aria-label="搜索城市或地区"
          aria-autocomplete="list"
          aria-controls={open ? listId : undefined}
          aria-expanded={open && query.trim().length >= 2}
          aria-activedescendant={open && results[active] ? `${listId}-option-${results[active].id}` : undefined}
          role="combobox"
          autoComplete="off"
          placeholder="搜索城市或地区"
          value={query}
          onChange={(event) => {
            searchVersion.current += 1
            setQuery(event.target.value)
            setResults([])
            setError('')
            setOpen(true)
          }}
          onFocus={() => { if (query.trim().length >= 2) setOpen(true) }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' && results.length) {
              event.preventDefault(); setActive((index) => (index + 1) % results.length)
            } else if (event.key === 'ArrowUp' && results.length) {
              event.preventDefault(); setActive((index) => (index - 1 + results.length) % results.length)
            } else if (event.key === 'Enter') {
              event.preventDefault(); void submit()
            } else if (event.key === 'Escape') setOpen(false)
          }}
        />
        {query && <button className="clear-search" type="button" aria-label="清除搜索" onClick={() => { searchVersion.current += 1; setQuery(''); setResults([]); setOpen(false); setError('') }}><X size={17} /></button>}
        <button className="search-submit" type="button" onClick={() => void submit()} aria-label="搜索地点">搜索</button>
      </div>
      <button className="locate-button" type="button" onClick={onLocate} disabled={locating} title="使用当前位置">
        <LocateFixed size={19} aria-hidden="true" /> <span>{locating ? '定位中' : '定位'}</span>
      </button>
      {open && query.trim().length >= 2 && (
        <div className="search-popover" id={listId} role="listbox" aria-label="地点搜索结果">
          {loading && <p className="search-message">正在搜索地点…</p>}
          {!loading && error && <p className="search-message error-text" role="alert">{error}</p>}
          {!loading && !error && results.length === 0 && <p className="search-message">没有找到匹配地点，试试城市全名或英文名。</p>}
          {!loading && results.map((location, index) => (
            <button
              key={location.id}
              id={`${listId}-option-${location.id}`}
              type="button"
              role="option"
              aria-selected={active === index}
              className={`search-result ${active === index ? 'active' : ''}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(location)}
            >
              <MapPin size={17} aria-hidden="true" />
              <span><strong>{location.name}</strong><small>{[location.admin1, location.country].filter(Boolean).join(' · ')}</small></span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
