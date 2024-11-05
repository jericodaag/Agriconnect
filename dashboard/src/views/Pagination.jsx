import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ pageNumber, setPageNumber, totalItem, parPage }) => {
    const totalPages = Math.ceil(totalItem / parPage);
    
    const getPageRange = () => {
        let start = pageNumber - 1;
        let end = pageNumber + 1;
        
        if (start < 1) {
            start = 1;
            end = Math.min(3, totalPages);
        }
        
        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, totalPages - 2);
        }
        
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setPageNumber(page);
        }
    };

    return (
        <div className="flex items-center justify-center gap-1.5 font-medium">
            {/* First page button */}
            {pageNumber > 1 && (
                <button
                    onClick={() => handlePageChange(1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    aria-label="First page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </button>
            )}
            
            {/* Previous page button */}
            {pageNumber > 1 && (
                <button
                    onClick={() => handlePageChange(pageNumber - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
            )}

            {/* Page numbers */}
            <div className="flex gap-1.5">
                {getPageRange().map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`
                            w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                            ${pageNumber === page 
                                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 hover:bg-blue-700' 
                                : 'border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300'
                            }
                        `}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {/* Next page button */}
            {pageNumber < totalPages && (
                <button
                    onClick={() => handlePageChange(pageNumber + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            )}

            {/* Last page button */}
            {pageNumber < totalPages && (
                <button
                    onClick={() => handlePageChange(totalPages)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    aria-label="Last page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

export default Pagination;