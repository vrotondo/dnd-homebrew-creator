import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
    addCharacter,
    updateCharacter,
    addCustomClass,
    updateCustomClass,
    addCustomRace,
    updateCustomRace,
    addCustomBackground,
    updateCustomBackground,
    addCustomFeat,
    updateCustomFeat
} from '../../store/characterSlice';
import SrdValidator from '../srd/SrdValidator';
import {
    SaveIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    DocumentDuplicateIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

const CharacterEditor = ({ type = 'character' }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isNew = !id;

    // Get the appropriate data and actions based on the type
    let items = [];
    let title = '';
    let listPath = '';
    let addAction = null;
    let updateAction = null;

    switch (type) {
        case 'class':
            items = useSelector((state) => state.character.customClasses);
            title = isNew ? 'Create New Class' : 'Edit Class';
            listPath = '/classes';
            addAction = addCustomClass;
            updateAction = updateCustomClass;
            break;
        case 'race':
            items = useSelector((state) => state.character.customRaces);
            title = isNew ? 'Create New Race' : 'Edit Race';
            listPath = '/races';
            addAction = addCustomRace;
            updateAction = updateCustomRace;
            break;
        case 'background':
            items = useSelector((state) => state.character.customBackgrounds);
            title = isNew ? 'Create New Background' : 'Edit Background';
            listPath = '/backgrounds';
            addAction = addCustomBackground;
            updateAction = updateCustomBackground;
            break;
        case 'feat':
            items = useSelector((state) => state.character.customFeats);
            title = isNew ? 'Create New Feat' : 'Edit Feat';
            listPath = '/feats';
            addAction = addCustomFeat;
            updateAction = updateCustomFeat;
            break;
        default:
            items = useSelector((state) => state.character.characters);
            title = isNew ? 'Create New Character' : 'Edit Character';
            listPath = '/characters';
            addAction = addCharacter;
            updateAction = updateCharacter;
    }

    // Find the item if editing
    const item = isNew ? null : items.find(item => item.id === id);

    // Form state
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        createdAt: '',
        updatedAt: '',
        isSrdCompliant: true,
        // Additional fields will vary by type
        // These are just base fields all types share
    });

    const [srdIssues, setSrdIssues] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // If editing, populate form with existing data
    useEffect(() => {
        if (item) {
            setFormData({
                ...item,
            });
        } else if (isNew) {
            setFormData({
                id: uuidv4(),
                name: '',
                description: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isSrdCompliant: true,
                // Initialize type-specific fields
                ...(type === 'character' && {
                    level: 1,
                    race: '',
                    class: '',
                    background: '',
                    alignment: '',
                    stats: {
                        strength: 10,
                        dexterity: 10,
                        constitution: 10,
                        intelligence: 10,
                        wisdom: 10,
                        charisma: 10
                    },
                    hitPoints: 0,
                    armorClass: 10,
                    speed: 30,
                    proficiencies: [],
                    equipment: [],
                    features: [],
                    spells: []
                }),
                ...(type === 'class' && {
                    hitDie: 'd8',
                    primaryAbility: 'strength',
                    savingThrowProficiencies: [],
                    armorProficiencies: [],
                    weaponProficiencies: [],
                    toolProficiencies: [],
                    skillProficiencies: [],
                    features: [],
                    subclasses: []
                }),
                ...(type === 'race' && {
                    size: 'medium',
                    speed: 30,
                    abilityScoreIncrease: [],
                    traits: [],
                    languages: [],
                    subraces: []
                }),
                ...(type === 'background' && {
                    skillProficiencies: [],
                    toolProficiencies: [],
                    languages: [],
                    equipment: [],
                    feature: {
                        name: '',
                        description: ''
                    },
                    personalityTraits: [],
                    ideals: [],
                    bonds: [],
                    flaws: []
                }),
                ...(type === 'feat' && {
                    prerequisites: [],
                    effects: []
                })
            });
        }
    }, [item, isNew, type]);

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

    // Validate SRD compliance (placeholder for actual validation)
    useEffect(() => {
        // This would be replaced with actual SRD validation logic
        const issues = [];

        // Example validation specific to each type
        if (type === 'class') {
            // Check for non-SRD features
            if (formData.features && formData.features.some(feature => !feature.isSrdCompliant)) {
                issues.push({
                    severity: 'error',
                    message: 'Some class features reference non-SRD content'
                });
            }
        } else if (type === 'race') {
            // Check for non-SRD traits
            if (formData.traits && formData.traits.some(trait => !trait.isSrdCompliant)) {
                issues.push({
                    severity: 'error',
                    message: 'Some racial traits reference non-SRD content'
                });
            }
        }

        // Common validation for all types
        if (formData.name && formData.name.includes('Tasha') || formData.name.includes('Xanathar')) {
            issues.push({
                severity: 'error',
                message: 'Name references non-SRD content'
            });
        }

        setSrdIssues(issues);

        // Update the SRD compliance flag
        setFormData(prev => ({
            ...prev,
            isSrdCompliant: issues.filter(issue => issue.severity === 'error').length === 0
        }));
    }, [formData, type]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            updatedAt: new Date().toISOString()
        }));
    };

    const handleNestedChange = (category, field, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            },
            updatedAt: new Date().toISOString()
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isNew) {
                dispatch(addAction(formData));
            } else {
                dispatch(updateAction(formData));
            }

            setHasUnsavedChanges(false);
            navigate(listPath);
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

        dispatch(addAction(duplicatedItem));
        navigate(`${listPath}/${duplicatedItem.id}`);
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            setConfirmLeave(true);
        } else {
            navigate(listPath);
        }
    };

    // Render the appropriate tab content based on the type
    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="form-label">Name</label>
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

                        <div className="mt-4">
                            <h3 className="text-lg font-medium mb-2">Ability Scores</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map((ability) => (
                                    <div key={ability} className="text-center">
                                        <label htmlFor={ability} className="form-label capitalize">{ability}</label>
                                        <input
                                            type="number"
                                            id={ability}
                                            value={formData.stats?.[ability] || 10}
                                            onChange={(e) => handleNestedChange('stats', ability, parseInt(e.target.value))}
                                            min="1"
                                            max="30"
                                            className="form-input text-center"
                                        />
                                        <div className="text-sm mt-1">
                                            {Math.floor((formData.stats?.[ability] - 10) / 2) >= 0 ? '+' : ''}
                                            {Math.floor((formData.stats?.[ability] - 10) / 2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label htmlFor="hitPoints" className="form-label">Hit Points</label>
                                <input
                                    type="number"
                                    id="hitPoints"
                                    name="hitPoints"
                                    value={formData.hitPoints || 0}
                                    onChange={handleChange}
                                    min="0"
                                    className="form-input"
                                />
                            </div>

                            <div>
                                <label htmlFor="armorClass" className="form-label">Armor Class</label>
                                <input
                                    type="number"
                                    id="armorClass"
                                    name="armorClass"
                                    value={formData.armorClass || 10}
                                    onChange={handleChange}
                                    min="0"
                                    className="form-input"
                                />
                            </div>

                            <div>
                                <label htmlFor="speed" className="form-label">Speed</label>
                                <input
                                    type="number"
                                    id="speed"
                                    name="speed"
                                    value={formData.speed || 30}
                                    onChange={handleChange}
                                    min="0"
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </>
                );

            case 'class':
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

                        <div className="mt-4">
                            <h3 className="text-lg font-medium mb-2">Class Features</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                Add key features that define this class. Remember to only include SRD-compliant content if you plan to share this.
                            </p>

                            {/* Class features would be implemented with a dynamic list */}
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                                <p className="text-center text-gray-500 dark:text-gray-400">
                                    Class feature editor will be implemented here
                                </p>
                            </div>
                        </div>
                    </>
                );

            case 'race':
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="size" className="form-label">Size</label>
                                <select
                                    id="size"
                                    name="size"
                                    value={formData.size || 'medium'}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="tiny">Tiny</option>
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                    <option value="huge">Huge</option>
                                    <option value="gargantuan">Gargantuan</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="speed" className="form-label">Base Speed</label>
                                <input
                                    type="number"
                                    id="speed"
                                    name="speed"
                                    value={formData.speed || 30}
                                    onChange={handleChange}
                                    min="0"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-lg font-medium mb-2">Racial Traits</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                Add traits that are unique to this race. Remember to only include SRD-compliant content if you plan to share this.
                            </p>

                            {/* Racial traits would be implemented with a dynamic list */}
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                                <p className="text-center text-gray-500 dark:text-gray-400">
                                    Racial trait editor will be implemented here
                                </p>
                            </div>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    // Render a preview of the item
    const renderPreview = () => {
        switch (type) {
            case 'character':
                return (
                    <div className="character-sheet">
                        <h2 className="character-name">{formData.name || 'Unnamed Character'}</h2>

                        <div className="character-details">
                            <div>
                                <span className="font-medium">Race:</span> {formData.race || 'Unknown'}
                            </div>
                            <div>
                                <span className="font-medium">Class:</span> {formData.class || 'Unknown'} {formData.level ? `(Level ${formData.level})` : ''}
                            </div>
                            <div>
                                <span className="font-medium">Background:</span> {formData.background || 'Unknown'}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                                <div className="text-center font-medium">Hit Points</div>
                                <div className="text-center text-xl">{formData.hitPoints || 0}</div>
                            </div>
                            <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                                <div className="text-center font-medium">Armor Class</div>
                                <div className="text-center text-xl">{formData.armorClass || 10}</div>
                            </div>
                            <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                                <div className="text-center font-medium">Speed</div>
                                <div className="text-center text-xl">{formData.speed || 30} ft</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-4">
                            {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map((ability) => (
                                <div key={ability} className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm text-center">
                                    <div className="font-medium capitalize">{ability.slice(0, 3)}</div>
                                    <div className="text-xl">{formData.stats?.[ability] || 10}</div>
                                    <div className="text-sm">
                                        {Math.floor((formData.stats?.[ability] - 10) / 2) >= 0 ? '+' : ''}
                                        {Math.floor((formData.stats?.[ability] - 10) / 2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {formData.description && (
                            <div className="mb-4">
                                <h3 className="text-lg font-medium mb-2">Description</h3>
                                <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                                    {formData.description}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'class':
                return (
                    <div className="stat-block">
                        <h1>{formData.name || 'Unnamed Class'}</h1>

                        <div className="property-line">
                            <span className="property-name">Hit Die:</span> {formData.hitDie || 'd8'}
                        </div>

                        <div className="property-line">
                            <span className="property-name">Primary Ability:</span> {formData.primaryAbility ? formData.primaryAbility.charAt(0).toUpperCase() + formData.primaryAbility.slice(1) : 'Strength'}
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
                                formData.features.map((feature, index) => (
                                    <div key={index} className="mt-2">
                                        <span className="action-name">{feature.name}.</span> {feature.description}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 italic">No class features added yet.</p>
                            )}
                        </div>
                    </div>
                );

            case 'race':
                return (
                    <div className="stat-block">
                        <h1>{formData.name || 'Unnamed Race'}</h1>

                        <div className="property-line">
                            <span className="property-name">Size:</span> {formData.size ? formData.size.charAt(0).toUpperCase() + formData.size.slice(1) : 'Medium'}
                        </div>

                        <div className="property-line">
                            <span className="property-name">Speed:</span> {formData.speed || 30} ft.
                        </div>

                        {formData.description && (
                            <div className="mt-4">
                                <div className="actions-header">Description</div>
                                <p>{formData.description}</p>
                            </div>
                        )}

                        <div className="mt-4">
                            <div className="actions-header">Traits</div>
                            {formData.traits && formData.traits.length > 0 ? (
                                formData.traits.map((trait, index) => (
                                    <div key={index} className="mt-2">
                                        <span className="action-name">{trait.name}.</span> {trait.description}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 italic">No racial traits added yet.</p>
                            )}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-2">{formData.name || 'Unnamed Item'}</h2>
                        <p>{formData.description || 'No description'}</p>
                    </div>
                );
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
                    <h1 className="text-2xl font-medieval font-bold">{title}</h1>
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
                                    This {type} contains elements that might not be compliant with the SRD guidelines.
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
                                    navigate(listPath);
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

export default CharacterEditor;
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

{/* Type-specific form fields would be added here */ }
{ renderTypeSpecificFields() }
          </div >
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

// Render fields specific to the item type
const renderTypeSpecificFields = () => {
    switch (type) {
        case 'character':
            return (
          <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="race" className="form-label">Race</label>
                            <input
                                type="text"
                                id="race"
                                name="race"
                                value={formData.race || ''}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="class" className="form-label">Class</label>
                            <input
                                type="text"
                                id="class"
                                name="class"
                                value={formData.class || ''}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="level" className="form-label">Level</label>
                            <input
                                type="number"
                                id="level"
                                name="level"
                                value={formData.level || 1}
                                onChange={handleChange}
                                min="1"
                                max="20"
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="background" className="form-label">Background</label>
                            <input
                                type="text"
                                id="background"
                                name="background"
                                value={formData.background || ''}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                    </div>