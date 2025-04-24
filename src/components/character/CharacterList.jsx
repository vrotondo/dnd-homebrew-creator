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
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { deleteCharacter } from '../../store/characterSlice';

const CharacterList = ({ type = 'character' }) => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // Get the appropriate data based on the type
    let items = [];
    let title = '';
    let createPath = '';

    switch (type) {
        case 'class':
            items = useSelector((state) => state.character.customClasses);
            title = 'Custom Classes';
            createPath = '/classes/new';
            break;
        case 'race':
            items = useSelector((state) => state.character.customRaces);
            title = 'Custom Races';
            createPath = '/races/new';
            break;
        case 'background':
            items = useSelector((state) => state.character.customBackgrounds);
            title = 'Custom Backgrounds';
            createPath = '/backgrounds/new';
            break;
        case 'feat':
            items = useSelector((state) => state.character.customFeats);
            title = 'Custom Feats';
            createPath = '/feats/new';
            break;
        default:
            items = useSelector((state) => state.character.characters);
            title = 'Characters';
            createPath = '/characters/new';
    }

    // Apply search filter
    const filteredItems = items.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'srd' && item.isSrdCompliant) || (filter === 'non-srd' && !item.isSrdCompliant);
        return matchesSearch && matchesFilter;
    });

    // Apply sorting
    const sortedItems = [...filteredItems].sort((a, b) => {
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
        dispatch(deleteCharacter(id));
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

    const exportItems = () => {
        const dataStr = JSON.stringify(filteredItems);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `${type}-export.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medieval font-bold">{title}</h1>
                <Link
                    to={createPath}
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
                            placeholder={`Search ${title.toLowerCase()}...`}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="form-select"
                        >
                            <option value="all">All Items</option>
                            <option value="srd">SRD Compliant</option>
                            <option value="non-srd">Non-SRD</option>
                        </select>

                        <button
                            onClick={exportItems}
                            className="btn btn-secondary"
                            title="Export selected items"
                        >
                            <ArrowUpOnSquareIcon className="h-5 w-5 mr-2" />
                            Export
                        </button>

                        <label className="btn btn-secondary">
                            <ArrowDownOnSquareIcon className="h-5 w-5 mr-2" />
                            Import
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            try {
                                                const importedData = JSON.parse(event.target.result);
                                                // Handle import logic here (implement in later steps)
                                                console.log('Imported data:', importedData);
                                            } catch (error) {
                                                console.error('Error parsing JSON:', error);
                                            }
                                        };
                                        reader.readAsText(file);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>

                {sortedItems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="px-4 py-2 text-left">
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
                                    <th className="px-4 py-2 text-left hidden md:table-cell">Description</th>
                                    <th className="px-4 py-2 text-left hidden sm:table-cell">
                                        <button
                                            className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            onClick={() => handleSortChange('updatedAt')}
                                        >
                                            Last Updated
                                            {sortBy === 'updatedAt' && (
                                                <span className="ml-1">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-2 text-center">SRD</th>
                                    <th className="px-4 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                to={`/${type}s/${item.id}`}
                                                className="font-medium hover:text-dnd-red"
                                            >
                                                {item.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <div className="truncate max-w-xs">
                                                {item.description || 'No description'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            {new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {item.isSrdCompliant ? (
                                                <span className="srd-compliant">✓</span>
                                            ) : (
                                                <span className="srd-non-compliant">✗</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link
                                                    to={`/${type}s/${item.id}`}
                                                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(item.id)}
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
                            No {title.toLowerCase()} found. Create your first one!
                        </p>
                        <Link
                            to={createPath}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-dnd-red hover:bg-red-700"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Create New
                        </Link>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
                        <p className="mb-4">
                            Are you sure you want to delete this item? This action cannot be undone.
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

export default CharacterList;