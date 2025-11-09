import React, { useEffect, useState } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api'
import Base from './Base';

const MapPage = () => {
  const [center, setCenter] = useState({ lat: 51.0447, lng: -114.0719 });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  })

  console.log("isLoaded:", isLoaded);

  if (!isLoaded) {
    return <Base />
  }

  return (
    <div>
      {/* <h1>maps</h1> */}

      <div style={{width: '100%'}}>
        <GoogleMap 
        center={center} 
        zoom={15} 
        mapContainerStyle={{width: '100%', height: '100%'}}
        >

        </GoogleMap>
      </div>

    </div>
  );
};

export default MapPage;
