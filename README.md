# Triangular Rain

A generative art piece that builds a Sierpiński gasket stochastically, one raindrop at a time.

**[Live demo →](https://rupertmckay.com/triangular-rain)**

## How it works

Generation starts with a hollow inverted equilateral triangle (base at top, apex at bottom). At each step:

1. A random point is chosen from the union of all horizontal line segments, weighted by length.
2. Two rays fire downward from that point at 60° spread — the base angles of an equilateral triangle.
3. Whichever ray hits an existing line first determines the stopping depth; both rays stop at that same height.
4. The three vertices are joined and the resulting downward-pointing triangle is filled black.

Repeat. Over many iterations the filled triangles converge on the Sierpiński gasket. The animation runs until no remaining gaps are large enough to produce a visible triangle (sub-pixel threshold), at which point the piece is complete.

Click anywhere to restart with a new random sequence.

## Tech

- [Vite](https://vite.dev/) + TypeScript
- HTML Canvas (no runtime dependencies)

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
