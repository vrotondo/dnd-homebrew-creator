// src/components/monster/MonsterList.jsx
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
import { deleteMonster } from '../../store/monsterSlice';
import { addNotification } from '../../store/uiSlice';
import { v4 as uuidv4 } from 'uuid';

const MonsterList = () => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [selectedMonsters, setSelectedMonsters] = useState([]);

    // Get monsters from Redux store
    const monsters = useSelector((state) => state.monster.monsters || []);

    // Apply search filter
    const filteredMonsters = monsters.filter((monster) => {
        const matchesSearch = monster.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            monster.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' ||
            (filter === 'srd' && monster.isSrdCompliant) ||
            (filter === 'non-srd' && !monster.isSrdCompliant) ||
            (filter === monster.type);
        return matchesSearch && matchesFilter;
    });

    // Apply sorting
    const sortedMonsters = [...filteredMonsters].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'challengeRating') {
            // Special handling for CR sorting
            const crToNumber = (cr) => {
                if (cr === '0') return 0;
                if (cr === '1/8') return 0.125;
                if (cr === '1/4') return 0.25;
                if (cr === '1/2') return 0.5;
                return parseFloat(cr);
            };
            aValue = crToNumber(aValue);
            bValue = crToNumber(bValue);
        } else if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
            aValue = new Date(aValue || 0);
            bValue = new Date(bValue || 0);
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const handleDelete = (id) => {
        dispatch(deleteMonster(id));
        dispatch(addNotification({
            id: uuidv4(),
            type: 'success',
            title: 'Monster Deleted',
            message: 'The monster has been successfully deleted.'
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

    const toggleMonsterSelection = (monsterId) => {
        if (selectedMonsters.includes(monsterId)) {
            setSelectedMonsters(prev => prev.filter(id => id !== monsterId));
        } else {
            setSelectedMonsters(prev => [...prev, monsterId]);
        }
    };

    const selectAllMonsters = () => {
        if (selectedMonsters.length === filteredMonsters.length) {
            setSelectedMonsters([]);
        } else {
            setSelectedMonsters(filteredMonsters.map(monster => monster.id));
        }
    };

    const exportSelectedMonsters = () => {
        const monstersToExport = monsters.filter(monster =>
            selectedMonsters.includes(monster.id)
        );

        if (monstersToExport.length === 0) {
            dispatch(addNotification({
                id: uuidv4(),
                type: 'warning',
                title: 'No Monsters Selected',
                message: 'Please select at least one monster to export.'
            }));
            return;
        }

        const exportData = {
            monsters: monstersToExport
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = `monster-export-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();

        dispatch(addNotification({
            id: uuidv4(),
            type: 'success',
            title: 'Export Successful',
            message: `${monstersToExport.length} monster(s) exported successfully.`
        }));
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importData = JSON.parse(event.target.result);

                if (!importData.monsters || !Array.isArray(importData.monsters)) {
                    throw new Error('Invalid import file format');
                }

                // Add each monster to the store
                let count = 0;
                importData.monsters.forEach(monster => {
                    // Check if the monster already exists by ID
                    const exists = monsters.some(m => m.id === monster.id);

                    if (!exists) {
                        // Ensure each monster has a unique ID
                        const monsterToAdd = {
                            ...monster,
                            id: monster.id || uuidv4(),
                            createdAt: monster.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };

                        dispatch(addMonster(monsterToAdd));
                        count++;
                    }
                });

                dispatch(addNotification({
                    id: uuidv4(),
                    type: 'success',
                    title: 'Import Successful',
                    message: `${count} monster(s) imported successfully.`
                }));
            } catch (error) {
                console.error('Error importing monsters:', error);
                dispatch(addNotification({
                    id: uuidv4(),
                    type: 'error',
                    title: 'Import Failed',
                    message: 'There was an error importing the monsters. Please check the file format.'
                }));
            }
        };

        reader.readAsText(file);
    };

    // Get unique monster types for filter dropdown
    const monsterTypes = [...new Set(monsters.map(monster => monster.type))].sort();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medieval font-bold">Monsters</h1>
                <Link
                    to="/monsters/new"
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
                            placeholder="Search monsters..."
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="form-select"
                        >
                            <option value="all">All Types</option>
                            <option value="srd">SRD Compliant</option>
                            <option value="non-srd">Non-SRD</option>
                            <optgroup label="Monster Types">
                                {monsterTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </optgroup>
                        </select>

                        <button
                            onClick={exportSelectedMonsters}
                            className="btn btn-secondary"
                            title="Export selected monsters"
                            disabled={selectedMonsters.length === 0}
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

                {sortedMonsters.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="px-4 py-2 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedMonsters.length === filteredMonsters.length && filteredMonsters.length > 0}
                                            onChange={selectAllMonsters}
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
                                    <th className="px-4 py-2 text-left">
                                        <button
                                            className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            onClick={() => handleSortChange('challengeRating')}
                                        >
                                            CR
                                            {sortBy === 'challengeRating' && (
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
                                {sortedMonsters.map((monster) => (
                                    <tr
                                        key={monster.id}
                                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMonsters.includes(monster.id)}
                                                    onChange={() => toggleMonsterSelection(monster.id)}
                                                    className="mr-2"
                                                />
                                                <Link
                                                    to={`/monsters/${monster.id}`}
                                                    className="font-medium hover:text-dnd-red"
                                                >
                                                    {monster.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 capitalize">
                                            {monster.type || 'Unknown'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {monster.challengeRating}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {monster.isSrdCompliant ? (
                                                <span className="srd-compliant">✓</span>
                                            ) : (
                                                <span className="srd-non-compliant">✗</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link
                                                    to={`/monsters/${monster.id}`}
                                                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(monster.id)}
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
                            No monsters found. Create your first one!
                        </p>
                        <Link
                            to="/monsters/new"
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
                            Are you sure you want to delete this monster? This action cannot be undone.
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

export default MonsterList;