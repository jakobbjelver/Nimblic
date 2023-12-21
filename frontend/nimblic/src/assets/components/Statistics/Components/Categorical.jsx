import React from 'react';
import { truncateLabel } from 'src/utils/textFormat';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons';

const Categorical = ({ categoricalData, isLoading }) => {

    if (isLoading || !categoricalData) return null;

    const { "Contingency Table": ContingencyTable, Frequency, "Similar Categories": SimilarCategories } = categoricalData;

    const mostSimilarPair = SimilarCategories.reduce((highest, current) => {
        return (highest[2] > current[2]) ? highest : current;
    }, ["", "", 0]); // Initial value


    return (
        <div className="card h-fit w-fit max-w-3xl p-4 px-10 shadow-sm bg-base-300 fadeInUp">
            <h2 className="card-title mb-4">Categorical Analysis</h2>
            <div className="flex flex-col gap-0">
                <div className="flex flex-row gap-3 items-center justify-evenly">
                    <p className="font-bold text-xs w-fit">
                        MOST SIMILAR CATEGORIES:
                    </p>
                    <p>
                        {SimilarCategories.length > 0 ?
                            <>
                                '{mostSimilarPair[0]}' <FontAwesomeIcon icon={faArrowsLeftRight} /> '{mostSimilarPair[1]}'
                            </>
                            :
                            <p className="text-lg font-light">None</p>
                        }
                    </p>

                </div>
            </div>
        </div>
    );
};

export default Categorical;
