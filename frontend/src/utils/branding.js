export const DEFAULT_PRIMARY_COLOR = '#2563EB';
export const DEFAULT_ACCENT_COLOR = '#0F172A';

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6})$/;
const MIN_COLOR_DISTANCE = 72;

export function normalizeHexColor(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toUpperCase();
  return HEX_COLOR_REGEX.test(normalized) ? normalized : fallback;
}

export function hexToRgba(hex, alpha = 1) {
  const normalized = normalizeHexColor(hex, DEFAULT_PRIMARY_COLOR);
  const value = normalized.slice(1);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
}

function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex, DEFAULT_PRIMARY_COLOR);
  const value = normalized.slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHsl(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: lightness };
  }

  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue;
  switch (max) {
    case red:
      hue = (green - blue) / delta + (green < blue ? 6 : 0);
      break;
    case green:
      hue = (blue - red) / delta + 2;
      break;
    default:
      hue = (red - green) / delta + 4;
      break;
  }

  return { h: hue / 6, s: saturation, l: lightness };
}

function colorDistance(colorA, colorB) {
  return Math.sqrt(
    (colorA.r - colorB.r) ** 2 +
    (colorA.g - colorB.g) ** 2 +
    (colorA.b - colorB.b) ** 2
  );
}

function darkenHex(hex, amount = 0.35) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

function pickDistinctColor(candidates, primary) {
  const primaryRgb = hexToRgb(primary);

  const match = candidates.find((candidate) => {
    const distance = colorDistance(candidate, primaryRgb);
    return distance >= MIN_COLOR_DISTANCE;
  });

  return match ? match.hex : darkenHex(primary, 0.42);
}

export async function extractPaletteFromImageSource(source) {
  if (!source) {
    throw new Error('Nenhuma imagem informada para analisar.');
  }

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('Nao foi possivel ler a logo para extrair a paleta.'));
    img.src = source;
  });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    throw new Error('Seu navegador nao conseguiu analisar a imagem.');
  }

  const maxSize = 120;
  const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1);
  canvas.width = Math.max(1, Math.round(image.width * ratio));
  canvas.height = Math.max(1, Math.round(image.height * ratio));

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const buckets = new Map();

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha < 100) continue;

    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const { s, l } = rgbToHsl(r, g, b);

    if (l > 0.96) continue;
    if (l < 0.05) continue;
    if (s < 0.06 && l > 0.85) continue;

    const qr = Math.round(r / 24) * 24;
    const qg = Math.round(g / 24) * 24;
    const qb = Math.round(b / 24) * 24;
    const key = `${qr}-${qg}-${qb}`;
    const current = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };

    current.count += 1;
    current.r += r;
    current.g += g;
    current.b += b;
    buckets.set(key, current);
  }

  const candidates = Array.from(buckets.values())
    .map((bucket) => {
      const r = bucket.r / bucket.count;
      const g = bucket.g / bucket.count;
      const b = bucket.b / bucket.count;
      const hsl = rgbToHsl(r, g, b);
      return {
        r,
        g,
        b,
        count: bucket.count,
        ...hsl,
        hex: rgbToHex(r, g, b),
        score: bucket.count * (0.6 + hsl.s * 1.6) * (1 - Math.abs(hsl.l - 0.52)),
      };
    })
    .sort((left, right) => right.score - left.score);

  if (candidates.length === 0) {
    return {
      primary: DEFAULT_PRIMARY_COLOR,
      accent: DEFAULT_ACCENT_COLOR,
      swatches: [DEFAULT_PRIMARY_COLOR, DEFAULT_ACCENT_COLOR],
    };
  }

  const primaryCandidate =
    candidates.find((candidate) => candidate.s >= 0.18 && candidate.l >= 0.16 && candidate.l <= 0.72) ||
    candidates[0];

  const accentCandidates = [...candidates]
    .filter((candidate) => candidate.hex !== primaryCandidate.hex)
    .sort((left, right) => {
      const leftPriority = left.l < 0.45 ? 1 : 0;
      const rightPriority = right.l < 0.45 ? 1 : 0;
      if (leftPriority !== rightPriority) return rightPriority - leftPriority;
      return right.score - left.score;
    });

  const primary = primaryCandidate.hex;
  const accent = pickDistinctColor(accentCandidates, primary);
  const swatches = [primary, accent]
    .concat(
      candidates
        .map((candidate) => candidate.hex)
        .filter((hex) => hex !== primary && hex !== accent)
        .slice(0, 4)
    );

  return { primary, accent, swatches };
}

export function getContrastTextColor(hex) {
  const normalized = normalizeHexColor(hex, DEFAULT_PRIMARY_COLOR);
  const value = normalized.slice(1);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#0F172A' : '#FFFFFF';
}

export function getBrandingTheme(establishment) {
  const primaryColor = normalizeHexColor(establishment?.primary_color, DEFAULT_PRIMARY_COLOR);
  const accentColor = normalizeHexColor(establishment?.accent_color, DEFAULT_ACCENT_COLOR);

  return {
    primaryColor,
    accentColor,
    primaryTextColor: getContrastTextColor(primaryColor),
    accentTextColor: getContrastTextColor(accentColor),
    softPrimary: hexToRgba(primaryColor, 0.12),
    softAccent: hexToRgba(accentColor, 0.1),
    subtleBorder: hexToRgba(primaryColor, 0.18),
    title: establishment?.booking_heading?.trim() || `Agende com ${establishment?.name || 'seu estabelecimento'}`,
    subtitle:
      establishment?.booking_subheading?.trim() ||
      'Escolha o serviço ideal, o profissional e o melhor horário em poucos passos.',
  };
}
