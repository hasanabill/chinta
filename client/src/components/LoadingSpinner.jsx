const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-green-600"></div>
        </div>
    );
};

export default LoadingSpinner;
