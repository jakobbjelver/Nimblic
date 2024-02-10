import React from 'react';

const RecentUploads = ({ userData }) => {
    if(!userData.lastUploads) return null; // Return null to render nothing if there are no uploads

    // Sort last uploads by most recent date
    const sortedUploads = userData.lastUploads.sort((a, b) => {
        // Assuming 'a' and 'b' are objects with 'seconds' (and optionally 'nanoseconds')
        const dateA = new Date(a.seconds * 1000 + (a.nanoseconds || 0) / 1000000);
        const dateB = new Date(b.seconds * 1000 + (b.nanoseconds || 0) / 1000000);

        return dateB - dateA; // Sort in descending order (most recent first)
    });

    return (
        <div className="flex flex-col gap-4 w-full md:items-end items-center">
            {sortedUploads.length >= 1 ?
                <div className="overflow-y-scroll max-h-48 w-full md:w-fit mb-6">
                    <table className="table bg-base-300 md:w-72 w-full">
                        <tbody>
                            {sortedUploads.map((timestamp, index) => {
                                const date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
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
