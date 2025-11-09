import React, { useEffect, useState } from 'react';
import {useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api'
import { usePoliceFeed } from "../hooks/connectToMQTT";

import Base from './Base';

const POViewMap = ({ center, message }) => {
  const { lat, lng, dID } = message || {};

  useEffect(() => {
  if (Marker.current && lat && lng) {
    Marker.current.panTo({ lat, lng }); // see if this works
  }
}, [lat, lng]);


  // const [center, setCenter] = useState({ lat: 51.0447, lng: -114.0719 });
  // const [messages, setMessages] = useState([]);

  // const { isLoaded } = useJsApiLoader({
  //   googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  // })

  // console.log("isLoaded:", isLoaded);

  // // once map is loaded, start listening to ESP feed
  // usePoliceFeed((msg) => {
  //   console.log("Button pressed. Data received: ", msg);
  //   const lat = Number(msg?.lat);
  //   const lng = Number(msg?.lng ?? msg?.long);

  //   if (Number.isFinite(lat) && Number.isFinite(lng)) {
  //     setCenter({ lat, lng });
  //     setMessages((prev) => [...prev, { lat, lng }]);
  //   } else {
  //     console.warn("Ignoring invalid coords:", msg);
  //   }
  // });

  // if (!isLoaded) return <div>Loading...</div>;
  // if (!center)   return <div>Waiting for location data...</div>; // ensure no default fallback

  return (
    // TODO: stylize POViewMap component
    // TODO: get marker positions from db, maybe json file?, for each, place a marker on location, if hover?, click, see more info, ID, name, time, address, 
    <div style={{width: '100%', height: '100vh'}}>
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
            fullscreenControl: false,
            scrollwheel: false
        }}
        >

        {/* <Marker position={center} /> */}

        {/* {messages.map((m, i) => {
          const { lat, lng } = m;
          return <Marker key={i} position={{ lat: lat, lng: lng }} />;
        })} */}

        {/* return <Marker key={i} position={{ lat: lat, lng: lng }} />; */}

          {lat && lng && (
            <Marker
              key={`${message.dID ?? 'default'}`}
              position={{ lat, lng }}
            />
          )}

        </GoogleMap>
      </div>

    </div>
  );
};

export default POViewMap;
