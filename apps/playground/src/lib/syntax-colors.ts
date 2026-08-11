/**
 * Syntax colours for code blocks.
 *
 * These are NOT system colours and that is why they are hex.
 *
 * A design token means something in the product: `brand.solid` is a background,
 * `status.danger.fg` is a warning. There is no token that could mean "a keyword
 * in TypeScript". These belong to an editor theme, they do not change with the
 * brand, and no screen outside the documentation uses them. The same reasoning
 * applies to the colours inside `public/cover-*.svg`: content, not tokens.
 *
 * This file is the ONLY place in the playground exempt from the hardcoded
 * colour rule, and it holds nothing else, so nothing can slip in beside them.
 *
 * ---
 *
 * GitHub's themes are not built for WCAG AA. Measured against our code block
 * backgrounds - `surface.sunken` (#EDEBE9) in light, `inkSunken` (#141414) in
 * dark - five of eight token colours failed:
 *
 *   light  comment #6A737D 4.05    keyword #D73A49 3.85
 *          param   #E36209 2.94    tag     #22863A 3.89
 *   dark   comment #6A737D 3.83
 *
 * The replacements keep the hue and move the lightness: darker in light, lighter
 * in dark. Syntax still reads as GitHub.
 *
 * Do NOT swap in a different theme instead. One that happens to pass today has
 * no guarantee for the next token it introduces, and nobody would look here.
 *
 * Keys MUST be lower case - shiki matches them against the theme JSON, where
 * they are lower case. `#6A737D` would match nothing and the rule would
 * silently not apply.
 */
export const SYNTAX_COLOR_REPLACEMENTS: Record<string, Record<string, string>> = {
  /* 4.05 -> 5.60, 3.85 -> 6.19, 2.94 -> 6.52, 3.89 -> 5.54 */
  'github-light': {
    '#6a737d': '#565D66',
    '#d73a49': '#A81B28',
    '#e36209': '#8A3B02',
    '#22863a': '#1A6B2E',
  },
  /* 3.83 -> 5.99 */
  'github-dark': {
    '#6a737d': '#8B949E',
  },
}