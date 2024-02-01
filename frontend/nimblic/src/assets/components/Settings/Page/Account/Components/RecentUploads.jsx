import React from 'react';


const RecentUploads = ({ userData }) => {

    if(!userData.lastUploads) return

    return (
            <div className="flex flex-col gap-4 w-full md:items-end items-center">
                {userData.lastUploads.length >= 1 ?
                    <div className="overflow-y-scroll max-h-48 w-full md:w-fit mb-6">
                        <table className="table bg-base-300 md:w-72 w-full">
                            <tbody>

                                {userData.lastUploads.map((timestamp, index) => {
                                    // Convert Firestore Timestamp to JavaScript Date object
                                    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);

                                    // Format the date as a string (e.g., 'MM/DD/YYYY HH:mm')
                                    // You can adjust the format as per your requirement
                                    const dateString = date.toLocaleDateString("en-US", {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    });

                                    return (
                                        <tr key={index}>
                                            <th>{index + 1}</th>
                                            <td>{dateString}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    :
                    <div className="w-full md:h-40 h-20 flex text-center md:text-right md:mr-[15%] items-center justify-center">
                        <p className="md:text-xl text-md">No recent uploads</p>
                    </div>
                }
            </div>
    );
};

export default RecentUploads;
