# Video loading update — 14 October 2026

| Playback | Before | After | Duration | Format |
| --- | --- | --- | --- | --- |
| Film | 76,570,852 bytes | 26,665,955 bytes | 122.816 s | H.264 1280 × 720, original AAC audio |
| Tree | 28,752,299 bytes | 4,945,638 bytes | 7 s | H.264 720 × 1280, no source audio |

- Both MP4 files put their `moov` startup information before the video data.
- All 14 gallery entries and 30 media/download/poster references resolve locally.
- The gallery starts with no video `src` attributes; both players use
  `preload="none"`. Small posters provide the initial preview.
- In the embedded browser, Film decoded and played, and Tree completed its
  seven-second clip. Starting Tree paused Film.
- The 390 × 844 viewport had no horizontal overflow; Tree played inline and its
  controls fitted the page. Physical phones were not tested.
- No browser errors or warnings were recorded in the checked interactions.
- The gallery refresh preserves video posters and dimensions, produces no
  duplicate entries, and keeps content versions in playback URLs.
- The preparation helper skips recompressing an already optimized Film copy
  when the full-quality master is absent.

Original source videos remain in the primary local checkout. Tree's original
download is retained. The local Film master remains excluded from Git.
