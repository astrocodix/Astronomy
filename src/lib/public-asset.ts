/** Prefix public assets when the static edition is hosted under a GitHub Pages project path. */
export function publicAsset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path.startsWith('/') ? path : `/${path}`}`;
}
