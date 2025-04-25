import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
    addWorld,
    updateWorld,
    addRegion,
    updateRegion,
    addLocation,
    updateLocation,
    addFaction,
    updateFaction,
    addNpc,
    updateNpc
} from '../../store/worldSlice';
import SrdValidator from '../srd/SrdValidator';
import {
    DocumentCheckIcon, // Using DocumentCheckIcon instead of SaveIcon
    XMarkIcon,
    ExclamationTriangleIcon,
    DocumentDuplicateIcon,
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const WorldEditor = ({ type = 'world' }) => {
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
        case 'region':
            items = useSelector((state) => state.world.regions);
            title = isNew ? 'Create New Region' : 'Edit Region';
            listPath = '/regions';
            addAction = addRegion;
            updateAction = updateRegion;
            break;
        case 'location':
            items = useSelector((state) => state.world.locations);
            title = isNew ? 'Create New Location' : 'Edit Location';
            listPath = '/locations';
            addAction = addLocation;
            updateAction = updateLocation;
            break;
        case 'faction':
            items = useSelector((state) => state.world.factions);
            title = isNew ? 'Create New Faction' : 'Edit Faction';
            listPath = '/factions';
            addAction = addFaction;
            updateAction = updateFaction;
            break;
        case 'npc':
            items = useSelector((state) => state.world.npcs);
            title = isNew ? 'Create New NPC' : 'Edit NPC';
            listPath = '/npcs';
            addAction = addNpc;
            updateAction = updateNpc;
            break;
        default:
            items = useSelector((state) => state.world.worlds);
            title = isNew ? 'Create New World' : 'Edit World';
            listPath = '/worlds';
            addAction = addWorld;
            updateAction = updateWorld;
    }

    // Find the item if editing
    const item = isNew ? null : items.find(item => item.id === id);

    // Related data for relationships
    const worlds = useSelector((state) => state.world.worlds);
    const regions = useSelector((state) => state.world.regions);
    const factions = useSelector((state) => state.world.factions);

    // Form state
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        imageUrl: '',
        createdAt: '',
        updatedAt: '',
        isSrdCompliant: true,
        // Additional fields will vary by type
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
                imageUrl: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isSrdCompliant: true,
                // Initialize type-specific fields
                ...(type === 'world' && {
                    genre: 'fantasy',
                    cosmology: '',
                    history: '',
                    calendar: '',
                    politics: '',
                    magic: '',
                    regions: [],
                    deities: []
                }),
                ...(type === 'region' && {
                    worldId: '',
                    climate: '',
                    terrain: '',
                    population: '',
                    government: '',
                    notableLocations: [],
                    notableFactions: []
                }),
                ...(type === 'location' && {
                    worldId: '',
                    regionId: '',
                    locationType: 'settlement',
                    population: '',
                    government: '',
                    economy: '',
                    defenses: '',
                    notableNpcs: []
                }),
                ...(type === 'faction' && {
                    worldId: '',
                    factionType: 'guild',
                    alignment: '',
                    goals: '',
                    resources: '',
                    allies: [],
                    enemies: [],
                    members: []
                }),
                ...(type === 'npc' && {
                    worldId: '',
                    race: '',
                    class: '',
                    occupation: '',
                    alignment: '',
                    personality: '',
                    appearance: '',
                    relationships: [],
                    motivations: '',
                    secrets: ''
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

        // Common validation for all types
        if (formData.name && (
            formData.name.includes('Forgotten Realms') ||
            formData.name.includes('Eberron') ||
            formData.name.includes('Ravenloft') ||
            formData.name.includes('Dragonlance')
        )) {
            issues.push({
                severity: 'error',
                message: 'Name references a protected D&D setting that is not in the SRD.'
            });
        }

        // Check description for mentions of protected content
        const protectedTerms = [
            'Drizzt', 'Elminster', 'Strahd', 'Minsc', 'Boo', 'Mordenkainen',
            'Waterdeep', 'Baldur\'s Gate', 'Neverwinter', 'Shadowfell', 'Feywild'
        ];

        for (const term of protectedTerms) {
            if (formData.description && formData.description.includes(term)) {
                issues.push({
                    severity: 'error',
                    message: `Description references "${term}", which is protected content not in the SRD.`
                });
                break;
            }
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

    // Add item to array field
    const handleAddArrayItem = (fieldName, item) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: [...(prev[fieldName] || []), item],
            updatedAt: new Date().toISOString()
        }));
    };

    // Remove item from array field
    const handleRemoveArrayItem = (fieldName, index) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: prev[fieldName].filter((_, i) => i !== index),
            updatedAt: new Date().toISOString()
        }));
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

                        <div>
                            <label htmlFor="imageUrl" className="form-label">Image URL</label>
                            <input
                                type="text"
                                id="imageUrl"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {/* Type-specific form fields */}
                        {renderTypeSpecificFields()}
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

    // Render fields specific to the item type
    const renderTypeSpecificFields = () => {
        switch (type) {
            case 'world':
                return (
                    <div className="space-y-4 mt-4">
                        <div>
                            <label htmlFor="genre" className="form-label">Genre</label>
                            <select
                                id="genre"
                                name="genre"
                                value={formData.genre || 'fantasy'}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="fantasy">Fantasy</option>
                                <option value="high-fantasy">High Fantasy</option>
                                <option value="low-fantasy">Low Fantasy</option>
                                <option value="dark-fantasy">Dark Fantasy</option>
                                <option value="steampunk">Steampunk</option>
                                <option value="sci-fi">Science Fiction</option>
                                <option value="post-apocalyptic">Post-Apocalyptic</option>
                                <option value="mythological">Mythological</option>
                                <option value="historical">Historical</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="cosmology" className="form-label">Cosmology</label>
                            <textarea
                                id="cosmology"
                                name="cosmology"
                                value={formData.cosmology || ''}
                                onChange={handleChange}
                                className="form-textarea h-24"
                                placeholder="Describe the planes, realms, and cosmic structure of your world..."
                            />
                        </div>

                        <div>
                            <label htmlFor="history" className="form-label">History</label>
                            <textarea
                                id="history"
                                name="history"
                                value={formData.history || ''}
                                onChange={handleChange}
                                className="form-textarea h-24"
                                placeholder="Describe the major historical events that shaped your world..."
                            />
                        </div>

                        <div>
                            <label htmlFor="magic" className="form-label">Magic System</label>
                            <textarea
                                id="magic"
                                name="magic"
                                value={formData.magic || ''}
                                onChange={handleChange}
                                className="form-textarea h-24"
                                placeholder="Describe how magic works in your world..."
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Regions</h3>
                            {formData.regions && formData.regions.length > 0 ? (
                                <ul className="space-y-2 mb-2">
                                    {formData.regions.map((region, index) => (
                                        <li key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                            <span>{region.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveArrayItem('regions', index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 mb-2">No regions added yet.</p>
                            )}

                            <button
                                type="button"
                                onClick={() => handleAddArrayItem('regions', { id: uuidv4(), name: 'New Region' })}
                                className="btn btn-secondary"
                            >
                                <PlusIcon className="h-5 w-5 mr-1" />
                                Add Region
                            </button>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Deities</h3>
                            {formData.deities && formData.deities.length > 0 ? (
                                <ul className="space-y-2 mb-2">
                                    {formData.deities.map((deity, index) => (
                                        <li key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                            <span>{deity.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveArrayItem('deities', index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 mb-2">No deities added yet.</p>
                            )}

                            <button
                                type="button"
                                onClick={() => handleAddArrayItem('deities', { id: uuidv4(), name: 'New Deity', domain: '', alignment: '' })}
                                className="btn btn-secondary"
                            >
                                <PlusIcon className="h-5 w-5 mr-1" />
                                Add Deity
                            </button>
                        </div>
                    </div>
                );

            case 'region':
                return (
                    <div className="space-y-4 mt-4">
                        <div>
                            <label htmlFor="worldId" className="form-label">World</label>
                            <select
                                id="worldId"
                                name="worldId"
                                value={formData.worldId || ''}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="">Select a World</option>
                                {worlds.map(world => (
                                    <option key={world.id} value={world.id}>{world.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="climate" className="form-label">Climate</label>
                            <input
                                type="text"
                                id="climate"
                                name="climate"
                                value={formData.climate || ''}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Temperate, Arctic, Tropical, etc."
                            />
                        </div>

                        <div>
                            <label htmlFor="terrain" className="form-label">Terrain</label>
                            <input
                                type="text"
                                id="terrain"
                                name="terrain"
                                value={formData.terrain || ''}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Mountains, Forest, Desert, Plains, etc."
                            />
                        </div>

                        <div>
                            <label htmlFor="population" className="form-label">Population</label>
                            <input
                                type="text"
                                id="population"
                                name="population"
                                value={formData.population || ''}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Approximate population or demographics"
                            />
                        </div>

                        <div>
                            <label htmlFor="government" className="form-label">Government</label>
                            <input
                                type="text"
                                id="government"
                                name="government"
                                value={formData.government || ''}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Monarchy, Republic, Tribal, etc."
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Notable Locations</h3>
                            {formData.notableLocations && formData.notableLocations.length > 0 ? (
                                <ul className="space-y-2 mb-2">
                                    {formData.notableLocations.map((location, index) => (
                                        <li key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                            <span>{location.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveArrayItem('notableLocations', index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 mb-2">No locations added yet.</p>
                            )}

                            <button
                                type="button"
                                onClick={() => handleAddArrayItem('notableLocations', { id: uuidv4(), name: 'New Location', type: '' })}
                                className="btn btn-secondary"
                            >
                                <PlusIcon className="h-5 w-5 mr-1" />
                                Add Location
                            </button>
                        </div>
                    </div>
                );

            case 'location':
                return (
                    <div className="space-y-4 mt-4">
                        <div>
                            <label htmlFor="worldId" className="form-label">World</label>
                            <select
                                id="worldId"
                                name="worldId"
                                value={formData.worldId || ''}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="">Select a World</option>
                                {worlds.map(world => (
                                    <option key={world.id} value={world.id}>{world.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="regionId" className="form-label">Region</label>
                            <select
                                id="regionId"
                                name="regionId"
                                value={formData.regionId || ''}
                                onChange={handleChange}
                                className="form-select"
                                disabled={!formData.worldId}
                            >
                                <option value="">Select a Region</option>
                                {regions
                                    .filter(region => region.worldId === formData.worldId)
                                    .map(region => (
                                        <option key={region.id} value={region.id}>{region.name}</option>
                                    ))
                                }
                            </select>
                        </div>

                        <div>
                            <label htmlFor="locationType" className="form-label">Location Type</label>
                            <select
                                id="locationType"
                                name="locationType"
                                value={formData.locationType || 'settlement'}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="settlement">Settlement</option>
                                <option value="city">City</option>
                                <option value="town">Town</option>
                                <option value="village">Village</option>
                                <option value="dungeon">Dungeon</option>
                                <option value="landmark">Landmark</option>
                                <option value="poi">Point of Interest</option>
                                <option value="ruin">Ruin</option>
                                <option value="temple">Temple</option>
                                <option value="castle">Castle/Fortress</option>
                                <option value="cave">Cave</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="population" className="form-label">Population</label>
                            <input
                                type="text"
                                id="population"
                                name="population"
                                value={formData.population || ''}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Approximate population or demographics"
                            />
                        </div>

                        <div>
                            <label htmlFor="government" className="form-label">Government/Leadership</label>
                            <input
                                type="text"
                                id="government"
                                name="government"
                                value={formData.government || ''}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Who rules this location?"
                            />
                        </div>

                        <div>
                            <label htmlFor="economy" className="form-label">Economy</label>
                            <textarea
                                id="economy"
                                name="economy"
                                value={formData.economy || ''}
                                onChange={handleChange}
                                className="form-textarea h-16"
                                placeholder="Describe the local economy, trade, and resources..."
                            />
                        </div>

                        <div>
                            <label htmlFor="defenses" className="form-label">Defenses</label>
                            <textarea
                                id="defenses"
                                name="defenses"
                                value={formData.defenses || ''}
                                onChange={handleChange}
                                className="form-textarea h-16"
                                placeholder="Describe the defensive features, guards, military, etc..."
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Render a preview of the item
    const renderPreview = () => {
        switch (type) {
            case 'world':
                return (
                    <div className="bg-parchment p-6 rounded-lg border border-amber-800">
                        <h2 className="text-3xl font-medieval font-bold text-center mb-4">{formData.name || 'Unnamed World'}</h2>

                        {formData.imageUrl && (
                            <div className="mb-4 text-center">
                                <img
                                    src={formData.imageUrl}
                                    alt={formData.name}
                                    className="max-w-full h-auto rounded-lg mx-auto shadow-lg border-2 border-amber-700"
                                    style={{ maxHeight: '300px' }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x200?text=World+Map';
                                    }}
                                />
                            </div>
                        )}

                        {formData.description && (
                            <div className="mb-4">
                                <h3 className="text-xl font-medieval font-bold mb-2 border-b border-amber-600 pb-1">Overview</h3>
                                <p className="text-gray-800">{formData.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formData.history && (
                                <div>
                                    <h3 className="text-xl font-medieval font-bold mb-2 border-b border-amber-600 pb-1">History</h3>
                                    <p className="text-gray-800">{formData.history}</p>
                                </div>
                            )}

                            {formData.magic && (
                                <div>
                                    <h3 className="text-xl font-medieval font-bold mb-2 border-b border-amber-600 pb-1">Magic</h3>
                                    <p className="text-gray-800">{formData.magic}</p>
                                </div>
                            )}
                        </div>

                        {formData.regions && formData.regions.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-xl font-medieval font-bold mb-2 border-b border-amber-600 pb-1">Regions</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {formData.regions.map((region, index) => (
                                        <div key={index} className="bg-white bg-opacity-50 p-2 rounded-md shadow">
                                            {region.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.deities && formData.deities.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-xl font-medieval font-bold mb-2 border-b border-amber-600 pb-1">Deities</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {formData.deities.map((deity, index) => (
                                        <div key={index} className="bg-white bg-opacity-50 p-2 rounded-md shadow">
                                            {deity.name}
                                            {deity.domain && <div className="text-sm text-gray-600">Domain: {deity.domain}</div>}
                                            {deity.alignment && <div className="text-sm text-gray-600">Alignment: {deity.alignment}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'region':
                return (
                    <div className="bg-parchment p-6 rounded-lg border border-amber-800">
                        <h2 className="text-3xl font-medieval font-bold text-center mb-4">{formData.name || 'Unnamed Region'}</h2>

                        {formData.imageUrl && (
                            <div className="mb-4 text-center">
                                <img
                                    src={formData.imageUrl}
                                    alt={formData.name}
                                    className="max-w-full h-auto rounded-lg mx-auto shadow-lg border-2 border-amber-700"
                                    style={{ maxHeight: '300px' }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x200?text=Region+Map';
                                    }}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {formData.worldId && (
                                <div className="p-2 bg-white bg-opacity-70 rounded-md">
                                    <div className="font-medium">Type</div>
                                    <div className="capitalize">{formData.locationType || 'settlement'}</div>
                                </div>
                            )}

                            {formData.population && (
                                <div className="p-2 bg-white bg-opacity-70 rounded-md">
                                    <div className="font-medium">Population</div>
                                    <div>{formData.population}</div>
                                </div>
                            )}

                            {formData.government && (
                                <div className="p-2 bg-white bg-opacity-70 rounded-md">
                                    <div className="font-medium">Leadership</div>
                                    <div>{formData.government}</div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-medieval font-bold mb-2 border-b border-amber-600 pb-1">World</h3>
                                <p>{worlds.find(w => w.id === formData.worldId)?.name || 'Unknown World'}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-medieval font-bold mb-2 border-b border-amber-600 pb-1">Region</h3>
                                <p>{regions.find(r => r.id === formData.regionId)?.name || 'Unknown Region'}</p>
                            </div>
                        </div>

                        {formData.description && (
                            <div className="mb-4">
                                <h3 className="text-xl font-medieval font-bold mb-2 border-b border-amber-600 pb-1">Description</h3>
                                <p className="text-gray-800">{formData.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.economy && (
                                <div>
                                    <h3 className="text-lg font-medieval font-bold mb-2 border-b border-amber-600 pb-1">Economy</h3>
                                    <p className="text-gray-800">{formData.economy}</p>
                                </div>
                            )}

                            {formData.defenses && (
                                <div>
                                    <h3 className="text-lg font-medieval font-bold mb-2 border-b border-amber-600 pb-1">Defenses</h3>
                                    <p className="text-gray-800">{formData.defenses}</p>
                                </div>
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

export default WorldEditor;