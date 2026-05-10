import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { createPortal } from 'react-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */
const MapContext = createContext(null);

const useMapContext = () => {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('Map child components must be used inside <Map>');
  return ctx;
};

/* ------------------------------------------------------------------ */
/*  Default dark style (free Carto basemap)                            */
/* ------------------------------------------------------------------ */
const DEFAULT_STYLE =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

/* ------------------------------------------------------------------ */
/*  <Map>                                                              */
/* ------------------------------------------------------------------ */
const Map = forwardRef(function Map(
  {
    center = [0, 0],
    zoom = 2,
    styles,
    viewport,
    onViewportChange,
    children,
    style,
    ...rest
  },
  ref
) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);

  const tileStyle = styles?.dark ?? DEFAULT_STYLE;

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: tileStyle,
      center: viewport?.center ?? center,
      zoom: viewport?.zoom ?? zoom,
      bearing: viewport?.bearing ?? 0,
      pitch: viewport?.pitch ?? 0,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => setReady(true));

    if (onViewportChange) {
      const sync = () => {
        const c = map.getCenter();
        onViewportChange({
          center: [c.lng, c.lat],
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        });
      };
      map.on('moveend', sync);
    }

    return () => {
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tileStyle]);

  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
    flyTo: (opts) => mapRef.current?.flyTo(opts),
    easeTo: (opts) => mapRef.current?.easeTo(opts),
    setCenter: (c) => mapRef.current?.setCenter(c),
    setZoom: (z) => mapRef.current?.setZoom(z),
  }));

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: 'inherit',
        overflow: 'hidden',
        ...style,
      }}
    >
      {ready && (
        <MapContext.Provider value={{ map: mapRef.current }}>
          {children}
        </MapContext.Provider>
      )}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  <MapControls>                                                      */
/* ------------------------------------------------------------------ */
function MapControls({ position = 'top-right', showCompass = true }) {
  const { map } = useMapContext();
  const added = useRef(false);

  useEffect(() => {
    if (!map || added.current) return;
    added.current = true;
    map.addControl(
      new maplibregl.NavigationControl({ showCompass }),
      position
    );
  }, [map, position, showCompass]);

  return null;
}

/* ------------------------------------------------------------------ */
/*  <MapMarker>                                                        */
/* ------------------------------------------------------------------ */
function MapMarker({
  longitude,
  latitude,
  draggable = false,
  onDrag,
  children,
}) {
  const { map } = useMapContext();
  const [markerEl, setMarkerEl] = useState(null);
  const [popupEl, setPopupEl] = useState(null);
  const [tooltipEl, setTooltipEl] = useState(null);
  const markerRef = useRef(null);

  // Separate child types
  let contentChild = null;
  let popupChild = null;
  let tooltipChild = null;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === MarkerContent) contentChild = child;
    else if (child.type === MarkerPopup) popupChild = child;
    else if (child.type === MarkerTooltip) tooltipChild = child;
  });

  // Create marker
  useEffect(() => {
    if (!map) return;

    const el = document.createElement('div');
    el.style.cursor = 'pointer';

    const marker = new maplibregl.Marker({ element: el, draggable })
      .setLngLat([longitude, latitude])
      .addTo(map);

    markerRef.current = marker;
    setMarkerEl(el);

    if (draggable && onDrag) {
      marker.on('drag', () => onDrag(marker.getLngLat()));
    }

    return () => {
      marker.remove();
      markerRef.current = null;
      setMarkerEl(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Sync position
  useEffect(() => {
    markerRef.current?.setLngLat([longitude, latitude]);
  }, [longitude, latitude]);

  // Setup popup
  useEffect(() => {
    if (!markerRef.current || !popupChild) return;

    const container = document.createElement('div');
    container.className = 'mapcn-popup-inner';

    const popup = new maplibregl.Popup({
      offset: 25,
      closeButton: true,
      className: 'mapcn-popup',
      maxWidth: '280px',
    }).setDOMContent(container);

    markerRef.current.setPopup(popup);
    setPopupEl(container);

    return () => {
      popup.remove();
      setPopupEl(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, !!popupChild]);

  // Setup tooltip
  useEffect(() => {
    if (!markerEl || !tooltipChild) return;

    const tip = document.createElement('div');
    Object.assign(tip.style, {
      position: 'absolute',
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.85)',
      color: '#fff',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '0.75rem',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.2s',
      zIndex: '10',
    });

    markerEl.appendChild(tip);

    const show = () => { tip.style.opacity = '1'; };
    const hide = () => { tip.style.opacity = '0'; };
    markerEl.addEventListener('mouseenter', show);
    markerEl.addEventListener('mouseleave', hide);

    setTooltipEl(tip);

    return () => {
      markerEl.removeEventListener('mouseenter', show);
      markerEl.removeEventListener('mouseleave', hide);
      tip.remove();
      setTooltipEl(null);
    };
  }, [markerEl, !!tooltipChild]);

  return (
    <>
      {markerEl && contentChild && createPortal(contentChild.props.children, markerEl)}
      {tooltipEl && tooltipChild && createPortal(tooltipChild.props.children, tooltipEl)}
      {popupEl && popupChild && createPortal(popupChild.props.children, popupEl)}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Slot components                                                    */
/* ------------------------------------------------------------------ */
function MarkerContent({ children }) {
  return children;
}

function MarkerPopup({ children }) {
  return children;
}

function MarkerTooltip({ children }) {
  return children;
}

function MarkerLabel({ children, position = 'bottom' }) {
  const posStyle = position === 'top'
    ? { bottom: 'calc(100% + 4px)' }
    : { top: 'calc(100% + 4px)' };

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.7rem',
        color: '#fff',
        background: 'rgba(0,0,0,0.7)',
        padding: '2px 6px',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
        ...posStyle,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */
export {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  MarkerLabel,
};
