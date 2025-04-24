import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
    addCustomClass,
    updateCustomClass
} from '../../store/characterSlice';
import SrdValidator from '../srd/SrdValidator';
import {
    SaveIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    DocumentDuplicateIcon,
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const ClassEditor = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isNew = !id;

    // Get the class data
    const customClasses = useSelector((state) => state.character.customClasses);
    const classItem = isNew ? null : customClasses.find(item => item.id === id);

    // Form state
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        createdAt: '',
        updatedAt: '',
        isSrdCompliant: true,
        hitDie: 'd8',
        primaryAbility: 'strength',
        savingThrowProficiencies: [],
        armorProficiencies: [],
        weaponProficiencies: [],
        toolProficiencies: [],
        skillProficiencies: [],
        features: [],
        subclasses: []
    });

    const [srdIssues, setSrdIssues] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // If editing, populate form with existing data
    useEffect(() => {
        if (classItem) {
            setFormData({
                ...classItem,
            });
        } else if (isNew) {
            setFormData({
                id: uuidv4(),
                name: '',
                description: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isSrdCompliant: true,
                hitDie: 'd8',
                primaryAbility: 'strength',
                savingThrowProficiencies: [],
                armorProficiencies: [],
                weaponProficiencies: [],
                toolProficiencies: [],
                skillProficiencies: [],
                features: [],
                subclasses: []
            });
        }
    }, [classItem, isNew]);

    // Check if data has been modified
    useEffect(() => {
        if (classItem) {
            const isChanged = JSON.stringify(classItem) !== JSON.stringify(formData);
            setHasUnsavedChanges(isChanged);
        } else if (isNew) {
            const isPopulated = formData.name.trim() !== '' || formData.description.trim() !== '';
            setHasUnsavedChanges(isPopulated);
        }
    }, [formData, classItem, isNew]);

    // Validate SRD compliance
    useEffect(() => {
        // This would be replaced with actual SRD validation logic
        const issues = [];

        // Example validation
        if (formData.name && formData.name.includes('Artificer')) {
            issues.push({
                severity: 'error',
                message: 'The Artificer class is not part of the SRD content'
            });
        }

        // Check for non-SRD features
        if (formData.features && formData.features.some(feature => !feature.isSrdCompliant)) {
            issues.push({
                severity: 'error',
                message: 'Some class features reference non-SRD content'
            });
        }

        // Common validation for all types
        if (formData.name &&
            (formData.name.includes('Hexblade') ||
                formData.name.includes('Echo Knight') ||
                formData.name.includes('Bladesinger'))
        ) {
            issues.push({
                severity: 'error',
                message: 'Name references protected D&D content that is not in the SRD'
            });
        }

        setSrdIssues(issues);

        // Update the SRD compliance flag
        setFormData(prev => ({
            ...prev,
            isSrdCompliant: issues.filter(issue => issue.severity === 'error').length === 0
        }));
    }, [formData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            updatedAt: new Date().toISOString()
        }));
    };

    const handleArrayChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
            updatedAt: new Date().toISOString()
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isNew) {
                dispatch(addCustomClass(formData));
            } else {
                dispatch(updateCustomClass(formData));
            }

            setHasUnsavedChanges(false);
            navigate('/classes');
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

        dispatch(addCustomClass(duplicatedItem));
        navigate(`/classes/${duplicatedItem.id}`);
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            setConfirmLeave(true);
        } else {
            navigate('/classes');
        }
    };

    // Add feature to class
    const handleAddFeature = () => {
        const newFeature = {
            id: uuidv4(),
            name: 'New Feature',
            level: 1,
            description: '',
            isSrdCompliant: true
        };

        setFormData(prev => ({
            ...prev,
            features: [...prev.features, newFeature],
            updatedAt: new Date().toISOString()
        }));
    };

    // Remove feature from class
    const handleRemoveFeature = (featureId) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter(feature => feature.id !== featureId),
            updatedAt: new Date().toISOString()
        }));
    };

    // Update feature
    const handleUpdateFeature = (featureId, field, value) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.map(feature =>
                feature.id === featureId
                    ? { ...feature, [field]: value }
                    : feature
            ),
            updatedAt: new Date().toISOString()
        }));
    };

    // Render the appropriate tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="form-label">Class Name</label>
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

                        <div>
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-textarea h-32"
                            />
                        </div>

                        {renderClassSpecificFields()}
                    </div>
                );

            case 'features':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-medium">Class Features</h2>
                            <button
                                type="button"
                                onClick={handleAddFeature}
                                className="btn btn-primary"
                            >
                                <PlusIcon className="h-5 w-5 mr-1" />
                                Add Feature
                            </button>
                        </div>

                        {formData.features.length > 0 ? (
                            <div className="space-y-4">
                                {formData.features.map((feature) => (
                                    <div
                                        key={feature.id}
                                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <input
                                                type="text"
                                                value={feature.name}
                                                onChange={(e) => handleUpdateFeature(feature.id, 'name', e.target.value)}
                                                className="form-input font-medium text-lg"
                                                placeholder="Feature Name"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFeature(feature.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="form-label">Level</label>
                                                <input
                                                    type="number"
                                                    value={feature.level}
                                                    onChange={(e) => handleUpdateFeature(feature.id, 'level', parseInt(e.target.value))}
                                                    className="form-input"
                                                    min="1"
                                                    max="20"
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={feature.isSrdCompliant}
                                                    onChange={(e) => handleUpdateFeature(feature.id, 'isSrdCompliant', e.target.checked)}
                                                    className="mr-2"
                                                />
                                                <span>SRD Compliant</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="form-label">Description</label>
                                            <textarea
                                                value={feature.description}
                                                onChange={(e) => handleUpdateFeature(feature.id, 'description', e.target.value)}
                                                className="form-textarea h-24"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No features added yet. Click the "Add Feature" button to add your first class feature.
                                </p>
                            </div>
                        )}
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
                    <div>
                        {renderPreview()}
                    </div>
                );

            default:
                return null;
        }
    };

    // Render fields specific to the class
    const renderClassSpecificFields = () => {
        return (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="hitDie" className="form-label">Hit Die</label>
                        <select
                            id="hitDie"
                            name="hitDie"
                            value={formData.hitDie || 'd8'}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="d6">d6</option>
                            <option value="d8">d8</option>
                            <option value="d10">d10</option>
                            <option value="d12">d12</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="primaryAbility" className="form-label">Primary Ability</label>
                        <select
                            id="primaryAbility"
                            name="primaryAbility"
                            value={formData.primaryAbility || 'strength'}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="strength">Strength</option>
                            <option value="dexterity">Dexterity</option>
                            <option value="constitution">Constitution</option>
                            <option value="intelligence">Intelligence</option>
                            <option value="wisdom">Wisdom</option>
                            <option value="charisma">Charisma</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="form-label">Saving Throw Proficiencies</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map((ability) => (
                            <div key={ability} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`save-${ability}`}
                                    checked={formData.savingThrowProficiencies?.includes(ability) || false}
                                    onChange={(e) => {
                                        const newProficiencies = e.target.checked
                                            ? [...(formData.savingThrowProficiencies || []), ability]
                                            : (formData.savingThrowProficiencies || []).filter(a => a !== ability);
                                        handleArrayChange('savingThrowProficiencies', newProficiencies);
                                    }}
                                    className="mr-2"
                                />
                                <label htmlFor={`save-${ability}`} className="capitalize">{ability}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="form-label">Armor Proficiencies</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['light', 'medium', 'heavy', 'shields'].map((armor) => (
                            <div key={armor} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`armor-${armor}`}
                                    checked={formData.armorProficiencies?.includes(armor) || false}
                                    onChange={(e) => {
                                        const newProficiencies = e.target.checked
                                            ? [...(formData.armorProficiencies || []), armor]
                                            : (formData.armorProficiencies || []).filter(a => a !== armor);
                                        handleArrayChange('armorProficiencies', newProficiencies);
                                    }}
                                    className="mr-2"
                                />
                                <label htmlFor={`armor-${armor}`} className="capitalize">{armor}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="form-label">Weapon Proficiencies</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {['simple', 'martial'].map((weapon) => (
                            <div key={weapon} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`weapon-${weapon}`}
                                    checked={formData.weaponProficiencies?.includes(weapon) || false}
                                    onChange={(e) => {
                                        const newProficiencies = e.target.checked
                                            ? [...(formData.weaponProficiencies || []), weapon]
                                            : (formData.weaponProficiencies || []).filter(w => w !== weapon);
                                        handleArrayChange('weaponProficiencies', newProficiencies);
                                    }}
                                    className="mr-2"
                                />
                                <label htmlFor={`weapon-${weapon}`} className="capitalize">{weapon} weapons</label>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    // Render a preview of the class
    const renderPreview = () => {
        return (
            <div className="stat-block">
                <h1>{formData.name || 'Unnamed Class'}</h1>

                <div className="property-line">
                    <span className="property-name">Hit Die:</span> {formData.hitDie || 'd8'}
                </div>

                <div className="property-line">
                    <span className="property-name">Primary Ability:</span> {formData.primaryAbility ? formData.primaryAbility.charAt(0).toUpperCase() + formData.primaryAbility.slice(1) : 'Strength'}
                </div>

                <div className="property-line">
                    <span className="property-name">Saving Throws:</span> {
                        formData.savingThrowProficiencies?.length
                            ? formData.savingThrowProficiencies.map(save => save.charAt(0).toUpperCase() + save.slice(1)).join(', ')
                            : 'None'
                    }
                </div>

                <div className="property-line">
                    <span className="property-name">Armor:</span> {
                        formData.armorProficiencies?.length
                            ? formData.armorProficiencies.map(armor => armor.charAt(0).toUpperCase() + armor.slice(1)).join(', ')
                            : 'None'
                    }
                </div>

                <div className="property-line">
                    <span className="property-name">Weapons:</span> {
                        formData.weaponProficiencies?.length
                            ? formData.weaponProficiencies.map(weapon => weapon.charAt(0).toUpperCase() + weapon.slice(1) + ' weapons').join(', ')
                            : 'None'
                    }
                </div>

                {formData.description && (
                    <div className="mt-4">
                        <div className="actions-header">Description</div>
                        <p>{formData.description}</p>
                    </div>
                )}

                <div className="mt-4">
                    <div className="actions-header">Class Features</div>
                    {formData.features && formData.features.length > 0 ? (
                        formData.features.sort((a, b) => a.level - b.level).map((feature) => (
                            <div key={feature.id} className="mt-2">
                                <span className="action-name">{feature.name} (Level {feature.level}).</span> {feature.description}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">No class features added yet.</p>
                    )}
                </div>
            </div>
        );
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
                    <h1 className="text-2xl font-medieval font-bold">{isNew ? 'Create New Class' : 'Edit Class'}</h1>
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
                        <SaveIcon className="h-5 w-5 mr-1" />
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
                                    This class contains elements that might not be compliant with the SRD guidelines.
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
                            onClick={() => setActiveTab('features')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'features'
                                    ? 'border-dnd-red text-dnd-red dark:text-red-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Features
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
                                    navigate('/classes');
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

export default ClassEditor;