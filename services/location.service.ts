export interface LocationResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timestamp?: number;
  error?: string;
}

class LocationService {
  /**
   * Get current GPS location
   */
  async getCurrentLocation(): Promise<LocationResult> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          success: false,
          error: "Geolocation is not supported by this browser.",
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            success: true,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          let message = "Unable to get location.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = "Location permission denied.";
              break;

            case error.POSITION_UNAVAILABLE:
              message = "Location unavailable.";
              break;

            case error.TIMEOUT:
              message = "Location request timed out.";
              break;
          }

          resolve({
            success: false,
            error: message,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
      );
    });
  }

  /**
   * Check whether GPS is available
   */
  isSupported(): boolean {
    return typeof navigator !== "undefined" && !!navigator.geolocation;
  }
}

export default new LocationService();
