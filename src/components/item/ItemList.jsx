// src/components/item/ItemList.jsx
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
import { deleteItem } from '../../store/itemSlice';
import { addNotification } from '../../store/uiSlice';
import { v4 as uuidv4 } from 'uuid';

const ItemList = () => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        type: 'all',
        rarity: 'all',
        attunement: 'all',
        srd: 'all',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    // Get items from Redux store
    const items = useSelector((state) => state.item.items || []);

    // Available item types for filter
    const itemTypes = [
        { value: 'wondrous', label: 'Wondrous Item' },
        { value: 'armor', label: 'Armor' },
        { value: 'weapon', label: 'Weapon' },
        { value: 'potion', label: 'Potion' },
        { value: 'ring', label: 'Ring' },
        { value: 'rod', label: 'Rod' },
        { value: 'scroll', label: 'Scroll' },
        { value: 'staff', label: 'Staff' },
        { value: 'wand', label: 'Wand' },
        { value: 'other', label: 'Other' },
    ];

    // Available rarities for filter
    const rarities = [
        { value: 'common', label: 'Common' },
        { value: 'uncommon', label: 'Uncommon' },
        { value: 'rare', label: 'Rare' },
        { value: 'very-rare', label: 'Very Rare' },
        { value: 'legendary', label: 'Legendary' },
        { value: 'artifact', label: 'Artifact' },
        { value: 'varies', label: 'Varies' },
    ];

    // Apply filters
    const filteredItems = items.filter((item) => {
        // Search filter
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // Type filter
        const matchesType = filters.type === 'all' || item.type === filters.type;

        // Rarity filter
        const matchesRarity = filters.rarity === 'all' || item.rarity === filters.rarity;

        // Attunement filter
        const matchesAttunement = filters.attunement === 'all' ||
            (filters.attunement === 'yes' && item.requiresAttunement) ||
            (filters.attunement === 'no' && !item.requiresAttunement);

        // SRD filter
        const matchesSrd = filters.srd === 'all' ||
            (filters.srd === 'srd' && item.isSrdCompliant) ||
            (filters.srd === 'non-srd' && !item.isSrdCompliant);

        return matchesSearch && matchesType && matchesRarity && matchesAttunement && matchesSrd;
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
        dispatch(deleteItem(id));
        dispatch(addNotification({
            id: uuidv4(),
            type: 'success',
            title: 'Item Deleted',
            message: 'The magic item has been successfully deleted.'
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

    const toggleItemSelection = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(prev => prev.filter(id => id !== itemId));
        } else {
            setSelectedItems(prev => [...prev, itemId]);
        }
    };

    const selectAllItems = () => {
        if (selectedItems.length === filteredItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredItems.map(item => item.id));
        }
    };

    const exportSelectedItems = () => {
        const itemsToExport = items.filter(item =>
            selectedItems.includes(item.id)
        );

        if (itemsToExport.length === 0) {
            dispatch(addNotification({
                id: uuidv4(),
                type: 'warning',
                title: 'No Items Selected',
                message: 'Please select at least one magic item to export.'
            }));
            return;
        }

        const exportData = {
            items: itemsToExport
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = `items-export-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();

        dispatch(addNotification({
            id: uuidv4(),
            type: 'success',
            title: 'Export Successful',
            message: `${itemsToExport.length} item(s) exported successfully.`
        }));
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importData = JSON.parse(event.target.result);

                if (!importData.items || !Array.isArray(importData.items)) {
                    throw new Error('Invalid import file format');
                }

                // Add each item to the store
                let count = 0;
                importData.items.forEach(item => {
                    // Check if the item already exists by ID
                    const exists = items.some(i => i.id === item.id);

                    if (!exists) {
                        // Ensure each item has a unique ID
                        const itemToAdd = {
                            ...item,
                            id: item.id || uuidv4(),
                            createdAt: item.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };

                        dispatch(addItem(itemToAdd));
                        count++;
                    }
                });

                dispatch(addNotification({
                    id: uuidv4(),
                    type: 'success',
                    title: 'Import Successful',
                    message: `${count} item(s) imported successfully.`
                }));
            } catch (error) {
                console.error('Error importing items:', error);
                dispatch(addNotification({
                    id: uuidv4(),
                    type: 'error',
                    title: 'Import Failed',
                    message: 'There was an error importing the items. Please check the file format.'
                }));
            }
        };

        reader.readAsText(file);
    };

    // Get rarity class for color styling
    const getRarityClass = (rarity) => {
        switch (rarity) {
            case 'common': return 'text-gray-600 dark:text-gray-300';
            case 'uncommon': return 'text-green-600 dark:text-green-400';
            case 'rare': return 'text-blue-600 dark:text-blue-400';
            case 'very-rare': return 'text-purple-600 dark:text-purple-400';
            case 'legendary': return 'text-orange-600 dark:text-orange-400';
            case 'artifact': return 'text-red-600 dark:text-red-400';
            default: return 'text-gray-600 dark:text-gray-300';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medieval font-bold">Magic Items</h1>
                <Link
                    to="/items/new"
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
                            placeholder="Search magic items..."
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
                            onClick={exportSelectedItems}
                            className="btn btn-secondary"
                            title="Export selected items"
                            disabled={selectedItems.length === 0}
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
                                onChange={handleImport}
                            />
                        </label>
                    </div>
                </div>

                {showFilters && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">Filters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label htmlFor="type-filter" className="form-label">Type</label>
                                <select
                                    id="type-filter"
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="form-select"
                                >
                                    <option value="all">All Types</option>
                                    {itemTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="rarity-filter" className="form-label">Rarity</label>
                                <select
                                    id="rarity-filter"
                                    value={filters.rarity}
                                    onChange={(e) => handleFilterChange('rarity', e.target.value)}
                                    className="form-select"
                                >
                                    <option value="all">All Rarities</option>
                                    {rarities.map(rarity => (
                                        <option key={rarity.value} value={rarity.value}>{rarity.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="attunement-filter" className="form-label">Attunement</label>
                                <select
                                    id="attunement-filter"
                                    value={filters.attunement}
                                    onChange={(e) => handleFilterChange('attunement', e.target.value)}
                                    className="form-select"
                                >
                                    <option value="all">All Items</option>
                                    <option value="yes">Requires Attunement</option>
                                    <option value="no">No Attunement</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="srd-filter" className="form-label">SRD Compliance</label>
                                <select
                                    id="srd-filter"
                                    value={filters.srd}
                                    onChange={(e) => handleFilterChange('srd', e.target.value)}
                                    className="form-select"
                                >
                                    <option value="all">All Items</option>
                                    <option value="srd">SRD Compliant</option>
                                    <option value="non-srd">Non-SRD</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {sortedItems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="px-4 py-2 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                                            onChange={selectAllItems}
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
                                    <th className="px-4 py-2 text-left hidden sm:table-cell">
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
                                    <th className="px-4 py-2 text-left">
                                        <button
                                            className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            onClick={() => handleSortChange('rarity')}
                                        >
                                            Rarity
                                            {sortBy === 'rarity' && (
                                                <span className="ml-1">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-2 text-center hidden md:table-cell">Attunement</th>
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
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => toggleItemSelection(item.id)}
                                                    className="mr-2"
                                                />
                                                <Link
                                                    to={`/items/${item.id}`}
                                                    className="font-medium hover:text-dnd-red"
                                                >
                                                    {item.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell capitalize">
                                            {item.type}
                                        </td>
                                        <td className={`px-4 py-3 ${getRarityClass(item.rarity)} capitalize`}>
                                            {item.rarity}
                                        </td>
                                        <td className="px-4 py-3 text-center hidden md:table-cell">
                                            {item.requiresAttunement ? 'Yes' : 'No'}
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
                                                    to={`/items/${item.id}`}
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
                            No magic items found. Create your first one!
                        </p>
                        <Link
                            to="/items/new"
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
                            Are you sure you want to delete this magic item? This action cannot be undone.
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

export default ItemList;