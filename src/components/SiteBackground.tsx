import { Logo } from "./Logo";

/** Full-page LMS logo watermark used behind every authenticated view. */
export function SiteBackground() {
  return (
    <div className="app-bg" aria-hidden="true">
      <Logo variant="fill" className="app-bg-logo" />
      <div className="app-bg-scrim" />
    </div>
  );
}
