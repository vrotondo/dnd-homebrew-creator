// src/components/spell/SpellList.jsx
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
    AdjustmentsHorizontalIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline';
import { deleteSpell, addSpell } from '../../store/spellSlice'; // Added import for addSpell
import { addNotification } from '../../store/uiSlice';
import { v4 as uuidv4 } from 'uuid';

const SpellList = () => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        level: 'all',
        school: 'all',
        class: 'all',
        source: 'all',
        srd: 'all',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [selectedSpells, setSelectedSpells] = useState([]);

    // Get spells from Redux store
    const spells = useSelector((state) => state.spell.spells || []);

    // Apply filters
    const filteredSpells = spells.filter((spell) => {
        // Search filter
        const matchesSearch = spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            spell.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Level filter
        const matchesLevel = filters.level === 'all' ||
            (filters.level === 'cantrip' && spell.level === 0) ||
            (parseInt(filters.level) === spell.level);

        // School filter
        const matchesSchool = filters.school === 'all' || spell.school === filters.school;

        // Class filter
        const matchesClass = filters.class === 'all' ||
            (spell.classes && spell.classes.includes(filters.class));

        // Source filter
        const matchesSource = filters.source === 'all' || spell.source === filters.source;

        // SRD filter
        const matchesSrd = filters.srd === 'all' ||
            (filters.srd === 'srd' && spell.isSrdCompliant) ||
            (filters.srd === 'non-srd' && !spell.isSrdCompliant);

        return matchesSearch && matchesLevel && matchesSchool && matchesClass && matchesSource && matchesSrd;
    });

    // Apply sorting
    const sortedSpells = [...filteredSpells].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'level') {
            aValue = parseInt(aValue);
            bValue = parseInt(bValue);
        } else if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
            aValue = new Date(aValue || 0);
            bValue = new Date(bValue || 0);
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const handleDelete = (id) => {
        dispatch(deleteSpell(id));
        dispatch(addNotification({
            id: uuidv4(),
            type: 'success',
            title: 'Spell Deleted',
            message: 'The spell has been successfully deleted.'
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

    const toggleSpellSelection = (spellId) => {
        if (selectedSpells.includes(spellId)) {
            setSelectedSpells(prev => prev.filter(id => id !== spellId));
        } else {
            setSelectedSpells(prev => [...prev, spellId]);
        }
    };

    const selectAllSpells = () => {
        if (selectedSpells.length === filteredSpells.length) {
            setSelectedSpells([]);
        } else {
            setSelectedSpells(filteredSpells.map(spell => spell.id));
        }
    };

    const exportSelectedSpells = () => {
        const spellsToExport = spells.filter(spell =>
            selectedSpells.includes(spell.id)
        );

        if (spellsToExport.length === 0) {
            dispatch(addNotification({
                id: uuidv4(),
                type: 'warning',
                title: 'No Spells Selected',
                message: 'Please select at least one spell to export.'
            }));
            return;
        }

        const exportData = {
            spells: spellsToExport
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = `spell-export-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();

        dispatch(addNotification({
            id: uuidv4(),
            type: 'success',
            title: 'Export Successful',
            message: `${spellsToExport.length} spell(s) exported successfully.`
        }));
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importData = JSON.parse(event.target.result);

                if (!importData.spells || !Array.isArray(importData.spells)) {
                    throw new Error('Invalid import file format');
                }

                // Add each spell to the store
                let count = 0;
                importData.spells.forEach(spell => {
                    // Check if the spell already exists by ID
                    const exists = spells.some(s => s.id === spell.id);

                    if (!exists) {
                        // Ensure each spell has a unique ID
                        const spellToAdd = {
                            ...spell,
                            id: spell.id || uuidv4(),
                            createdAt: spell.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };

                        dispatch(addSpell(spellToAdd));
                        count++;
                    }
                });

                dispatch(addNotification({
                    id: uuidv4(),
                    type: 'success',
                    title: 'Import Successful',
                    message: `${count} spell(s) imported successfully.`
                }));
            } catch (error) {
                console.error('Error importing spells:', error);
                dispatch(addNotification({
                    id: uuidv4(),
                    type: 'error',
                    title: 'Import Failed',
                    message: 'There was an error importing the spells. Please check the file format.'
                }));
            }
        };

        reader.readAsText(file);
    };

    // Extract unique values for filter dropdowns
    const spellSchools = [...new Set(spells.map(spell => spell.school))].sort();
    const spellSources = [...new Set(spells.map(spell => spell.source))].filter(Boolean).sort();
    const spellClasses = [...new Set(spells.flatMap(spell => spell.classes || []))].sort();

    // Function to format spell level for display
    const formatSpellLevel = (level) => {
        if (level === 0) return 'Cantrip';
        if (level === 1) return '1st Level';
        if (level === 2) return '2nd Level';
        if (level === 3) return '3rd Level';
        return `${level}th Level`;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medieval font-bold">Spells</h1>
                <Link
                    to="/spells/new"
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
                            placeholder="Search spells..."
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
                            onClick={exportSelectedSpells}
                            className="btn btn-secondary"
                            title="Export selected spells"
                            disabled={selectedSpells.length === 0}
                        >
                            <ArrowUpOnSquareIcon className="h-5 w-5 mr-2" />
                            Export
                        </button>

                        {/* Fixed label closing tag and structure */}
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
            </div>

            {showFilters && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="level-filter" className="form-label">Level</label>
                            <select
                                id="level-filter"
                                value={filters.level}
                                onChange={(e) => handleFilterChange('level', e.target.value)}
                                className="form-select"
                            >
                                <option value="all">All Levels</option>
                                <option value="cantrip">Cantrip</option>
                                <option value="1">1st Level</option>
                                <option value="2">2nd Level</option>
                                <option value="3">3rd Level</option>
                                <option value="4">4th Level</option>
                                <option value="5">5th Level</option>
                                <option value="6">6th Level</option>
                                <option value="7">7th Level</option>
                                <option value="8">8th Level</option>
                                <option value="9">9th Level</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="school-filter" className="form-label">School</label>
                            <select
                                id="school-filter"
                                value={filters.school}
                                onChange={(e) => handleFilterChange('school', e.target.value)}
                                className="form-select"
                            >
                                <option value="all">All Schools</option>
                                {spellSchools.map(school => (
                                    <option key={school} value={school}>{school}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="class-filter" className="form-label">Class</label>
                            <select
                                id="class-filter"
                                value={filters.class}
                                onChange={(e) => handleFilterChange('class', e.target.value)}
                                className="form-select"
                            >
                                <option value="all">All Classes</option>
                                {spellClasses.map(className => (
                                    <option key={className} value={className}>{className}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="source-filter" className="form-label">Source</label>
                            <select
                                id="source-filter"
                                value={filters.source}
                                onChange={(e) => handleFilterChange('source', e.target.value)}
                                className="form-select"
                            >
                                <option value="all">All Sources</option>
                                {spellSources.map(source => (
                                    <option key={source} value={source}>{source}</option>
                                ))}
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
                                <option value="all">All Spells</option>
                                <option value="srd">SRD Compliant</option>
                                <option value="non-srd">Non-SRD</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {sortedSpells.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="px-4 py-2 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedSpells.length === filteredSpells.length && filteredSpells.length > 0}
                                        onChange={selectAllSpells}
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
                                        onClick={() => handleSortChange('level')}
                                    >
                                        Level
                                        {sortBy === 'level' && (
                                            <span className="ml-1">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </button>
                                </th>
                                <th className="px-4 py-2 text-left hidden md:table-cell">
                                    <button
                                        className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        onClick={() => handleSortChange('school')}
                                    >
                                        School
                                        {sortBy === 'school' && (
                                            <span className="ml-1">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </button>
                                </th>
                                <th className="px-4 py-2 text-left hidden lg:table-cell">Classes</th>
                                <th className="px-4 py-2 text-center">SRD</th>
                                <th className="px-4 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSpells.map((spell) => (
                                <tr
                                    key={spell.id}
                                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedSpells.includes(spell.id)}
                                                onChange={() => toggleSpellSelection(spell.id)}
                                                className="mr-2"
                                            />
                                            <Link
                                                to={`/spells/${spell.id}`}
                                                className="font-medium hover:text-dnd-red"
                                            >
                                                {spell.name}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatSpellLevel(spell.level)}
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell capitalize">
                                        {spell.school}
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        {spell.classes && spell.classes.length > 0
                                            ? spell.classes.join(', ')
                                            : 'None'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {spell.isSrdCompliant ? (
                                            <span className="srd-compliant">✓</span>
                                        ) : (
                                            <span className="srd-non-compliant">✗</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Link
                                                to={`/spells/${spell.id}`}
                                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="Edit"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>
                                            <button
                                                onClick={() => setShowDeleteConfirm(spell.id)}
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
                        No spells found. Create your first one!
                    </p>
                    <Link
                        to="/spells/new"
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
                            Are you sure you want to delete this spell? This action cannot be undone.
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

export default SpellList;