// src/components/world/WorldEditor.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
    DocumentCheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { addWorld, updateWorld } from '../../store/worldSlice';
import { addNotification } from '../../store/uiSlice';
import SrdValidator from '../srd/SrdValidator';

const WorldEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isNew = !id;

    // Default world template
    const defaultWorld = {
        id: uuidv4(),
        name: '',
        description: '',
        type: 'fantasy',
        status: 'in-progress',
        continents: [],
        regions: [],
        cities: [],
        npcs: [],
        deities: [],
        history: '',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Get the world from the store if editing an existing one
    const existingWorld = useSelector(state =>
        state.world.worlds.find(world => world.id === id)
    );

    const [world, setWorld] = useState(existingWorld || defaultWorld);
    const [showSrdValidator, setShowSrdValidator] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (id && !existingWorld) {
            // If we have an ID but no world with that ID, navigate back to list
            navigate('/worlds');
        }
    }, [id, existingWorld, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setWorld(prev => ({
            ...prev,
            [name]: value
        }));
        setIsDirty(true);

        // Clear validation error for this field if it exists
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateWorld = () => {
        const errors = {};

        if (!world.name.trim()) {
            errors.name = "Name is required";
        }

        // Add any other validation rules here

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const saveWorld = () => {
        if (!validateWorld()) {
            dispatch(addNotification({
                id: uuidv4(),
                type: 'error',
                title: 'Validation Error',
                message: 'Please correct the errors before saving.'
            }));
            return;
        }

        const worldToSave = {
            ...world,
            updatedAt: new Date().toISOString()
        };

        if (isNew) {
            dispatch(addWorld(worldToSave));
            dispatch(addNotification({
                id: uuidv4(),
                type: 'success',
                title: 'World Created',
                message: `${world.name} has been created successfully.`
            }));
        } else {
            dispatch(updateWorld(worldToSave));
            dispatch(addNotification({
                id: uuidv4(),
                type: 'success',
                title: 'World Updated',
                message: `${world.name} has been updated successfully.`
            }));
        }

        setIsDirty(false);
        navigate('/worlds');
    };

    const cancelEdit = () => {
        if (isDirty) {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                navigate('/worlds');
            }
        } else {
            navigate('/worlds');
        }
    };

    const handleCheckSrd = () => {
        setShowSrdValidator(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button
                        onClick={cancelEdit}
                        className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                        <ArrowLeftIcon className="h-6 w-6" />
                    </button>
                    <h1 className="text-2xl font-medieval font-bold">
                        {isNew ? 'Create New World' : `Edit ${world.name}`}
                    </h1>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={handleCheckSrd}
                        className="btn btn-secondary"
                        title="Check SRD Compliance"
                    >
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                        Check SRD
                    </button>
                    <button
                        onClick={cancelEdit}
                        className="btn btn-secondary"
                    >
                        <XMarkIcon className="h-5 w-5 mr-2" />
                        Cancel
                    </button>
                    <button
                        onClick={saveWorld}
                        className="btn btn-primary"
                    >
                        <DocumentCheckIcon className="h-5 w-5 mr-2" />
                        Save
                    </button>
                </div>
            </div>

            {showSrdValidator && (
                <SrdValidator
                    content={world}
                    onClose={() => setShowSrdValidator(false)}
                />
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Basic Information</h2>

                        <div className="mb-4">
                            <label htmlFor="name" className="form-label">
                                World Name
                                {validationErrors.name && (
                                    <span className="text-red-500 ml-2">{validationErrors.name}</span>
                                )}
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={world.name}
                                onChange={handleInputChange}
                                className={`form-input ${validationErrors.name ? 'border-red-500' : ''}`}
                                placeholder="Enter world name"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="type" className="form-label">Type</label>
                            <select
                                id="type"
                                name="type"
                                value={world.type}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="fantasy">Fantasy</option>
                                <option value="science-fiction">Science Fiction</option>
                                <option value="post-apocalyptic">Post-Apocalyptic</option>
                                <option value="historical">Historical</option>
                                <option value="modern">Modern</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="status" className="form-label">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={world.status}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="in-progress">In Progress</option>
                                <option value="complete">Complete</option>
                                <option value="planning">Planning</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Description</h2>
                        <div className="mb-4">
                            <label htmlFor="description" className="form-label">World Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={world.description}
                                onChange={handleInputChange}
                                className="form-textarea h-32"
                                placeholder="Enter a description of your world"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Geography Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Geography</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* World History */}
                    <div className="mb-4">
                        <label htmlFor="history" className="form-label">World History</label>
                        <textarea
                            id="history"
                            name="history"
                            value={world.history}
                            onChange={handleInputChange}
                            className="form-textarea h-40"
                            placeholder="Enter the history of your world"
                        />
                    </div>

                    {/* Notes */}
                    <div className="mb-4">
                        <label htmlFor="notes" className="form-label">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={world.notes}
                            onChange={handleInputChange}
                            className="form-textarea h-40"
                            placeholder="Enter any additional notes about your world"
                        />
                    </div>
                </div>
            </div>

            {/* Regions, Cities, NPCs sections could be added here */}
            {/* But for simplicity, we'll leave those for a future implementation */}

            <div className="flex justify-end mt-6 space-x-2">
                <button
                    onClick={cancelEdit}
                    className="btn btn-secondary"
                >
                    <XMarkIcon className="h-5 w-5 mr-2" />
                    Cancel
                </button>
                <button
                    onClick={saveWorld}
                    className="btn btn-primary"
                >
                    <DocumentCheckIcon className="h-5 w-5 mr-2" />
                    Save
                </button>
            </div>
        </div>
    );
};

export default WorldEditor;