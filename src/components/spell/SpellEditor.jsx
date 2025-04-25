// src/components/spell/SpellEditor.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
    addSpell,
    updateSpell,
    deleteSpell
} from '../../store/spellSlice';
import { validateSrdCompliance } from '../../utils/srdValidator';
import SrdValidator from '../srd/SrdValidator';
import {
    DocumentCheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    DocumentDuplicateIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const SpellEditor = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isNew = !id;

    // Get the spell data
    const spells = useSelector((state) => state.spell.spells);
    const spell = isNew ? null : spells.find(item => item.id === id);

    // Form state
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        level: 1,
        school: 'abjuration',
        castingTime: '1 action',
        range: '60 feet',
        components: {
            verbal: true,
            somatic: false,
            material: false,
            materials: '',
        },
        duration: 'Instantaneous',
        concentration: false,
        ritual: false,
        description: '',
        higherLevels: '',
        classes: [],
        source: 'Homebrew',
        createdAt: '',
        updatedAt: '',
        isSrdCompliant: true,
    });

    const [srdIssues, setSrdIssues] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Available spell schools
    const spellSchools = [
        { id: 'abjuration', name: 'Abjuration' },
        { id: 'conjuration', name: 'Conjuration' },
        { id: 'divination', name: 'Divination' },
        { id: 'enchantment', name: 'Enchantment' },
        { id: 'evocation', name: 'Evocation' },
        { id: 'illusion', name: 'Illusion' },
        { id: 'necromancy', name: 'Necromancy' },
        { id: 'transmutation', name: 'Transmutation' },
    ];

    // Available classes
    const availableClasses = [
        'Artificer', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'
    ];

    // If editing, populate form with existing data
    useEffect(() => {
        if (spell) {
            setFormData({
                ...spell,
                // Ensure the components object is complete
                components: {
                    verbal: spell.components?.verbal ?? false,
                    somatic: spell.components?.somatic ?? false,
                    material: spell.components?.material ?? false,
                    materials: spell.components?.materials ?? '',
                }
            });
        } else if (isNew) {
            setFormData({
                id: uuidv4(),
                name: '',
                level: 1,
                school: 'abjuration',
                castingTime: '1 action',
                range: '60 feet',
                components: {
                    verbal: true,
                    somatic: false,
                    material: false,
                    materials: '',
                },
                duration: 'Instantaneous',
                concentration: false,
                ritual: false,
                description: '',
                higherLevels: '',
                classes: [],
                source: 'Homebrew',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isSrdCompliant: true,
            });
        }
    }, [spell, isNew]);

    // Check if data has been modified
    useEffect(() => {
        if (spell) {
            const isChanged = JSON.stringify(spell) !== JSON.stringify(formData);
            setHasUnsavedChanges(isChanged);
        } else if (isNew) {
            const isPopulated = formData.name.trim() !== '' || formData.description.trim() !== '';
            setHasUnsavedChanges(isPopulated);
        }
    }, [formData, spell, isNew]);

    // Validate SRD compliance
    useEffect(() => {
        const issues = validateSrdCompliance(formData, 'spell');
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
            // Handle nested properties like components.verbal
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
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

    const handleClassToggle = (className) => {
        setFormData(prev => {
            const currentClasses = [...prev.classes];

            if (currentClasses.includes(className)) {
                return {
                    ...prev,
                    classes: currentClasses.filter(c => c !== className),
                    updatedAt: new Date().toISOString()
                };
            } else {
                return {
                    ...prev,
                    classes: [...currentClasses, className],
                    updatedAt: new Date().toISOString()
                };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isNew) {
                dispatch(addSpell(formData));
            } else {
                dispatch(updateSpell(formData));
            }

            setHasUnsavedChanges(false);
            navigate('/spells');
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

        dispatch(addSpell(duplicatedItem));
        navigate(`/spells/${duplicatedItem.id}`);
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            setConfirmLeave(true);
        } else {
            navigate('/spells');
        }
    };

    // Format spell components as a string (e.g., "V, S, M (a glass eye)")
    const formatComponents = (components) => {
        if (!components) return '';

        const parts = [];
        if (components.verbal) parts.push('V');
        if (components.somatic) parts.push('S');
        if (components.material) {
            if (components.materials) {
                parts.push(`M (${components.materials})`);
            } else {
                parts.push('M');
            }
        }

        return parts.join(', ');
    };

    // Render the appropriate tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="form-label">Spell Name</label>
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="level" className="form-label">Level</label>
                                <select
                                    id="level"
                                    name="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="0">Cantrip</option>
                                    <option value="1">1st</option>
                                    <option value="2">2nd</option>
                                    <option value="3">3rd</option>
                                    <option value="4">4th</option>
                                    <option value="5">5th</option>
                                    <option value="6">6th</option>
                                    <option value="7">7th</option>
                                    <option value="8">8th</option>
                                    <option value="9">9th</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="school" className="form-label">School</label>
                                <select
                                    id="school"
                                    name="school"
                                    value={formData.school}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    {spellSchools.map(school => (
                                        <option key={school.id} value={school.id}>
                                            {school.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="castingTime" className="form-label">Casting Time</label>
                                <input
                                    type="text"
                                    id="castingTime"
                                    name="castingTime"
                                    value={formData.castingTime}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., 1 action, 1 minute"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="range" className="form-label">Range</label>
                                <input
                                    type="text"
                                    id="range"
                                    name="range"
                                    value={formData.range}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., 60 feet, Self, Touch"
                                />
                            </div>

                            <div>
                                <label htmlFor="duration" className="form-label">Duration</label>
                                <input
                                    type="text"
                                    id="duration"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., Instantaneous, 1 minute"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="form-label">Components</span>
                                <div className="mt-1 space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="components.verbal"
                                            name="components.verbal"
                                            checked={formData.components.verbal}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        <label htmlFor="components.verbal">Verbal (V)</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="components.somatic"
                                            name="components.somatic"
                                            checked={formData.components.somatic}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        <label htmlFor="components.somatic">Somatic (S)</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="components.material"
                                            name="components.material"
                                            checked={formData.components.material}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        <label htmlFor="components.material">Material (M)</label>
                                    </div>

                                    {formData.components.material && (
                                        <div className="pl-6">
                                            <label htmlFor="components.materials" className="form-label text-sm">Material Components</label>
                                            <input
                                                type="text"
                                                id="components.materials"
                                                name="components.materials"
                                                value={formData.components.materials}
                                                onChange={handleChange}
                                                className="form-input"
                                                placeholder="e.g., a pinch of sulfur"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <span className="form-label">Options</span>
                                <div className="mt-1 space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="concentration"
                                            name="concentration"
                                            checked={formData.concentration}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        <label htmlFor="concentration">Concentration</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="ritual"
                                            name="ritual"
                                            checked={formData.ritual}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        <label htmlFor="ritual">Ritual</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-textarea h-32"
                                placeholder="Describe what the spell does..."
                            />
                        </div>

                        <div>
                            <label htmlFor="higherLevels" className="form-label">At Higher Levels</label>
                            <textarea
                                id="higherLevels"
                                name="higherLevels"
                                value={formData.higherLevels}
                                onChange={handleChange}
                                className="form-textarea h-24"
                                placeholder="Describe what happens when the spell is cast using a higher level spell slot..."
                            />
                        </div>

                        <div>
                            <span className="form-label">Classes</span>
                            <div className="mt-1 grid grid-cols-2 md:grid-cols-3 gap-2">
                                {availableClasses.map(className => (
                                    <div key={className} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`class-${className}`}
                                            checked={formData.classes.includes(className)}
                                            onChange={() => handleClassToggle(className)}
                                            className="mr-2"
                                        />
                                        <label htmlFor={`class-${className}`}>{className}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="source" className="form-label">Source</label>
                            <input
                                type="text"
                                id="source"
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., Homebrew, Adventure Name"
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
                    <div className="spell-card">
                        <h1 className="text-2xl font-medieval font-bold mb-2">{formData.name || 'Unnamed Spell'}</h1>

                        <p className="text-sm italic">
                            {formData.level === 0 ? 'Cantrip' : `Level ${formData.level}`} {formData.school}
                            {formData.ritual && ' (ritual)'}
                        </p>

                        <div className="mt-4 space-y-2">
                            <div>
                                <span className="font-bold">Casting Time:</span> {formData.castingTime}
                            </div>
                            <div>
                                <span className="font-bold">Range:</span> {formData.range}
                            </div>
                            <div>
                                <span className="font-bold">Components:</span> {formatComponents(formData.components)}
                            </div>
                            <div>
                                <span className="font-bold">Duration:</span> {formData.concentration ? 'Concentration, ' : ''}{formData.duration}
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="whitespace-pre-line">{formData.description}</p>
                        </div>

                        {formData.higherLevels && (
                            <div className="mt-4">
                                <span className="font-bold">At Higher Levels:</span> {formData.higherLevels}
                            </div>
                        )}

                        {formData.classes.length > 0 && (
                            <div className="mt-4">
                                <span className="font-bold">Classes:</span> {formData.classes.join(', ')}
                            </div>
                        )}
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
                    <h1 className="text-2xl font-medieval font-bold">{isNew ? 'Create New Spell' : 'Edit Spell'}</h1>
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
                                    This spell contains elements that might not be compliant with the SRD guidelines.
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
                                    navigate('/spells');
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

export default SpellEditor;