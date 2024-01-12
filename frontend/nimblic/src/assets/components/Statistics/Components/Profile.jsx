// SummaryDataProfile.jsx
import React from 'react';
import { truncateLabel } from 'src/utils/textFormat'; 


const Profile = ({ profileData }) => {

    if(!profileData) {
        return
    }

    return (
        <div className="card w-max shadow-sm p-4 bg-base-300">
        <h2 className="card-title mb-4">Profile</h2>
        <table className="table table-sm w-56 h-72">
          <tbody>
            {Object.entries(profileData)?.map(([key, value], index) => (
              value !== 'None' && renderValue(value) ?
                <tr key={index} className="border-b border-base-100">
                  <td><strong>{key}</strong></td>
                  <td>{renderValue(value)}</td>
                </tr>
                : ''
            ))}
          </tbody>
        </table>
      </div>
    );
};

const renderValue = (value) => {
    if (typeof value === 'number' && value) {
        return truncateLabel(value.toFixed(2).toString(), 10)
    } else if (typeof value === 'object' && value !== null) {
        // Join the object's values into a comma-separated list
        return Object.values(value).join(', ');
    } else {
        return value ? truncateLabel(value.toString(), 20) : '0';
    }
};

export default Profile;
