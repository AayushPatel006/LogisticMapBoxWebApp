'use client';
import React, { useEffect, useRef } from 'react'
import { useState } from 'react';
import mapboxgl from '!mapbox-gl';
import { useSearchParams } from 'next/navigation';

const Dashboard = () => {

    mapboxgl.accessToken = process.env.ACCESS_TOKEN;
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(0);
    const [lat, setLat] = useState(0);
    const [zoom, setZoom] = useState(13);
    const searchParams = useSearchParams()

    let i = 0;
    let steps = [];
    while(searchParams.get('step'+i+'_long')) {
        steps.push([searchParams.get('step'+i+'_long'), searchParams.get('step'+i+'_lat')])
        i++;
        console.log(i);
    }
    console.log("steps",steps.length)

    useEffect(() => {
        if (map.current) return; // initialize map only once
            map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [steps[0][0],steps[0][1]],
            zoom: zoom    
        });

        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
        });

          async function setRoute(source, destination, color, id, point) {
            console.log(source, destination)
            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${source[0]},${source[1]};${destination[0]},${destination[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
                { method: 'GET' }
              );
              console.log(id,source[0], destination[0])
              console.log(id,source[1], destination[1])
              const json = await query.json();
              const data = json.routes[0];
              const route = data.geometry.coordinates;
              console.log(route)
              const geojson = {
                      type: 'Feature',
                      properties: {},
                      geometry: {
                        type: 'LineString',
                        coordinates: route
                }
            }
            // Create a new marker.
            const marker1 = new mapboxgl.Marker({ color: color})
              .setLngLat(source)
              .setPopup(new mapboxgl.Popup().setHTML("<h4>"+point+"</h4>"))
              .addTo(map.current);
              marker1.togglePopup();
            
            map.current.addLayer({
                id: id,
                type: 'line',
                source: {
                  type: 'geojson',
                  data: geojson
                },
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': color,
                  'line-width': 3,
                  'line-opacity': 0.75
                }
            });
          }
          setRoute(steps[0], steps[1], "#ff0000", "route1","start");
          for(let i = 2; i <= steps.length-1; i++) {
            setRoute(steps[i-1], steps[i], "#0000ff", "route"+(i),"stop "+(i-1));
          }
          
          const marker1 = new mapboxgl.Marker({ color: 'black'})
              .setLngLat(steps[steps.length-1])
              .setPopup(new mapboxgl.Popup().setHTML("<h4>destination</h4>"))
              .addTo(map.current);
              marker1.togglePopup();

    });

    // this is where the code for the next step will go
  return (
    <>
    <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
    </div>
    <div ref={mapContainer} className="map-container" />
    </>
  )
  
}

export default Dashboard