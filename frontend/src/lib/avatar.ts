/** Teinte stable (1..8) dérivée du nom (hash djb2, identique à la maquette) : même nom, même couleur. */
export function avatarTint(name: string): number {
  let hash = 5381;
  const value = name.trim().toLowerCase();
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 8) + 1;
}

/** Initiales : première lettre des deux premiers mots (titres « Dr », « Mme », « M. » ignorés). */
export function initialsOf(name: string): string {
  return name
    .replace(/^(Dr|Mme|M\.)\s+/, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}
