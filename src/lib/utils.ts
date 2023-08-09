export function capitalize(str: string | null) {
  if (str) return str.charAt(0).toUpperCase() + str.slice(1);
  return '';
}

export function stringifyEnum(str: string | null) {
  if (str) {
    const parts = str.split('_');

    for (let i = 0; i < parts.length; i++) {
      parts[i] = capitalize(parts[i].toLowerCase());
    }

    return parts.join(' ');
  }
  return '';
}
