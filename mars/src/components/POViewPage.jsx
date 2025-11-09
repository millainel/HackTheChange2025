import React, { useEffect, useState } from 'react';
import {useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api'
import { usePoliceFeed } from "../hooks/connectToMQTT";

import POViewSidebar from './POViewSidebar';
import POViewMap from './POViewMap';

const POViewPage = () => {
    // const [sidebarOpen, setSidebarOpen] = useState(false);

    // const POViewSidebar = ({ isOpen }) => {
    //     return (
    //         <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
    //             <h1>Sidebar</h1>
    //         </div>
    //     );
    // };

    // NOTE: IMPORTANT! moving viewmap collecting data to viewpage, to use as contexts and props to hand down
    const [center, setCenter] = useState({ lat: 51.0447, lng: -114.0719 });
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
        const dID = Number(msg?.dID);

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            setCenter({ lat, lng });
            setMessages((prev) => [...prev, { lat, lng }]);
        } else {
            console.warn("Ignoring invalid coords:", msg);
        }
    });
    
    if (!isLoaded) return <div>Loading...</div>;
    if (!center)   return <div>Waiting for location data...</div>; // ensure no default fallback

    return (
        <div className="container">
            {/* <div className="sidebar">
                <POViewSidebar />
            </div> */}
            <div className="map">
                <POViewMap

                />
            </div>
            <div className="sidebar">
                <POViewSidebar />
            </div>
        </div>
    );
};

export default POViewPage;
