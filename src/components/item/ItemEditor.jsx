// src/components/item/ItemEditor.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
    addItem,
    updateItem,
    deleteItem
} from '../../store/itemSlice';
import { validateSrdCompliance } from '../../utils/srdValidator';
import SrdValidator from '../srd/SrdValidator';
import {
    DocumentCheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    DocumentDuplicateIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const ItemEditor = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isNew = !id;

    // Get the item data
    const items = useSelector((state) => state.item.items);
    const item = isNew ? null : items.find(item => item.id === id);

    // Form state
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        type: 'wondrous',
        rarity: 'uncommon',
        requiresAttunement: false,
        attunementRequirements: '',
        description: '',
        properties: [],
        value: '',
        weight: '',
        cursed: false,
        charges: {
            hasCharges: false,
            maxCharges: 0,
            recharge: ''
        },
        createdAt: '',
        updatedAt: '',
        isSrdCompliant: true,
    });

    const [srdIssues, setSrdIssues] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Available item types
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

    // Available rarities
    const rarities = [
        { value: 'common', label: 'Common' },
        { value: 'uncommon', label: 'Uncommon' },
        { value: 'rare', label: 'Rare' },
        { value: 'very-rare', label: 'Very Rare' },
        { value: 'legendary', label: 'Legendary' },
        { value: 'artifact', label: 'Artifact' },
        { value: 'varies', label: 'Varies' },
    ];

    // If editing, populate form with existing data
    useEffect(() => {
        if (item) {
            setFormData({
                ...item,
                // Ensure the charges object is complete
                charges: {
                    hasCharges: item.charges?.hasCharges ?? false,
                    maxCharges: item.charges?.maxCharges ?? 0,
                    recharge: item.charges?.recharge ?? ''
                }
            });
        } else if (isNew) {
            setFormData({
                id: uuidv4(),
                name: '',
                type: 'wondrous',
                rarity: 'uncommon',
                requiresAttunement: false,
                attunementRequirements: '',
                description: '',
                properties: [],
                value: '',
                weight: '',
                cursed: false,
                charges: {
                    hasCharges: false,
                    maxCharges: 0,
                    recharge: ''
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isSrdCompliant: true,
            });
        }
    }, [item, isNew]);

    // Check if data has been modified
    useEffect(() => {
        if (item) {
            const isChanged = JSON.stringify(item) !== JSON.stringify(formData);
            setHasUnsavedChanges(isChanged);
        } else if (isNew) {
            const isPopulated = formData.name.trim() !== '' || formData.description.trim() !== '';
            setHasUnsavedChanges(isPopulated);
        }
    }, [formData, item, isNew]);

    // Validate SRD compliance
    useEffect(() => {
        const issues = validateSrdCompliance(formData, 'item');
        setSrdIssues(issues);

        // Update the SRD compliance flag
        setFormData(prev => ({
            ...prev,
            isSrdCompliant: issues.filter(issue => issue.severity === 'error').length === 0
        }));
    }, [formData.name, formData.description]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            // Handle nested properties like charges.hasCharges
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked :
                        type === 'number' ? parseInt(value) : value
                },
                updatedAt: new Date().toISOString()
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked :
                    type === 'number' ? parseInt(value) : value,
                updatedAt: new Date().toISOString()
            }));
        }
    };

    const handlePropertyAdd = () => {
        const newProperty = prompt('Enter a property for this item:');
        if (newProperty && newProperty.trim()) {
            setFormData(prev => ({
                ...prev,
                properties: [...prev.properties, newProperty.trim()],
                updatedAt: new Date().toISOString()
            }));
        }
    };

    const handlePropertyRemove = (index) => {
        setFormData(prev => ({
            ...prev,
            properties: prev.properties.filter((_, i) => i !== index),
            updatedAt: new Date().toISOString()
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isNew) {
                dispatch(addItem(formData));
            } else {
                dispatch(updateItem(formData));
            }

            setHasUnsavedChanges(false);
            navigate('/items');
        } catch (error) {
            console.error('Error saving:', error);
            setIsSubmitting(false);
        }
    };

    const handleDuplicate = () => {
        const duplicatedItem = {
            ...formData,
            id: uuidv4(),
            name: `${formData.name} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        dispatch(addItem(duplicatedItem));
        navigate(`/items/${duplicatedItem.id}`);
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            setConfirmLeave(true);
        } else {
            navigate('/items');
        }
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

    // Render the appropriate tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="form-label">Item Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="type" className="form-label">Item Type</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    {itemTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="rarity" className="form-label">Rarity</label>
                                <select
                                    id="rarity"
                                    name="rarity"
                                    value={formData.rarity}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    {rarities.map(rarity => (
                                        <option key={rarity.value} value={rarity.value}>
                                            {rarity.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="requiresAttunement"
                                name="requiresAttunement"
                                checked={formData.requiresAttunement}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <label htmlFor="requiresAttunement">Requires Attunement</label>
                        </div>

                        {formData.requiresAttunement && (
                            <div>
                                <label htmlFor="attunementRequirements" className="form-label">Attunement Requirements</label>
                                <input
                                    type="text"
                                    id="attunementRequirements"
                                    name="attunementRequirements"
                                    value={formData.attunementRequirements}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., by a spellcaster, by a paladin, etc."
                                />
                            </div>
                        )}

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="cursed"
                                name="cursed"
                                checked={formData.cursed}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <label htmlFor="cursed">Cursed Item</label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="charges.hasCharges"
                                name="charges.hasCharges"
                                checked={formData.charges.hasCharges}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <label htmlFor="charges.hasCharges">Has Charges</label>
                        </div>

                        {formData.charges.hasCharges && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                                <div>
                                    <label htmlFor="charges.maxCharges" className="form-label">Maximum Charges</label>
                                    <input
                                        type="number"
                                        id="charges.maxCharges"
                                        name="charges.maxCharges"
                                        value={formData.charges.maxCharges}
                                        onChange={handleChange}
                                        className="form-input"
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="charges.recharge" className="form-label">Recharge Condition</label>
                                    <input
                                        type="text"
                                        id="charges.recharge"
                                        name="charges.recharge"
                                        value={formData.charges.recharge}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="e.g., dawn, short rest, etc."
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="value" className="form-label">Value</label>
                                <input
                                    type="text"
                                    id="value"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., 500 gp"
                                />
                            </div>

                            <div>
                                <label htmlFor="weight" className="form-label">Weight</label>
                                <input
                                    type="text"
                                    id="weight"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., 3 lb."
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="form-label">Properties</label>
                                <button
                                    type="button"
                                    onClick={handlePropertyAdd}
                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    + Add Property
                                </button>
                            </div>

                            {formData.properties.length > 0 ? (
                                <ul className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                                    {formData.properties.map((property, index) => (
                                        <li key={index} className="flex justify-between items-center py-1">
                                            <span>{property}</span>
                                            <button
                                                type="button"
                                                onClick={() => handlePropertyRemove(index)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No properties added yet.</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-textarea h-32"
                                placeholder="Describe what the item does..."
                            />
                        </div>
                    </div>
                );

            case 'srd':
                return (
                    <div>
                        <SrdValidator issues={srdIssues} />
                    </div>
                );

            case 'preview':
                return (
                    <div className="item-card">
                        <h1 className="text-2xl font-medieval font-bold mb-2">{formData.name || 'Unnamed Item'}</h1>

                        <p className={`text-sm italic ${getRarityClass(formData.rarity)}`}>
                            {itemTypes.find(t => t.value === formData.type)?.label || 'Item'}, {rarities.find(r => r.value === formData.rarity)?.label || 'uncommon'}
                            {formData.requiresAttunement && (
                                formData.attunementRequirements
                                    ? ` (requires attunement by ${formData.attunementRequirements})`
                                    : ' (requires attunement)'
                            )}
                        </p>

                        {(formData.value || formData.weight) && (
                            <p className="text-sm mt-2">
                                {formData.value && <span>Value: {formData.value}</span>}
                                {formData.value && formData.weight && <span> | </span>}
                                {formData.weight && <span>Weight: {formData.weight}</span>}
                            </p>
                        )}

                        {formData.properties.length > 0 && (
                            <div className="mt-2">
                                <span className="font-bold">Properties:</span> {formData.properties.join(', ')}
                            </div>
                        )}

                        {formData.charges.hasCharges && (
                            <div className="mt-2">
                                <span className="font-bold">Charges:</span> {formData.charges.maxCharges} maximum
                                {formData.charges.recharge && `, regains ${formData.charges.recharge}`}
                            </div>
                        )}

                        {formData.cursed && (
                            <div className="mt-2 text-red-600 dark:text-red-400 font-bold">
                                This item is cursed.
                            </div>
                        )}

                        <div className="mt-4">
                            <p className="whitespace-pre-line">{formData.description}</p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button
                        onClick={handleCancel}
                        className="mr-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl font-medieval font-bold">{isNew ? 'Create New Magic Item' : 'Edit Magic Item'}</h1>
                </div>

                <div className="flex items-center space-x-2">
                    {!isNew && (
                        <button
                            type="button"
                            onClick={handleDuplicate}
                            className="btn btn-secondary"
                            title="Duplicate"
                        >
                            <DocumentDuplicateIcon className="h-5 w-5 mr-1" />
                            Duplicate
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn btn-secondary"
                        disabled={isSubmitting}
                    >
                        <XMarkIcon className="h-5 w-5 mr-1" />
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        <DocumentCheckIcon className="h-5 w-5 mr-1" />
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {srdIssues.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                SRD Compliance Issues Detected
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                <p>
                                    This item contains elements that might not be compliant with the SRD guidelines.
                                    Check the SRD tab for details.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="mb-6 border-b dark:border-gray-700">
                    <nav className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                                ? 'border-dnd-red text-dnd-red dark:text-red-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Details
                        </button>

                        <button
                            onClick={() => setActiveTab('srd')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'srd'
                                ? 'border-dnd-red text-dnd-red dark:text-red-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            SRD Compliance {srdIssues.length > 0 && `(${srdIssues.length})`}
                        </button>

                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'preview'
                                ? 'border-dnd-red text-dnd-red dark:text-red-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Preview
                        </button>
                    </nav>
                </div>

                <form onSubmit={handleSubmit}>
                    {renderTabContent()}
                </form>
            </div>

            {/* Confirmation Modal */}
            {confirmLeave && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4">Unsaved Changes</h3>
                        <p className="mb-4">
                            You have unsaved changes. Are you sure you want to leave?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmLeave(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setConfirmLeave(false);
                                    navigate('/items');
                                }}
                                className="btn btn-danger"
                            >
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemEditor;