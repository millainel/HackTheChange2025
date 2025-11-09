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
    // const [center, setCenter] = useState(); // NOTE: remove default value of schulich, center for message for marker coords
    // const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState({ dID: "mars123" }); // NOTE: hard coded initial value of dID
    const [dData, setDData] = useState();
    
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    })
    
    console.log("isLoaded:", isLoaded);

    useEffect(() => {
        if (!message?.dID) return;

        const fetchData = async () => {
            try {
            // const response = await fetch(`/api/data/${message.dID}`);
            const backendEndpoint = 'http://localhost:5001/POViewPage';
            const response = await fetch(backendEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ device_id: message.dID }),
            });
            const data = await response.json();
            console.log("Fetched data:", data);
            setDData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [message]);
    
    // once map is loaded, start listening to ESP feed
    usePoliceFeed((msg) => {
        console.log("Button pressed. Data received: ", msg);
        const lat = Number(msg?.lat);
        const lng = Number(msg?.lng ?? msg?.long);
        const dID = Number(msg?.dID); // added dID

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            setCenter({ lat, lng });
            // setMessages((prev) => [...prev, { lat, lng }]);
            setMessage((prev) => ({ lat, lng, dID })); // remove array of info, override with one at a time
        } else {
            console.warn("Ignoring invalid coords:", msg);
        }
    });
    
    console.log("message: ", message);

    if (!isLoaded) return <div>Map loading...</div>;
    if (!center)   return <div>Waiting for location data...</div>; // ensure no default fallback

    return (
        <div className="container">
            {/* <div className="sidebar">
                <POViewSidebar />
            </div> */}
            <div className="map">
                <POViewMap
                    center={center}
                    message={message}
                />
            </div>
            <div className="sidebar">
                <POViewSidebar
                    dID={message.dID}
                />
            </div>
        </div>
    );
};

export default POViewPage;
