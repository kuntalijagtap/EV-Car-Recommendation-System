import localVehicleImages from '../data/vehicleImageManifest.json';

const modelPhotoFallbacks = {
  // MG Cloud EV and Windsor EV are the same model marketed under different names.
  // Use the manufacturer-hosted Windsor product photo while no local file exists.
  'mg-cloud-ev': 'https://mgmotor.scene7.com/is/image/mgmotor/001-kmi-pdp-windsor?fit=constrain&fmt=webp-alpha&qlt=80&resMode=bisharp&wid=480',
  'mg-windsor-ev': 'https://mgmotor.scene7.com/is/image/mgmotor/001-kmi-pdp-windsor?fit=constrain&fmt=webp-alpha&qlt=80&resMode=bisharp&wid=480',
  // Mahindra's XUV.e8 concept entered production as the XEV 9S.
  'mahindra-xuv-e8': 'https://auto.mahindra.com/on/demandware.static/-/Sites-amc-Library/default/dw70ae4c63/press-release/meet-the-mahindra-xev-9s-1529x911.jpg',
  // Manufacturer product photo for the XUV400, which is not in the local bundle.
  'mahindra-xuv400': 'https://auto.mahindra.com/dw/image/v2/BKRC_PRD/on/demandware.static/-/Sites-mahindra-product-catalog/default/dwd84e5b9c/images/X400/large/ELPro_GalaxyGrey_602x339.png?sh=160&sw=284',
};

function slug(value) {
  return String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizedBrand(value) {
  const brand = slug(value);
  if (brand.includes('mg')) return 'mg';
  if (brand.includes('tata')) return 'tata';
  if (brand.includes('hyundai')) return 'hyundai';
  if (brand.includes('byd')) return 'byd';
  if (brand.includes('bmw')) return 'bmw';
  if (brand.includes('volvo')) return 'volvo';
  if (brand.includes('volkswagen') || brand === 'vw') return 'volkswagen';
  if (brand.includes('mercedes')) return 'mercedes-benz';
  if (brand.includes('mini')) return 'mini';
  if (brand.includes('mahindra')) return 'mahindra';
  return brand.replace(/-(india|motors|motor|cars|group)$/, '');
}

function resolveLocalImageUrl(url) {
  if (typeof url !== 'string') return null;
  const withoutQuery = url.split(/[?#]/, 1)[0];
  const imageFolderIndex = withoutQuery.toLowerCase().lastIndexOf('/images/evs/');
  if (imageFolderIndex < 0) return null;

  const encodedName = withoutQuery.slice(imageFolderIndex + '/images/evs/'.length).split('/')[0];
  let filename = encodedName;
  try { filename = decodeURIComponent(encodedName); } catch { /* Keep the original filename. */ }
  const extensionIndex = filename.lastIndexOf('.');
  const key = (extensionIndex < 0 ? filename : filename.slice(0, extensionIndex)).toLowerCase();
  const actualFilename = localVehicleImages[key];
  return actualFilename ? `/images/evs/${encodeURIComponent(actualFilename)}` : null;
}

export function getVehicleImage(ev) {
  const url = ev?.imageUrl || ev?.images?.find?.((image) => image?.url)?.url || null;
  const rejectSampleImage = ev?.isSampleData && !ev.imageProvidedByDataset && /images\.unsplash\.com/i.test(url || '');
  if (url && !rejectSampleImage) {
    const localUrl = resolveLocalImageUrl(url);
    if (localUrl) return localUrl;
  }

  const brandName = ev?.brandId?.name || ev?.brand?.name || ev?.brand || ev?.brandName || '';
  const modelName = ev?.name || ev?.model || '';
  const normalizedBrandSlug = normalizedBrand(brandName);
  const fullModelSlug = slug(modelName);
  const brandPrefixes = [slug(brandName), normalizedBrandSlug, slug(brandName).split('-')[0]].filter(Boolean);
  const brandPrefix = brandPrefixes.find((prefix) => fullModelSlug === prefix || fullModelSlug.startsWith(`${prefix}-`));
  let modelSlug = brandPrefix ? fullModelSlug.slice(brandPrefix.length).replace(/^-/, '') : fullModelSlug;
  if (modelSlug === 'ec3') modelSlug = 'e-c3';
  const candidates = [
    `${normalizedBrandSlug}-${modelSlug}`,
    `${normalizedBrandSlug}-${slug(ev?.variant)}`,
    modelSlug,
  ].filter(Boolean);
  const localImage = candidates.map((candidate) => localVehicleImages[candidate]).find(Boolean);
  if (localImage) return `/images/evs/${encodeURIComponent(localImage)}`;
  if (url && !rejectSampleImage && !/\/images\/evs\//i.test(url)) return url;
  return candidates.map((candidate) => modelPhotoFallbacks[candidate]).find(Boolean) || null;
}
