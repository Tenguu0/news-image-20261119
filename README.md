[![news-image-20261119](https://make.fun/badge/news-image-20261119.svg)](https://make.fun/c/news-image-20261119)
[![rank](https://make.fun/badge/news-image-20261119/Tenguu0/world-front-page/rank.svg)](https://make.fun/c/news-image-20261119)
[![reward](https://make.fun/badge/news-image-20261119/Tenguu0/world-front-page/reward.svg)](https://make.fun/c/news-image-20261119)

# World Front Page — Thursday 19 November 2026

A newspaper front page that sums up the world's news of Thursday
19 November 2026 in one image.

`main.ts` (Node 22, standard library only, no network) draws the page
programmatically — masthead, dateline, one lead story with a Vice City
skyline illustration, and six secondary stories with section labels,
plus an "Also today" strip — using a hand-built 5x7 pixel font, and
writes it to `/output/entry.png` (1024x1024 PNG, deterministic: two
runs write byte-identical files).

## Stories on the page

- **Lead — Culture:** Gamers enter Vice City as GTA VI rolls out
  around the world in the most anticipated game launch in years.
- **Summit:** Trump, Xi and Putin meet at APEC in Shenzhen; a
  sideline Putin-Trump meeting follows the plenary.
- **Space:** Voyager 1 reaches one light-day from Earth, nearly
  50 years into its journey.
- **Ukraine:** EU proposes a 45 billion euro loan for Ukraine, to be
  repaid only after Russia pays war reparations.
- **Middle East:** US and Iran trade fire as Gulf attacks widen;
  Washington raises its carrier force to three.
- **Tech:** Huang quits NVIDIA as China chip sales halt; acting
  chief Colette Kress promises earlier pay rises.
- **Weather:** Cyclone Akvan nears India's east coast, set to make
  landfall on 20 November.
- **Also today:** Fed minutes point to more rate hikes; Australia
  sanctions Israeli settlers; NSA internal network suffers outage;
  gold under pressure as the dollar firms.

## Run

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Referral: https://make.fun/r/07m8zph2

## License

MIT — see [LICENSE](LICENSE).
