import { Action, Container, Label } from '../components/ui'
import { useTitle } from '../lib/title'

export function NotFound() {
  useTitle('Page not found')
  return (
    <Container className="flex min-h-[76svh] flex-col justify-center py-32">
      <Label className="text-brick">404</Label>
      <h1 className="display mt-5 max-w-[20ch] text-[clamp(2.6rem,7.5vw,5.6rem)] leading-[0.94]">
        This page is out of <em className="italic text-brick">frame.</em>
      </h1>
      <p className="mt-6 max-w-[42ch] text-[15px] leading-[1.75] text-muted">
        The link may be old, or the wedding may have been renamed. The photographs are still where they were.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Action to="/work" arrow>
          See the work
        </Action>
        <Action to="/" variant="outline">
          Back home
        </Action>
      </div>
    </Container>
  )
}
