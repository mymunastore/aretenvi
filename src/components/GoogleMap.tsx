import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Phone, Mail, ExternalLink, CircleAlert as AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GoogleMapProps {
  className?: string;
}

type GoogleMap = object;
type GoogleMarker = object;

interface GoogleInfoWindow {
  setContent(content: string): void;
  open(map: GoogleMap, marker: GoogleMarker): void;
}

interface GoogleMapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  mapTypeId: string;
  styles?: GoogleMapTypeStyle[];
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  mapTypeControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
}

interface GoogleMapTypeStyle {
  featureType?: string;
  elementType?: string;
  stylers?: Array<{ [key: string]: string | number }>;
}

interface GoogleMarkerOptions {
  position: { lat: number; lng: number };
  map: GoogleMap;
  title: string;
  icon?: GoogleMarkerIcon;
  animation?: number;
}

interface GoogleMarkerIcon {
  url: string;
  scaledSize: { width: number; height: number };
  origin: { x: number; y: number };
  anchor: { x: number; y: number };
}

interface GoogleInfoWindowOptions {
  content: string;
  maxWidth?: number;
}

declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMap;
        Marker: new (options: GoogleMarkerOptions) => GoogleMarker;
        InfoWindow: new (options?: GoogleInfoWindowOptions) => GoogleInfoWindow;
        Animation: {
          DROP: number;
        };
        Size: new (width: number, height: number) => { width: number; height: number };
        Point: new (x: number, y: number) => { x: number; y: number };
      };
    };
    initMap: () => void;
  }
}

const GoogleMap = ({ className = "" }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Company details
  const companyInfo = {
    name: "ARET Environmental Services",
    address: "No. 576 Oron Road, Uyo, Akwa Ibom State, Nigeria",
    phone: "09152870616",
    email: "info@aret-environmental-ng.com",
    // Coordinates for Uyo, Nigeria (approximate location on Oron Road)
    lat: 5.0378,
    lng: 7.9085
  };

  const initializeMap = useCallback(() => {
    if (!window.google || !mapRef.current) return;

    try {
      // Create map centered on company location
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: companyInfo.lat, lng: companyInfo.lng },
        zoom: 16,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#c9c9c9' }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Create custom marker
      const marker = new window.google.maps.Marker({
        position: { lat: companyInfo.lat, lng: companyInfo.lng },
        map,
        title: companyInfo.name,
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#10b981" stroke="#ffffff" stroke-width="4"/>
              <path d="M20 10C16.686 10 14 12.686 14 16C14 20.5 20 30 20 30S26 20.5 26 16C26 12.686 23.314 10 20 10ZM20 18.5C18.619 18.5 17.5 17.381 17.5 16S18.619 13.5 20 13.5S22.5 14.619 22.5 16S21.381 18.5 20 18.5Z" fill="white"/>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40)
        }
      });

      // Create info window content
      const infoWindowContent = `
        <div style="max-width: 300px; padding: 16px; font-family: 'Inter', sans-serif;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm6 14H8a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h2v1a1 1 0 0 0 2 0V9h2v10a1 1 0 0 1-1 1z"/>
              </svg>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">${companyInfo.name}</h3>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Professional Waste Management</p>
            </div>
          </div>
          
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
              <svg width="16" height="16" fill="#10b981" viewBox="0 0 24 24" style="margin-right: 8px; margin-top: 2px; flex-shrink: 0;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span style="font-size: 14px; color: #374151; line-height: 1.4;">${companyInfo.address}</span>
            </div>
            
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
              <svg width="16" height="16" fill="#10b981" viewBox="0 0 24 24" style="margin-right: 8px;">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <a href="tel:${companyInfo.phone}" style="font-size: 14px; color: #10b981; text-decoration: none; font-weight: 500;">${companyInfo.phone}</a>
            </div>
            
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <svg width="16" height="16" fill="#10b981" viewBox="0 0 24 24" style="margin-right: 8px;">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <a href="mailto:${companyInfo.email}" style="font-size: 14px; color: #10b981; text-decoration: none; font-weight: 500;">${companyInfo.email}</a>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
              <strong>Business Hours:</strong><br>
              Mon-Fri: 9:00 AM - 5:00 PM<br>
              Sat: 10:00 AM - 2:30 PM
            </p>
          </div>
        </div>
      `;

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: infoWindowContent,
        maxWidth: 320
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      // Auto-open info window after a short delay
      setTimeout(() => {
        infoWindow.open(map, marker);
      }, 1000);

      setMapLoaded(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
      setIsLoading(false);
    }
  }, [companyInfo.lat, companyInfo.lng, companyInfo.name, companyInfo.address, companyInfo.phone, companyInfo.email]);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Set up global callback
    window.initMap = initializeMap;

    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      setMapError(true);
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window.initMap;
    };
  }, [initializeMap]);

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyInfo.address)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(companyInfo.address)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (mapError) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-destructive/10 p-4 rounded-full">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Map Unavailable</h3>
              <p className="text-muted-foreground mb-4">
                Unable to load the interactive map. You can still view our location using the links below.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={openInGoogleMaps} variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Google Maps
              </Button>
              <Button onClick={openDirections}>
                <MapPin className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
          
          {/* Map container */}
          <div 
            ref={mapRef} 
            className="w-full h-[400px] md:h-[500px] bg-muted"
            style={{ minHeight: '300px' }}
          />
          
          {/* Map controls overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={openInGoogleMaps}
              className="shadow-lg backdrop-blur-sm bg-background/90 hover:bg-background"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Maps
            </Button>
            <Button
              size="sm"
              onClick={openDirections}
              className="shadow-lg"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Directions
            </Button>
          </div>
        </div>
        
        {/* Company info footer */}
        <div className="p-6 bg-gradient-to-r from-primary/5 to-primary-glow/5 border-t">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1">{companyInfo.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{companyInfo.address}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <a 
                  href={`tel:${companyInfo.phone}`}
                  className="flex items-center text-primary hover:text-primary-glow transition-colors"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  {companyInfo.phone}
                </a>
                <a 
                  href={`mailto:${companyInfo.email}`}
                  className="flex items-center text-primary hover:text-primary-glow transition-colors"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  {companyInfo.email}
                </a>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Business Hours:</p>
              <p>Mon-Fri: 9:00 AM - 5:00 PM</p>
              <p>Sat: 10:00 AM - 2:30 PM</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMap;