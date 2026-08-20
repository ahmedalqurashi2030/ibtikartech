from pathlib import Path
import re

css_path = Path('assets/css/ibtikar-shell.css')
css = css_path.read_text(encoding='utf-8')
start_marker = '/* === APPROVED VISUAL RECOVERY 2026-08-20 ==='

# Recovery is intentionally a single final layer. Remove any earlier temporary
# copies produced during the audit, then append one canonical block.
marker_index = css.find(start_marker)
if marker_index != -1:
    css = css[:marker_index].rstrip() + '\n'

recovery = r'''

/* === APPROVED VISUAL RECOVERY 2026-08-20 ===
   Restores the approved flat/clean shell without reverting newer content,
   accessibility, service cleanup, or responsive behavior. */

.ibt-shell-header,
.header.ibt-shell-header,
.site-header.ibt-shell-header {
  top: 0;
  padding-inline: 0;
  background: color-mix(in srgb, var(--ibt-bg) 86%, transparent) !important;
  border: 0 !important;
  box-shadow: none !important;
  backdrop-filter: blur(18px) saturate(1.2);
}

.ibt-shell-nav,
.nav.ibt-shell-nav,
.nav-shell.ibt-shell-nav,
html[data-theme="dark"] .ibt-shell-nav {
  width: min(calc(100% - 40px), var(--ibt-container));
  height: var(--ibt-header-h);
  margin-inline: auto;
  padding-inline: 0;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
}

.ibt-shell-header.scrolled .ibt-shell-nav,
.ibt-shell-header.is-scrolled .ibt-shell-nav {
  transform: none;
  border-color: transparent !important;
  box-shadow: none !important;
}

.ibt-shell-desktop-nav,
.desktop-nav.ibt-shell-desktop-nav,
.nav-links.ibt-shell-desktop-nav {
  padding: 0;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.ibt-shell-nav-link,
.ibt-shell-desktop-nav > a {
  min-height: 42px;
  border-radius: 10px;
}

.ibt-shell-menu-toggle,
.menu-toggle.ibt-shell-menu-toggle,
.menu-btn.ibt-shell-menu-toggle {
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.ibt-shell-menu-toggle span,
.menu-toggle.ibt-shell-menu-toggle span,
.menu-btn.ibt-shell-menu-toggle span {
  display: none !important;
}

.ibt-shell-menu-toggle::before,
.menu-toggle.ibt-shell-menu-toggle::before,
.menu-btn.ibt-shell-menu-toggle::before {
  content: "";
  width: 20px;
  height: 20px;
  display: block;
  background:
    radial-gradient(circle at 5px 5px, currentColor 0 2.2px, transparent 2.4px),
    radial-gradient(circle at 15px 5px, currentColor 0 2.2px, transparent 2.4px),
    radial-gradient(circle at 5px 15px, currentColor 0 2.2px, transparent 2.4px),
    radial-gradient(circle at 15px 15px, currentColor 0 2.2px, transparent 2.4px);
}

body.source-home #home.hero {
  scroll-margin-top: var(--ibt-header-h);
}

body.source-home .cinematic-story__brand {
  display: none !important;
}

@media (max-width: 760px) {
  .ibt-shell-header { top: 0; padding-inline: 0; }
  .ibt-shell-nav { width: min(calc(100% - 28px), var(--ibt-container)); }
}
'''
css_path.write_text(css + recovery, encoding='utf-8')

# Remove the active Journey brand markup itself. Reference/artifact files remain
# untouched so historical source material is preserved.
index_path = Path('index.html')
index = index_path.read_text(encoding='utf-8')
index = re.sub(
    r'\s*<div class="cinematic-story__brand"><span aria-hidden="true" class="cinematic-story__mark"><i></i><i></i><i></i></span><span>منظومة ابتكار تك</span></div>',
    '',
    index,
    count=1,
)
index_path.write_text(index, encoding='utf-8')
