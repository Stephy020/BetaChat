import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
                    <div className="max-w-2xl w-full bg-red-900 bg-opacity-50 p-6 rounded-lg">
                        <h1 className="text-2xl font-bold mb-4">⚠️ Something went wrong</h1>
                        <details className="whitespace-pre-wrap text-sm">
                            <summary className="cursor-pointer mb-2 font-semibold">Error Details (Click to expand)</summary>
                            <div className="bg-black bg-opacity-50 p-4 rounded mt-2 overflow-auto">
                                <p className="text-red-400 mb-2">{this.state.error && this.state.error.toString()}</p>
                                <p className="text-gray-400">{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                            </div>
                        </details>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
