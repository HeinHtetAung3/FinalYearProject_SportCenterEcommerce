import {
    useEffect,
    useState
} from 'react';
import apiClient from '../services/apiClient';
import {
    useDebounce
} from './useDebounce';

/**
 * Address autocomplete with Photon (OpenStreetMap), no API key required.
 */
export function useGooglePlacesAutocomplete({
    query,
    active = true
}) {
    const debouncedQuery = useDebounce(query, 300);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!active) {
            setSuggestions([]);
            setIsLoading(false);
            return undefined;
        }

        const q = String(debouncedQuery || '').trim();
        if (q.length < 3) {
            setSuggestions([]);
            setIsLoading(false);
            return undefined;
        }

        const controller = new AbortController();
        setIsLoading(true);

        apiClient.get('/api/geo/autocomplete', {
                params: {
                    q
                },
                signal: controller.signal
            })
            .then((response) => {
                const items = Array.isArray(response.data) ? response.data : [];
                setSuggestions(items);
            })
            .catch((error) => {
                if (!error || error.name !== 'AbortError') {
                    setSuggestions([]);
                }
            })
            .finally(() => setIsLoading(false));

        return () => controller.abort();
    }, [debouncedQuery, active]);

    return {
        suggestions,
        isLoading,
        setSuggestions
    };
}