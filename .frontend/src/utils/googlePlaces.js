const PHOTON_URL = 'https://photon.komoot.io/api/';

function toAddressSuggestion(feature, index) {
    const props = (feature && feature.properties) || {};
    const addressLine = [props.housenumber, props.street].filter(Boolean).join(' ').trim() || props.name || '';
    const city = props.city || props.town || props.village || props.county || '';
    const postalCode = props.postcode || '';
    const country = props.country || '';
    const osmId = props.osm_id || 'addr';

    const labelParts = [addressLine || props.name, city, props.state, postalCode, country].filter(Boolean);

    return {
        id: `${osmId}-${index}`,
        label: labelParts.join(', '),
        addressLine,
        city,
        postalCode,
        country
    };
}

/**
 * Fetches address suggestions from Photon (OpenStreetMap).
 * No API key required.
 */
export async function fetchPhotonSuggestions(query, signal) {
    const q = String(query || '').trim();
    if (!q || q.length < 3) return [];

    const params = new URLSearchParams({
        q,
        limit: '6',
        lang: 'en'
    });

    const response = await fetch(`${PHOTON_URL}?${params.toString()}`, {
        signal
    });
    if (!response.ok) {
        throw new Error(`Photon request failed (${response.status}).`);
    }

    const data = await response.json();
    const features = data && Array.isArray(data.features) ? data.features : [];
    return features.map(toAddressSuggestion).filter((item) => item.addressLine || item.city || item.country);
}