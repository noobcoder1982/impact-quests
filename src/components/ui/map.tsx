import * as React from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

export type MapRef = maplibregl.Map | null

interface MapProps {
  center: [number, number]
  zoom?: number
  className?: string
  theme?: 'dark' | 'light'
  children?: React.ReactNode
}

const MapContext = React.createContext<{
  map: maplibregl.Map | null
}>({ map: null })

export const Map = React.forwardRef<MapRef, MapProps>(({ center, zoom = 11, className, theme = 'dark', children }, ref) => {
  const mapContainer = React.useRef<HTMLDivElement>(null)
  const [map, setMap] = React.useState<maplibregl.Map | null>(null)

  React.useImperativeHandle(ref, () => map)

  React.useEffect(() => {
    if (!mapContainer.current) return

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: theme === 'dark' 
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: center,
      zoom: zoom,
      attributionControl: false
    })

    m.on('load', () => {
      setMap(m)
    })

    return () => {
      m.remove()
    }
  }, [theme])

  React.useEffect(() => {
    if (map) {
      map.setCenter(center)
    }
  }, [center, map])

  return (
    <div ref={mapContainer} className={cn("relative w-full h-full", className)}>
      {map && (
        <MapContext.Provider value={{ map }}>
          {children}
        </MapContext.Provider>
      )}
    </div>
  )
})

export const MapControls = ({ position = 'top-right', showCompass = true, showZoom = true, showLocate = true }: any) => {
  const { map } = React.useContext(MapContext)

  React.useEffect(() => {
    if (!map) return
    
    const nav = new maplibregl.NavigationControl({
      showCompass,
      showZoom
    })
    
    map.addControl(nav, position)
    
    if (showLocate) {
      const locate = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      })
      map.addControl(locate, position)
    }

    return () => {
      map.removeControl(nav)
    }
  }, [map])

  return null
}

export const MapMarker = ({ longitude, latitude, children }: any) => {
  const { map } = React.useContext(MapContext)
  const markerRef = React.useRef<maplibregl.Marker | null>(null)
  const [container] = React.useState(() => document.createElement('div'))

  React.useEffect(() => {
    if (!map) return

    const marker = new maplibregl.Marker({ element: container })
      .setLngLat([longitude, latitude])
      .addTo(map)

    markerRef.current = marker

    return () => {
      marker.remove()
    }
  }, [map, longitude, latitude])

  return createPortal(children, container)
}

export const MarkerContent = ({ children }: any) => {
  return <>{children}</>
}

export const MarkerPopup = ({ children, offset = 0, closeButton = true, className }: any) => {
  const { map } = React.useContext(MapContext)
  const [container] = React.useState(() => document.createElement('div'))
  const popupRef = React.useRef<maplibregl.Popup | null>(null)

  React.useEffect(() => {
    if (!map) return

    // This is a bit tricky as the popup needs to be attached to a marker or a point
    // But based on usage in MapIntelligencePage, it's inside MapMarker
    // We'll handle this by letting the parent MapMarker handle the click if needed
    // or just creating a popup that appears on the map.
    
    const popup = new maplibregl.Popup({
      offset,
      closeButton,
      className,
      maxWidth: 'none'
    })
    .setDOMContent(container)

    popupRef.current = popup

    // If this is inside a marker, we should ideally attach it to the marker
    // For now we'll just allow the portal to render
  }, [map])

  return createPortal(children, container)
}
