import { useEffect } from 'react'

import { useSite } from './site'

/** Sets the document title, always suffixed with the studio's brand. */
export function useTitle(title?: string) {
  const { site } = useSite()
  useEffect(() => {
    document.title = title ? `${title} · ${site.brand}` : `${site.brand} · ${site.tagline}`
  }, [title, site.brand, site.tagline])
}
