// src/components/monster/MonsterEditor.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
    addMonster,
    updateMonster,
    deleteMonster
} from '../../store/monsterSlice';
import { validateSrdCompliance } from '../../utils/srdValidator';
import SrdValidator from '../srd/SrdValidator';
import {
    DocumentCheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    DocumentDuplicateIcon,
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const MonsterEditor = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const isNew = !id;

    // Get the monster data
    const monsters = useSelector((state) => state.monster.monsters);
    const monster = isNew ? null : monsters.find(item => item.id === id);

    // Form state
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        size: 'medium',
        type: 'beast',
        alignment: 'unaligned',
        armorClass: 10,
        hitPoints: 10,
        hitDice: '1d8',
        speed: 30,
        abilities: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        },
        savingThrows: [],
        skills: [],
        damageVulnerabilities: [],
        damageResistances: [],
        damageImmunities: [],
        conditionImmunities: [],
        senses: '',
        languages: '',
        challengeRating: '0',
        experience: 0,
        traits: [],
        actions: [],
        reactions: [],
        legendaryActions: [],
        createdAt: '',
        updatedAt: '',
        isSrdCompliant: true,
    });

    const [srdIssues, setSrdIssues] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // If editing, populate form with existing data
    useEffect(() => {
        if (monster) {
            setFormData({
                ...monster,
            });
        } else if (isNew) {
            setFormData({
                id: uuidv4(),
                name: '',
                description: '',
                size: 'medium',
                type: 'beast',
                alignment: 'unaligned',
                armorClass: 10,
                hitPoints: 10,
                hitDice: '1d8',
                speed: 30,
                abilities: {
                    strength: 10,
                    dexterity: 10,
                    constitution: 10,
                    intelligence: 10,
                    wisdom: 10,
                    charisma: 10
                },
                savingThrows: [],
                skills: [],
                damageVulnerabilities: [],
                damageResistances: [],
                damageImmunities: [],
                conditionImmunities: [],
                senses: '',
                languages: '',
                challengeRating: '0',
                experience: 0,
                traits: [],
                actions: [],
                reactions: [],
                legendaryActions: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isSrdCompliant: true,
            });
        }
    }, [monster, isNew]);

    // Check if data has been modified
    useEffect(() => {
        if (monster) {
            const isChanged = JSON.stringify(monster) !== JSON.stringify(formData);
            setHasUnsavedChanges(isChanged);
        } else if (isNew) {
            const isPopulated = formData.name.trim() !== '' || formData.description.trim() !== '';
            setHasUnsavedChanges(isPopulated);
        }
    }, [formData, monster, isNew]);

    // Validate SRD compliance
    useEffect(() => {
        const issues = validateSrdCompliance(formData, 'monster');
        setSrdIssues(issues);

        // Update the SRD compliance flag
        setFormData(prev => ({
            ...prev,
            isSrdCompliant: issues.filter(issue => issue.severity === 'error').length === 0
        }));
    }, [formData.name, formData.description, formData.type]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            // Handle nested properties like abilities.strength
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'number' ? parseInt(value) : value
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
            // Calculate XP based on CR if not manually entered
            if (!formData.experience) {
                const crToXp = {
                    '0': 10, '1/8': 25, '1/4': 50, '1/2': 100,
                    '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800,
                    '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900,
                    '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000,
                    '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000,
                    '21': 33000, '22': 41000, '23': 50000, '24': 62000, '25': 75000,
                    '26': 90000, '27': 105000, '28': 120000, '29': 135000, '30': 155000
                };

                const updatedFormData = {
                    ...formData,
                    experience: crToXp[formData.challengeRating] || 0
                };

                if (isNew) {
                    dispatch(addMonster(updatedFormData));
                } else {
                    dispatch(updateMonster(updatedFormData));
                }
            } else {
                if (isNew) {
                    dispatch(addMonster(formData));
                } else {
                    dispatch(updateMonster(formData));
                }
            }

            setHasUnsavedChanges(false);
            navigate('/monsters');
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

        dispatch(addMonster(duplicatedItem));
        navigate(`/monsters/${duplicatedItem.id}`);
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            setConfirmLeave(true);
        } else {
            navigate('/monsters');
        }
    };

    // Add trait to monster
    const handleAddTrait = () => {
        const newTrait = {
            id: uuidv4(),
            name: 'New Trait',
            description: ''
        };

        setFormData(prev => ({
            ...prev,
            traits: [...prev.traits, newTrait],
            updatedAt: new Date().toISOString()
        }));
    };

    // Add action to monster
    const handleAddAction = () => {
        const newAction = {
            id: uuidv4(),
            name: 'New Action',
            description: ''
        };

        setFormData(prev => ({
            ...prev,
            actions: [...prev.actions, newAction],
            updatedAt: new Date().toISOString()
        }));
    };

    // Remove trait from monster
    const handleRemoveTrait = (traitId) => {
        setFormData(prev => ({
            ...prev,
            traits: prev.traits.filter(trait => trait.id !== traitId),
            updatedAt: new Date().toISOString()
        }));
    };

    // Remove action from monster
    const handleRemoveAction = (actionId) => {
        setFormData(prev => ({
            ...prev,
            actions: prev.actions.filter(action => action.id !== actionId),
            updatedAt: new Date().toISOString()
        }));
    };

    // Update trait
    const handleUpdateTrait = (traitId, field, value) => {
        setFormData(prev => ({
            ...prev,
            traits: prev.traits.map(trait =>
                trait.id === traitId
                    ? { ...trait, [field]: value }
                    : trait
            ),
            updatedAt: new Date().toISOString()
        }));
    };

    // Update action
    const handleUpdateAction = (actionId, field, value) => {
        setFormData(prev => ({
            ...prev,
            actions: prev.actions.map(action =>
                action.id === actionId
                    ? { ...action, [field]: value }
                    : action
            ),
            updatedAt: new Date().toISOString()
        }));
    };

    // Calculate ability modifier
    const getAbilityModifier = (score) => {
        return Math.floor((score - 10) / 2);
    };

    // Format ability modifier as string (e.g., +2 or -1)
    const formatModifier = (mod) => {
        return mod >= 0 ? `+${mod}` : `${mod}`;
    };

    // Render the appropriate tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="form-label">Monster Name</label>
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
                                <label htmlFor="size" className="form-label">Size</label>
                                <select
                                    id="size"
                                    name="size"
                                    value={formData.size}
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
                                <label htmlFor="type" className="form-label">Type</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="aberration">Aberration</option>
                                    <option value="beast">Beast</option>
                                    <option value="celestial">Celestial</option>
                                    <option value="construct">Construct</option>
                                    <option value="dragon">Dragon</option>
                                    <option value="elemental">Elemental</option>
                                    <option value="fey">Fey</option>
                                    <option value="fiend">Fiend</option>
                                    <option value="giant">Giant</option>
                                    <option value="humanoid">Humanoid</option>
                                    <option value="monstrosity">Monstrosity</option>
                                    <option value="ooze">Ooze</option>
                                    <option value="plant">Plant</option>
                                    <option value="undead">Undead</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="alignment" className="form-label">Alignment</label>
                                <select
                                    id="alignment"
                                    name="alignment"
                                    value={formData.alignment}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="lawful good">Lawful Good</option>
                                    <option value="neutral good">Neutral Good</option>
                                    <option value="chaotic good">Chaotic Good</option>
                                    <option value="lawful neutral">Lawful Neutral</option>
                                    <option value="neutral">Neutral</option>
                                    <option value="chaotic neutral">Chaotic Neutral</option>
                                    <option value="lawful evil">Lawful Evil</option>
                                    <option value="neutral evil">Neutral Evil</option>
                                    <option value="chaotic evil">Chaotic Evil</option>
                                    <option value="unaligned">Unaligned</option>
                                </select>
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
                                placeholder="Describe your monster..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="armorClass" className="form-label">Armor Class</label>
                                <input
                                    type="number"
                                    id="armorClass"
                                    name="armorClass"
                                    value={formData.armorClass}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label htmlFor="hitPoints" className="form-label">Hit Points</label>
                                <input
                                    type="number"
                                    id="hitPoints"
                                    name="hitPoints"
                                    value={formData.hitPoints}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label htmlFor="hitDice" className="form-label">Hit Dice</label>
                                <input
                                    type="text"
                                    id="hitDice"
                                    name="hitDice"
                                    value={formData.hitDice}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., 3d8+6"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="speed" className="form-label">Speed</label>
                            <input
                                type="number"
                                id="speed"
                                name="speed"
                                value={formData.speed}
                                onChange={handleChange}
                                className="form-input"
                                min="0"
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Ability Scores</h3>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                <div>
                                    <label htmlFor="abilities.strength" className="form-label">STR</label>
                                    <input
                                        type="number"
                                        id="abilities.strength"
                                        name="abilities.strength"
                                        value={formData.abilities.strength}
                                        onChange={handleChange}
                                        className="form-input"
                                        min="1"
                                        max="30"
                                    />
                                    <div className="text-center text-sm mt-1">
                                        {formatModifier(getAbilityModifier(formData.abilities.strength))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="abilities.dexterity" className="form-label">DEX</label>
                                    <input
                                        type="number"
                                        id="abilities.dexterity"
                                        name="abilities.dexterity"
                                        value={formData.abilities.dexterity}
                                        onChange={handleChange}
                                        className="form-input"
                                        min="1"
                                        max="30"
                                    />
                                    <div className="text-center text-sm mt-1">
                                        {formatModifier(getAbilityModifier(formData.abilities.dexterity))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="abilities.constitution" className="form-label">CON</label>
                                    <input
                                        type="number"
                                        id="abilities.constitution"
                                        name="abilities.constitution"
                                        value={formData.abilities.constitution}
                                        onChange={handleChange}
                                        className="form-input"
                                        min="1"
                                        max="30"
                                    />
                                    <div className="text-center text-sm mt-1">
                                        {formatModifier(getAbilityModifier(formData.abilities.constitution))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="abilities.intelligence" className="form-label">INT</label>
                                    <input
                                        type="number"
                                        id="abilities.intelligence"
                                        name="abilities.intelligence"
                                        value={formData.abilities.intelligence}
                                        onChange={handleChange}
                                        className="form-input"
                                        min="1"
                                        max="30"
                                    />
                                    <div className="text-center text-sm mt-1">
                                        {formatModifier(getAbilityModifier(formData.abilities.intelligence))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="abilities.wisdom" className="form-label">WIS</label>
                                    <input
                                        type="number"
                                        id="abilities.wisdom"
                                        name="abilities.wisdom"
                                        value={formData.abilities.wisdom}
                                        onChange={handleChange}
                                        className="form-input"
                                        min="1"
                                        max="30"
                                    />
                                    <div className="text-center text-sm mt-1">
                                        {formatModifier(getAbilityModifier(formData.abilities.wisdom))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="abilities.charisma" className="form-label">CHA</label>
                                    <input
                                        type="number"
                                        id="abilities.charisma"
                                        name="abilities.charisma"
                                        value={formData.abilities.charisma}
                                        onChange={handleChange}
                                        className="form-input"
                                        min="1"
                                        max="30"
                                    />
                                    <div className="text-center text-sm mt-1">
                                        {formatModifier(getAbilityModifier(formData.abilities.charisma))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="challengeRating" className="form-label">Challenge Rating</label>
                                <select
                                    id="challengeRating"
                                    name="challengeRating"
                                    value={formData.challengeRating}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="0">0 (10 XP)</option>
                                    <option value="1/8">1/8 (25 XP)</option>
                                    <option value="1/4">1/4 (50 XP)</option>
                                    <option value="1/2">1/2 (100 XP)</option>
                                    <option value="1">1 (200 XP)</option>
                                    <option value="2">2 (450 XP)</option>
                                    <option value="3">3 (700 XP)</option>
                                    <option value="4">4 (1,100 XP)</option>
                                    <option value="5">5 (1,800 XP)</option>
                                    <option value="6">6 (2,300 XP)</option>
                                    <option value="7">7 (2,900 XP)</option>
                                    <option value="8">8 (3,900 XP)</option>
                                    <option value="9">9 (5,000 XP)</option>
                                    <option value="10">10 (5,900 XP)</option>
                                    <option value="11">11 (7,200 XP)</option>
                                    <option value="12">12 (8,400 XP)</option>
                                    <option value="13">13 (10,000 XP)</option>
                                    <option value="14">14 (11,500 XP)</option>
                                    <option value="15">15 (13,000 XP)</option>
                                    <option value="16">16 (15,000 XP)</option>
                                    <option value="17">17 (18,000 XP)</option>
                                    <option value="18">18 (20,000 XP)</option>
                                    <option value="19">19 (22,000 XP)</option>
                                    <option value="20">20 (25,000 XP)</option>
                                    <option value="21">21 (33,000 XP)</option>
                                    <option value="22">22 (41,000 XP)</option>
                                    <option value="23">23 (50,000 XP)</option>
                                    <option value="24">24 (62,000 XP)</option>
                                    <option value="25">25 (75,000 XP)</option>
                                    <option value="26">26 (90,000 XP)</option>
                                    <option value="27">27 (105,000 XP)</option>
                                    <option value="28">28 (120,000 XP)</option>
                                    <option value="29">29 (135,000 XP)</option>
                                    <option value="30">30 (155,000 XP)</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="experience" className="form-label">
                                    Experience Points (XP)
                                    <span className="text-sm text-gray-500 ml-2">Optional - auto-calculated from CR</span>
                                </label>
                                <input
                                    type="number"
                                    id="experience"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="languages" className="form-label">Languages</label>
                            <input
                                type="text"
                                id="languages"
                                name="languages"
                                value={formData.languages}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., Common, Elvish, Telepathy 60 ft."
                            />
                        </div>

                        <div>
                            <label htmlFor="senses" className="form-label">Senses</label>
                            <input
                                type="text"
                                id="senses"
                                name="senses"
                                value={formData.senses}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., Darkvision 60 ft., passive Perception 12"
                            />
                        </div>
                    </div>
                );

            case 'traits':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-medium">Traits</h2>
                            <button
                                type="button"
                                onClick={handleAddTrait}
                                className="btn btn-primary"
                            >
                                <PlusIcon className="h-5 w-5 mr-1" />
                                Add Trait
                            </button>
                        </div>

                        {formData.traits.length > 0 ? (
                            <div className="space-y-4">
                                {formData.traits.map((trait) => (
                                    <div
                                        key={trait.id}
                                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <input
                                                type="text"
                                                value={trait.name}
                                                onChange={(e) => handleUpdateTrait(trait.id, 'name', e.target.value)}
                                                className="form-input font-medium text-lg"
                                                placeholder="Trait Name"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTrait(trait.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div>
                                            <textarea
                                                value={trait.description}
                                                onChange={(e) => handleUpdateTrait(trait.id, 'description', e.target.value)}
                                                className="form-textarea h-24 w-full"
                                                placeholder="Trait description..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No traits added yet. Click the "Add Trait" button to add your first trait.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-4 mt-8">
                            <h2 className="text-xl font-medium">Actions</h2>
                            <button
                                type="button"
                                onClick={handleAddAction}
                                className="btn btn-primary"
                            >
                                <PlusIcon className="h-5 w-5 mr-1" />
                                Add Action
                            </button>
                        </div>

                        {formData.actions.length > 0 ? (
                            <div className="space-y-4">
                                {formData.actions.map((action) => (
                                    <div
                                        key={action.id}
                                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <input
                                                type="text"
                                                value={action.name}
                                                onChange={(e) => handleUpdateAction(action.id, 'name', e.target.value)}
                                                className="form-input font-medium text-lg"
                                                placeholder="Action Name"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAction(action.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div>
                                            <textarea
                                                value={action.description}
                                                onChange={(e) => handleUpdateAction(action.id, 'description', e.target.value)}
                                                className="form-textarea h-24 w-full"
                                                placeholder="Action description..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No actions added yet. Click the "Add Action" button to add your first action.
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
                    <div className="stat-block">
                        <h1>{formData.name || 'Unnamed Monster'}</h1>
                        <p className="creature-type">
                            {formData.size.charAt(0).toUpperCase() + formData.size.slice(1)} {formData.type},
                            {' '}{formData.alignment}
                        </p>

                        <div className="property-line">
                            <span className="property-name">Armor Class</span> {formData.armorClass}
                        </div>
                        <div className="property-line">
                            <span className="property-name">Hit Points</span> {formData.hitPoints} ({formData.hitDice})
                        </div>
                        <div className="property-line">
                            <span className="property-name">Speed</span> {formData.speed} ft.
                        </div>

                        <div className="abilities">
                            <div>
                                <div className="ability-score">STR</div>
                                <div>{formData.abilities.strength} ({formatModifier(getAbilityModifier(formData.abilities.strength))})</div>
                            </div>
                            <div>
                                <div className="ability-score">DEX</div>
                                <div>{formData.abilities.dexterity} ({formatModifier(getAbilityModifier(formData.abilities.dexterity))})</div>
                            </div>
                            <div>
                                <div className="ability-score">CON</div>
                                <div>{formData.abilities.constitution} ({formatModifier(getAbilityModifier(formData.abilities.constitution))})</div>
                            </div>
                            <div>
                                <div className="ability-score">INT</div>
                                <div>{formData.abilities.intelligence} ({formatModifier(getAbilityModifier(formData.abilities.intelligence))})</div>
                            </div>
                            <div>
                                <div className="ability-score">WIS</div>
                                <div>{formData.abilities.wisdom} ({formatModifier(getAbilityModifier(formData.abilities.wisdom))})</div>
                            </div>
                            <div>
                                <div className="ability-score">CHA</div>
                                <div>{formData.abilities.charisma} ({formatModifier(getAbilityModifier(formData.abilities.charisma))})</div>
                            </div>
                        </div>

                        {formData.senses && (
                            <div className="property-line">
                                <span className="property-name">Senses</span> {formData.senses}
                            </div>
                        )}

                        {formData.languages && (
                            <div className="property-line">
                                <span className="property-name">Languages</span> {formData.languages || 'none'}
                            </div>
                        )}

                        <div className="property-line">
                            <span className="property-name">Challenge</span> {formData.challengeRating} ({formData.experience} XP)
                        </div>

                        {formData.traits.length > 0 && (
                            <div className="mt-4">
                                {formData.traits.map((trait) => (
                                    <div key={trait.id} className="mt-2">
                                        <span className="action-name">{trait.name}.</span> {trait.description}
                                    </div>
                                ))}
                            </div>
                        )}

                        {formData.actions.length > 0 && (
                            <div className="mt-4">
                                <div className="actions-header">Actions</div>
                                {formData.actions.map((action) => (
                                    <div key={action.id} className="mt-2">
                                        <span className="action-name">{action.name}.</span> {action.description}
                                    </div>
                                ))}
                            </div>
                        )}

                        {formData.reactions && formData.reactions.length > 0 && (
                            <div className="mt-4">
                                <div className="actions-header">Reactions</div>
                                {formData.reactions.map((reaction) => (
                                    <div key={reaction.id} className="mt-2">
                                        <span className="action-name">{reaction.name}.</span> {reaction.description}
                                    </div>
                                ))}
                            </div>
                        )}

                        {formData.legendaryActions && formData.legendaryActions.length > 0 && (
                            <div className="mt-4">
                                <div className="actions-header">Legendary Actions</div>
                                {formData.legendaryActions.map((action) => (
                                    <div key={action.id} className="mt-2">
                                        <span className="action-name">{action.name}.</span> {action.description}
                                    </div>
                                ))}
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
                    <h1 className="text-2xl font-medieval font-bold">{isNew ? 'Create New Monster' : 'Edit Monster'}</h1>
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
                                    This monster contains elements that might not be compliant with the SRD guidelines.
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
                            onClick={() => setActiveTab('traits')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'traits'
                                ? 'border-dnd-red text-dnd-red dark:text-red-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Traits & Actions
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
                                    navigate('/monsters');
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

export default MonsterEditor;