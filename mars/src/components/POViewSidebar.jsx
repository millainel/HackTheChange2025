import React from 'react';

const POViewSidebar = ({ dData }) => {
    // takes in dData for backend gets
    
    // return (
    //     <h1>sidebar</h1>
    // );

    if (!dData?.person) return <p>No data available</p>;

    const person = dData.person;

    return (
        <div className="sidebar-container">
        <h3>Person Details</h3>
        <ul className="person-list">
            {Object.entries(person).map(([key, value]) => (
            <li key={key}>
                <strong>{key}:</strong> {value ?? '—'}
            </li>
            ))}
        </ul>
        </div>
    );
}

export default POViewSidebar;

// person = {
//         "person_id": fetched_row[0],
//         "fname": fetched_row[1],
//         "lname": fetched_row[2],
//         "gender": fetched_row[3],
//         "birth_date": fetched_row[4],
//         "email": fetched_row[5],
//         "address": fetched_row[6],
//         "phone": fetched_row[7],
//         "username": fetched_row[8],
//         "password": fetched_row[9],
//         "emergency_contact_name": fetched_row[10],
//         "emergency_contact_phone": fetched_row[11],
//         "blood_type": fetched_row[12],
//         "medical_note": fetched_row[13],
//         "allergy_note": fetched_row[14],
//         "device_id": fetched_row[15]
//     }
