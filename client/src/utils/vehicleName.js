export function cleanVehicleText(value) {
  return String(value ?? '')
    .replace(/&nbsp;|&amp;nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#(?:x([\da-f]+)|(\d+));/gi, (entity, hex, decimal) => {
      const codePoint = hex ? Number.parseInt(hex, 16) : Number(decimal);
      if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return entity;
      if ([0x20, 0xa0, 0x2007, 0x202f].includes(codePoint)) return ' ';
      try { return String.fromCodePoint(codePoint); } catch { return entity; }
    })
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

export function displayBrandName(value) {
  return cleanVehicleText(value).replace(/\s+(?:motors?|electric|india|cars|group)$/i, '').trim();
}

export function displayModelName(name, brand) {
  const model = cleanVehicleText(name);
  const make = displayBrandName(brand);
  if (make && model.toLowerCase().startsWith(`${make.toLowerCase()} `)) {
    return model.slice(make.length).trim();
  }
  return model;
}

export function displayModelAndVariant(name, brand, variant) {
  const model = displayModelName(name, brand);
  const trim = cleanVehicleText(variant);
  if (!trim || model.toLowerCase().endsWith(` ${trim.toLowerCase()}`)) return model;
  return [model, trim].filter(Boolean).join(' ');
}
