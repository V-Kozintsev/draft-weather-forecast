import React, { useEffect, useRef } from "react";
import * as YMap from "ymaps3";
const Map = ({ longitude, latitude }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    const initMap = async () => {
      if (YMap && YMap.ready) {
        await YMap.ready;

        if (!mapInstance.current) {
          mapInstance.current = new YMap.YMap(mapRef.current, {
            location: {
              center: [longitude, latitude],
              zoom: 10,
            },
          });

          mapInstance.current.addChild(new YMap.YMapDefaultSchemeLayer());
        } else {
          mapInstance.current.setCenter([longitude, latitude]);
        }

        return mapInstance.current;
      } else {
        console.error(
          "YMap.ready is undefined. Check if Yandex Maps API is correctly loaded."
        );
        return null;
      }
    };

    const loadMap = async () => {
      if (longitude && latitude) {
        await initMap();
      }
    };

    loadMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [longitude, latitude]);

  return (
    <div
      id="map"
      className="map"
      ref={mapRef}
      style={{ width: "100%", height: "200px" }}
    ></div>
  );
};

export default Map;
