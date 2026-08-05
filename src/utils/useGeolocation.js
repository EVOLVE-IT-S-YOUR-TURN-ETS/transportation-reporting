import { useState, useEffect } from 'react';

export function useGeolocation() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    coords: null,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState({ loading: false, error: 'unsupported', coords: null });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          error: null,
          coords: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
        });
      },
      (err) => {
        setState({ loading: false, error: err.code, coords: null });
      }
    );
  }, []);

  return state;
}
