import React from 'react';
import POViewSidebar from './POViewSidebar';
import POViewMap from './POViewMap';

const POViewPage = () => {
    return (
        <div style={{
            display: 'flex',
            // flexDirection: ''
        }}>
            <POViewSidebar />
            <POViewMap />
        </div>
    );
}

export default POViewPage;
