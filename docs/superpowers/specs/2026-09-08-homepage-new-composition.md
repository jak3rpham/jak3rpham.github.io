# Homepage: new composition, continuous scroll

Supersedes the restoration iteration. The user rejected restoring the old pinned choreography with only a new background.

Implemented: unpinned full-scene 3D hero reframes while moving; Terra first with layered website/social previews and animated growth chart; product chapter with actual interface tabs and staggered visual projects; cinema widens during viewport entry; artwork pairs a poster with playable motion; portrait/about comes after the work. Clear case-study links throughout. All real project media reused.

Scroll has no artificial hero spacer or settled About scene. The native 3D renderer stops outside the viewport and respects reduced motion. Video starts on interaction. Small-screen layouts use normal document flow.

Validation: scripts/check-homepage.mjs measures continuous Terra movement, hero shrink, hover screenshot movement, interface tabs, film activation, theme transitions, image loading, offscreen rendering and reduced motion at desktop/mobile sizes. Build and existing unit suite also required.
