import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    toggleDarkMode,
    toggleSrdValidation
} from '../../store/uiSlice';
import {
    CheckIcon,
    ArrowPathIcon,
    TrashIcon,
    ShieldCheckIcon,
    DocumentTextIcon,
    SunIcon,
    MoonIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
    const dispatch = useDispatch();
    const darkMode = useSelector((state) => state.ui.darkMode);
    const srdValidationActive = useSelector((state) => state.ui.srdValidationActive);

    const [localStorageSize, setLocalStorageSize] = useState('0 KB');
    const [lastBackupDate, setLastBackupDate] = useState(null);
    const [backupInProgress, setBackupInProgress] = useState(false);
    const [restoreInProgress, setRestoreInProgress] = useState(false);
    const [clearInProgress, setClearInProgress] = useState(false);
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    // Calculate localStorage usage
    useEffect(() => {
        const calculateLocalStorageSize = () => {
            let total = 0;

            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += (localStorage[key].length * 2) / 1024;
                }
            }

            if (total < 1024) {
                setLocalStorageSize(`${Math.round(total * 100) / 100} KB`);
            } else {
                setLocalStorageSize(`${Math.round((total / 1024) * 100) / 100} MB`);
            }
        };

        calculateLocalStorageSize();

        // Get last backup date
        const backupDate = localStorage.getItem('lastBackupDate');
        if (backupDate) {
            setLastBackupDate(new Date(backupDate));
        }
    }, []);

    // Handle backup creation
    const handleBackup = () => {
        setBackupInProgress(true);
        setStatusMessage({ type: 'info', text: 'Creating backup...' });

        setTimeout(() => {
            try {
                // Get all data from Redux store
                const state = {
                    character: JSON.parse(localStorage.getItem('character') || '{}'),
                    world: JSON.parse(localStorage.getItem('world') || '{}'),
                    monster: JSON.parse(localStorage.getItem('monster') || '{}'),
                    item: JSON.parse(localStorage.getItem('item') || '{}'),
                    spell: JSON.parse(localStorage.getItem('spell') || '{}'),
                };

                // Create backup object
                const backupData = {
                    date: new Date().toISOString(),
                    version: '1.0',
                    data: state
                };

                // Convert to JSON string
                const backupString = JSON.stringify(backupData);

                // Create and download file
                const blob = new Blob([backupString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `dnd-homebrew-backup-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Update last backup date
                const now = new Date();
                localStorage.setItem('lastBackupDate', now.toISOString());
                setLastBackupDate(now);

                setStatusMessage({ type: 'success', text: 'Backup created successfully!' });
            } catch (error) {
                console.error('Error creating backup:', error);
                setStatusMessage({ type: 'error', text: 'Error creating backup. Please try again.' });
            } finally {
                setBackupInProgress(false);
            }
        }, 1000);
    };

    // Handle restore from backup
    const handleRestore = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setRestoreInProgress(true);
        setStatusMessage({ type: 'info', text: 'Restoring from backup...' });

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const backupData = JSON.parse(event.target.result);

                // Validate backup format
                if (!backupData.data || !backupData.date || !backupData.version) {
                    throw new Error('Invalid backup file format');
                }

                // Restore data to localStorage
                const { data } = backupData;

                if (data.character) localStorage.setItem('character', JSON.stringify(data.character));
                if (data.world) localStorage.setItem('world', JSON.stringify(data.world));
                if (data.monster) localStorage.setItem('monster', JSON.stringify(data.monster));
                if (data.item) localStorage.setItem('item', JSON.stringify(data.item));
                if (data.spell) localStorage.setItem('spell', JSON.stringify(data.spell));

                setStatusMessage({
                    type: 'success',
                    text: 'Backup restored successfully! Reload the page to see your content.'
                });
            } catch (error) {
                console.error('Error restoring backup:', error);
                setStatusMessage({
                    type: 'error',
                    text: 'Error restoring backup. Please check the file and try again.'
                });
            } finally {
                setRestoreInProgress(false);
            }
        };

        reader.onerror = () => {
            setStatusMessage({ type: 'error', text: 'Error reading backup file.' });
            setRestoreInProgress(false);
        };

        reader.readAsText(file);
    };

    // Handle clear all data
    const handleClearData = () => {
        setClearInProgress(true);
        setStatusMessage({ type: 'info', text: 'Clearing all data...' });

        setTimeout(() => {
            try {
                // Create backup before clearing (just in case)
                const state = {
                    character: JSON.parse(localStorage.getItem('character') || '{}'),
                    world: JSON.parse(localStorage.getItem('world') || '{}'),
                    monster: JSON.parse(localStorage.getItem('monster') || '{}'),
                    item: JSON.parse(localStorage.getItem('item') || '{}'),
                    spell: JSON.parse(localStorage.getItem('spell') || '{}'),
                };

                localStorage.setItem('preDeleteBackup', JSON.stringify({
                    date: new Date().toISOString(),
                    data: state
                }));

                // Clear data
                localStorage.removeItem('character');
                localStorage.removeItem('world');
                localStorage.removeItem('monster');
                localStorage.removeItem('item');
                localStorage.removeItem('spell');

                // Calculate new size
                let total = 0;
                for (const key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        total += (localStorage[key].length * 2) / 1024;
                    }
                }

                if (total < 1024) {
                    setLocalStorageSize(`${Math.round(total * 100) / 100} KB`);
                } else {
                    setLocalStorageSize(`${Math.round((total / 1024) * 100) / 100} MB`);
                }

                setStatusMessage({
                    type: 'success',
                    text: 'All data cleared! Reload the page to see changes.'
                });
            } catch (error) {
                console.error('Error clearing data:', error);
                setStatusMessage({ type: 'error', text: 'Error clearing data. Please try again.' });
            } finally {
                setClearInProgress(false);
                setShowConfirmClear(false);
            }
        }, 1000);
    };

    return (
        <div>
            <h1 className="text-2xl font-medieval font-bold mb-6">Settings</h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-medium mb-4">Appearance</h2>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                    <div className="flex items-center">
                        {darkMode ? (
                            <MoonIcon className="h-6 w-6 text-purple-500 mr-3" />
                        ) : (
                            <SunIcon className="h-6 w-6 text-yellow-500 mr-3" />
                        )}
                        <div>
                            <h3 className="font-medium">Dark Mode</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Toggle between light and dark theme
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => dispatch(toggleDarkMode())}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode
                                ? 'bg-purple-600 focus:ring-purple-500'
                                : 'bg-gray-200 focus:ring-yellow-500'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-medium mb-4">SRD Validation</h2>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                    <div className="flex items-center">
                        <ShieldCheckIcon className="h-6 w-6 text-green-500 mr-3" />
                        <div>
                            <h3 className="font-medium">Automatic SRD Validation</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Automatically check content against SRD guidelines
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => dispatch(toggleSrdValidation())}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${srdValidationActive
                                ? 'bg-green-600 focus:ring-green-500'
                                : 'bg-gray-200 focus:ring-green-500'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${srdValidationActive ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                        SRD validation helps ensure your homebrew content complies with the Systems Reference Document guidelines, allowing you to freely share your creations. When enabled, the app will automatically check your content and warn you about potential compliance issues.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-medium mb-4">Data Management</h2>

                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                    <div>
                        <h3 className="font-medium">Storage Usage</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Local storage: {localStorageSize}
                        </p>
                    </div>

                    <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                </div>

                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                    <div>
                        <h3 className="font-medium">Last Backup</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {lastBackupDate
                                ? lastBackupDate.toLocaleDateString() + ' at ' + lastBackupDate.toLocaleTimeString()
                                : 'No backup created yet'}
                        </p>
                    </div>

                    <ClockIcon className="h-6 w-6 text-gray-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <button
                        onClick={handleBackup}
                        disabled={backupInProgress}
                        className="btn btn-primary"
                    >
                        {backupInProgress ? (
                            <>
                                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                                Creating Backup...
                            </>
                        ) : (
                            <>
                                <CheckIcon className="h-5 w-5 mr-2" />
                                Create Backup
                            </>
                        )}
                    </button>

                    <label className="btn btn-secondary cursor-pointer">
                        <ArrowPathIcon className="h-5 w-5 mr-2" />
                        Restore Backup
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleRestore}
                            disabled={restoreInProgress}
                        />
                    </label>

                    <button
                        onClick={() => setShowConfirmClear(true)}
                        disabled={clearInProgress}
                        className="btn btn-danger"
                    >
                        {clearInProgress ? (
                            <>
                                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                                Clearing Data...
                            </>
                        ) : (
                            <>
                                <TrashIcon className="h-5 w-5 mr-2" />
                                Clear All Data
                            </>
                        )}
                    </button>
                </div>

                {statusMessage && (
                    <div className={`p-4 rounded-lg ${statusMessage.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : statusMessage.type === 'error'
                                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        }`}>
                        <p className={`text-sm ${statusMessage.type === 'success'
                                ? 'text-green-700 dark:text-green-400'
                                : statusMessage.type === 'error'
                                    ? 'text-red-700 dark:text-red-400'
                                    : 'text-blue-700 dark:text-blue-400'
                            }`}>
                            {statusMessage.text}
                        </p>
                    </div>
                )}
            </div>

            {/* Confirm Clear Modal */}
            {showConfirmClear && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4">Clear All Data</h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                            Are you sure you want to clear all your homebrew data? This action cannot be undone.
                            We recommend creating a backup first.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmClear(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearData}
                                className="btn btn-danger"
                            >
                                Clear All Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;