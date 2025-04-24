import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
                <h1 className="text-9xl font-medieval font-bold text-dnd-red">404</h1>
                <h2 className="text-3xl font-medieval font-bold mt-4 mb-6">Page Not Found</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    Oops! You rolled a natural 1 on your navigation check.
                    The page you are looking for doesn't exist or has been moved.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-dnd-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    <HomeIcon className="h-5 w-5 mr-2" />
                    Return to Homepage
                </Link>
            </div>

            <div className="mt-12 max-w-lg">
                <h3 className="text-xl font-medieval font-bold mb-4 text-center">While you're here...</h3>
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Roll for a random adventure hook:
                    </p>

                    <div className="bg-parchment p-4 rounded-md border border-amber-700">
                        {/* This would be generated randomly in a real app */}
                        <p className="font-medieval">
                            A mysterious map has appeared in your backpack, showing the location of a forgotten temple deep in the wilderness.
                            Strange symbols around the edges seem to pulse with an otherworldly light.
                        </p>
                    </div>

                    <div className="mt-4 text-center">
                        <button className="btn btn-primary">
                            Roll Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;