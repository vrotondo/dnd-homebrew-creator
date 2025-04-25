// src/components/world/WorldList.jsx
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
    ArrowUpOnSquareIcon,
    ArrowDownOnSquareIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline';
import { deleteWorld } from '../../store/worldSlice';
import { addNotification } from '../../store/uiSlice';
import { v4 as uuidv4 } from 'uuid';

const WorldList = () => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [selectedWorlds, setSelectedWorlds] = useState([]);

    // Get worlds from Redux store
    const worlds = useSelector((state) => state.world.worlds || []);

    // Apply filters
    const filteredWorlds = worlds.filter((world) => {
        // Search filter
        const matchesSearch = world.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (world.description && world.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // Type filter
        const matchesType = filters.type === 'all' || world.type === filters.type;

        // Status filter
        const matchesStatus = filters.status === 'all' || world.status === filters.status;

        return matchesSearch && matchesType && matchesStatus;
    });

    // Apply sorting
    const sortedWorlds = [...filteredWorlds].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
            aValue = new Date(aValue || 0);
            bValue = new Date(bValue || 0);
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const handleDelete = (id) => {
        dispatch(deleteWorld(id));
        dispatch(addNotification({
            id: uuidv4(),
            type: 'success',
            title: 'World Deleted',
            message: 'The world has been successfully deleted.'
        }));
        setShowDeleteConfirm(null);
    };

    const handleSortChange = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const toggleWorldSelection = (worldId) => {
        if (selectedWorlds.includes(worldId)) {
            setSelectedWorlds(prev => prev.filter(id => id !== worldId));
        } else {
            setSelectedWorlds(prev => [...prev, worldId]);
        }
    };

    const selectAllWorlds = () => {
        if (selectedWorlds.length === filteredWorlds.length) {
            setSelectedWorlds([]);
        } else {
            setSelectedWorlds(filteredWorlds.map(world => world.id));
        }
    };

    const exportSelectedWorlds = () => {
        const worldsToExport = worlds.filter(world =>
            selectedWorlds.includes(world.id)
        );

        if (worldsToExport.length === 0) {
            dispatch(addNotification({
                id: uuidv4(),
                type: 'warning',
                title: 'No Worlds Selected',
                message: 'Please select at least one world to export.'
            }));
            return;
        }

        const exportData = {
            worlds: worldsToExport
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = `world-export-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();

        dispatch(addNotification({
            id: uuidv4(),
            type: 'success',
            title: 'Export Successful',
            message: `${worldsToExport.length} world(s) exported successfully.`
        }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medieval font-bold">Worlds</h1>
                <Link
                    to="/worlds/new"
                    className="btn btn-primary"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create New
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input pl-10"
                            placeholder="Search worlds..."
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn btn-secondary"
                            title="Toggle filters"
                        >
                            <FunnelIcon className="h-5 w-5 mr-2" />
                            Filters
                        </button>

                        <button
                            onClick={exportSelectedWorlds}
                            className="btn btn-secondary"
                            title="Export selected worlds"
                            disabled={selectedWorlds.length === 0}
                        >
                            <ArrowUpOnSquareIcon className="h-5 w-5 mr-2" />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            {showFilters && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="type-filter" className="form-label">Type</label>
                            <select
                                id="type-filter"
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="form-select"
                            >
                                <option value="all">All Types</option>
                                <option value="fantasy">Fantasy</option>
                                <option value="science-fiction">Science Fiction</option>
                                <option value="post-apocalyptic">Post-Apocalyptic</option>
                                <option value="historical">Historical</option>
                                <option value="modern">Modern</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="status-filter" className="form-label">Status</label>
                            <select
                                id="status-filter"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="form-select"
                            >
                                <option value="all">All Statuses</option>
                                <option value="in-progress">In Progress</option>
                                <option value="complete">Complete</option>
                                <option value="planning">Planning</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {sortedWorlds.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="px-4 py-2 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedWorlds.length === filteredWorlds.length && filteredWorlds.length > 0}
                                        onChange={selectAllWorlds}
                                        className="mr-2"
                                    />
                                    <button
                                        className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        onClick={() => handleSortChange('name')}
                                    >
                                        Name
                                        {sortBy === 'name' && (
                                            <span className="ml-1">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </button>
                                </th>
                                <th className="px-4 py-2 text-left">
                                    <button
                                        className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        onClick={() => handleSortChange('type')}
                                    >
                                        Type
                                        {sortBy === 'type' && (
                                            <span className="ml-1">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </button>
                                </th>
                                <th className="px-4 py-2 text-left hidden md:table-cell">
                                    <button
                                        className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        onClick={() => handleSortChange('status')}
                                    >
                                        Status
                                        {sortBy === 'status' && (
                                            <span className="ml-1">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </button>
                                </th>
                                <th className="px-4 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedWorlds.map((world) => (
                                <tr
                                    key={world.id}
                                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedWorlds.includes(world.id)}
                                                onChange={() => toggleWorldSelection(world.id)}
                                                className="mr-2"
                                            />
                                            <Link
                                                to={`/worlds/${world.id}`}
                                                className="font-medium hover:text-dnd-red"
                                            >
                                                {world.name}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 capitalize">
                                        {world.type || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell capitalize">
                                        {world.status || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Link
                                                to={`/worlds/${world.id}`}
                                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="Edit"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>
                                            <button
                                                onClick={() => setShowDeleteConfirm(world.id)}
                                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                title="Delete"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                        No worlds found. Create your first one!
                    </p>
                    <Link
                        to="/worlds/new"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-dnd-red hover:bg-red-700"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create New
                    </Link>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
                        <p className="mb-4">
                            Are you sure you want to delete this world? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="btn btn-danger"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorldList;