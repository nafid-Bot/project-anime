import React from 'react';

const Pagination = ({ page, setPage, hasNext, lastPage }) => {

    return (
        <div>
            <div className="mt-6 flex items-center justify-between gap-2">
               
                <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                Prev
                </span>
                </button>

                <span className="text-sm opacity-70 text-white">
                    Page {page} {lastPage ? `of ${lastPage}` : null}
                </span>

                <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                Next
                </span>
                </button>

            </div>
            
        </div>
    );
};

export default Pagination;