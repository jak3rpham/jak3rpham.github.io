# Homepage correction after design review

The simplified Workbench homepage was rejected because it removed intentional interactions and project evidence. The original homepage is now the implementation base.

Restored: shrinking portrait container, light/dark chapters, Terra graph and hover-scrolling website preview, systems SVGs, Nha Minh interactive simulation, horizontal product gallery, film posters/stills and inline playback, video gallery, and original navigation.

Changed: Terra appears before Systems and the other projects; the hero uses full-viewport procedural 3D geometry instead of frame sequences; primary project CTAs are explicit and larger; homepage type uses a shared readable scale; mobile and reduced-motion layouts place About below the hero to avoid overlapping pinned columns. Positioning describes strategy, AI direction and creative work rather than deep engineering expertise.

Verification: production build passed; desktop (1440x900) and mobile (390x900) browser checks passed with 18 project images, zero frame-sequence requests, and no horizontal overflow or runtime errors. Desktop checks confirmed clip-path changes while scrolling, four visual chapters, hover preview translation, horizontal project movement and inline film opening. Product preview OCR tab and reduced-motion static layout also passed. Existing unit suite: 23 passed. Browser checks are functional observations, not a measured FPS improvement.

Local production preview: http://127.0.0.1:4322. No publishing was performed.
