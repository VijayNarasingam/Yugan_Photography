import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { defaultSite, type Site } from '../content'
import { api } from './api'

type SiteContextValue = {
  site: Site
  loading: boolean
  offline: boolean
  admin: boolean
  refresh: () => Promise<void>
  login: (passcode: string) => Promise<void>
  logout: () => Promise<void>
  save: (next: Site) => Promise<void>
  upload: (file: File) => Promise<string>
  reset: () => Promise<void>
}

const SiteContext = createContext<SiteContextValue | null>(null)

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<Site>(defaultSite)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [admin, setAdmin] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const { site: next } = await api.site()
      setSite(next)
      setOffline(false)
    } catch {
      setSite(defaultSite)
      setOffline(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    api
      .session()
      .then((s) => setAdmin(s.admin))
      .catch(() => setAdmin(false))
  }, [refresh])

  const login = useCallback(async (passcode: string) => {
    await api.login(passcode)
    setAdmin(true)
  }, [])

  const logout = useCallback(async () => {
    await api.logout().catch(() => null)
    setAdmin(false)
  }, [])

  const save = useCallback(async (next: Site) => {
    const { site: saved } = await api.saveSite(next)
    setSite(saved)
  }, [])

  const reset = useCallback(async () => {
    const { site: fresh } = await api.resetSite()
    setSite(fresh)
  }, [])

  const upload = useCallback((file: File) => api.upload(file), [])

  const value = useMemo(
    () => ({ site, loading, offline, admin, refresh, login, logout, save, upload, reset }),
    [site, loading, offline, admin, refresh, login, logout, save, upload, reset],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSite must be used inside SiteProvider')
  return ctx
}
