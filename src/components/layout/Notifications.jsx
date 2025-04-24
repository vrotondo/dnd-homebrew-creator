import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../../store/uiSlice';
import {
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const Notifications = () => {
    const dispatch = useDispatch();
    const notifications = useSelector((state) => state.ui.notifications);

    // Auto-remove notifications after 5 seconds
    useEffect(() => {
        const timers = notifications.map((notification) => {
            return setTimeout(() => {
                dispatch(removeNotification(notification.id));
            }, 5000);
        });

        return () => {
            timers.forEach((timer) => clearTimeout(timer));
        };
    }, [notifications, dispatch]);

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
            case 'error':
                return <XCircleIcon className="h-6 w-6 text-red-500" />;
            case 'warning':
                return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
            case 'info':
            default:
                return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 space-y-3">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm w-full flex items-start"
                >
                    <div className="flex-shrink-0">
                        {getIcon(notification.type)}
                    </div>
                    <div className="ml-3 flex-1">
                        {notification.title && (
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                            </h3>
                        )}
                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {notification.message}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => dispatch(removeNotification(notification.id))}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Notifications;