import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDarkMode, toggleSidebar } from '../../store/uiSlice';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const Header = () => {
    const dispatch = useDispatch();
    const darkMode = useSelector((state) => state.ui.darkMode);
    const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
    const [helpOpen, setHelpOpen] = useState(false);

    return (
        <header className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800 text-white' : 'bg-dnd-red text-white'} shadow-md`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button
                            onClick={() => dispatch(toggleSidebar())}
                            className="p-1 rounded-md text-white focus:outline-none"
                        >
                            {sidebarOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </button>

                        <Link to="/" className="ml-4">
                            <div className="flex items-center">
                                <span className="text-xl font-fantasy font-bold">D&D Homebrew Creator</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center">
                        <div className="relative">
                            <button
                                onClick={() => setHelpOpen(!helpOpen)}
                                className="p-1 rounded-md text-white focus:outline-none mr-2"
                            >
                                <QuestionMarkCircleIcon className="h-6 w-6" />
                            </button>

                            {helpOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                    <div className="px-4 py-2">
                                        <h3 className="text-gray-900 dark:text-white font-medium">Help</h3>
                                        <p className="mt-1">Create and manage your D&D homebrew content, ensuring SRD compliance.</p>
                                        <div className="mt-2">
                                            <a
                                                href="https://www.dndbeyond.com/srd"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-dnd-red hover:underline"
                                            >
                                                View SRD Reference
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => dispatch(toggleDarkMode())}
                            className="p-1 rounded-md text-white focus:outline-none mr-4"
                        >
                            {darkMode ? (
                                <SunIcon className="h-6 w-6" />
                            ) : (
                                <MoonIcon className="h-6 w-6" />
                            )}
                        </button>

                        <div className="flex items-center">
                            <Link
                                to="/export"
                                className="bg-white text-dnd-red px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100"
                            >
                                Export
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;