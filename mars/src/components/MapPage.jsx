import React, { useEffect, useState } from 'react';
import {useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api'
import { usePoliceFeed } from "../hooks/connectToMQTT";

import Base from './Base';

const MapPage = () => {
  const [center, setCenter] = useState();
  const [messages, setMessages] = useState([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  })

  console.log("isLoaded:", isLoaded);

  // once map is loaded, start listening to ESP feed
  usePoliceFeed((msg) => {
    console.log("Button pressed. Data received: ", msg);
    const lat = Number(msg?.lat);
    const lng = Number(msg?.lng ?? msg?.long);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setCenter({ lat, lng });
      setMessages((prev) => [...prev, { lat, lng }]);
    } else {
      console.warn("Ignoring invalid coords:", msg);
    }
  });

  if (!isLoaded) return <div>Loading...</div>;
  if (!center)   return <div>Waiting for location data...</div>; // ensure no default fallback

  // clean up if your hook returns an unsubscribe function
  // return () => {
  //   if (typeof unsubscribe === 'function') {
  //     unsubscribe();
  //   }
  // };

  // useEffect(() => {
  //   if (!isLoaded) return <Base />;

  //   once map is loaded, start listening to ESP feed
  //   usePoliceFeed((msg) => {
  //     console.log("Button pressed. Data received: ", msg);
  //     setMessages((prev) => [...prev, msg]);
  //   });

  // }, []);

  return (
    // TODO: stylize MapPage component
    // TODO: get marker positions from db, maybe json file?, for each, place a marker on location, if hover?, click, see more info, ID, name, time, address, 
    <div style={{height: '100%'}}>
      {/* <h1>maps</h1> */}

      <div style={{height: '100%'}}>
        <GoogleMap 
          center={center} 
          zoom={15} 
          mapContainerStyle={{width: '100%', height: '100%'}} 
          options={{
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
        }}
        >

        {/* <Marker position={center} /> */}

        {messages.map((m, i) => {
          const { lat, lng } = m;
          return <Marker key={i} position={{ lat: lat, lng: lng }} />;
        })}

  
        {/* {messages.map((m, i) => (
          const { lat, lng } = JSON.parse(m);
          <Marker key={i} position={{lat: m.lat, lng: m.lng}} />
        ))} */}
        

        </GoogleMap>
      </div>

    </div>
  );
};

export default MapPage;
