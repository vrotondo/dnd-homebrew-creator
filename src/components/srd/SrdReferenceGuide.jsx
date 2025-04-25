import { useState } from 'react';
import {
    QuestionMarkCircleIcon,
    ArrowTopRightOnSquareIcon,
    MagnifyingGlassIcon,
    BookOpenIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

const SrdReferenceGuide = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // Sample SRD sections (these would typically come from an actual SRD database)
    const srdSections = [
        { id: 'races', name: 'Races', content: 'The SRD includes the following races: Dwarf, Elf, Halfling, Human, Dragonborn, Gnome, Half-Elf, Half-Orc, and Tiefling.' },
        { id: 'classes', name: 'Classes', content: 'The SRD includes the following classes: Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, and Wizard.' },
        { id: 'spells', name: 'Spells', content: 'The SRD includes many spells available to spellcasting classes. Not all spells from the Player\'s Handbook are included in the SRD.' },
        { id: 'monsters', name: 'Monsters', content: 'The SRD includes many monsters. Not all monsters from the Monster Manual are included in the SRD.' },
        { id: 'magic-items', name: 'Magic Items', content: 'The SRD includes many magic items. Not all magic items from the Dungeon Master\'s Guide are included in the SRD.' },
        { id: 'rules', name: 'Rules', content: 'The SRD includes the basic rules for playing D&D 5th Edition.' },
    ];

    // FAQ items
    const faqItems = [
        {
            question: 'What is the SRD?',
            answer: 'The System Reference Document (SRD) contains guidelines for publishing content under the Open Gaming License (OGL) or Creative Commons. It provides a subset of D&D content that is available for use in homebrew content.'
        },
        {
            question: 'What content is included in the SRD?',
            answer: 'The SRD includes basic rules, races, classes, spells, monsters, and magic items. However, it does not include all content from official D&D books. Specific subclasses, feats, and other content may not be included.'
        },
        {
            question: 'Can I publish content that uses the SRD?',
            answer: 'Yes, content that only uses elements from the SRD can be published under the terms specified in the OGL or Creative Commons license. This allows creators to make compatible content without infringing on Wizards of the Coast\'s intellectual property.'
        },
        {
            question: 'What content is NOT included in the SRD?',
            answer: 'Many specific elements from official D&D products are not in the SRD, such as the Forgotten Realms setting, many subclasses, some spells, and named characters and locations from D&D lore.'
        },
        {
            question: 'How does the app ensure my content is SRD compliant?',
            answer: 'The app includes validation tools that check your content against known SRD elements. However, it\'s still important to verify compliance yourself, especially when creating complex homebrew content.'
        },
    ];

    // Filter sections based on search query
    const filteredSections = searchQuery
        ? srdSections.filter(section =>
            section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            section.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : srdSections;

    const filteredFaq = searchQuery
        ? faqItems.filter(item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : faqItems;

    return (
        <div>
            <h1 className="text-2xl font-medieval font-bold mb-6">SRD Reference Guide</h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="p-6">
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input pl-10"
                            placeholder="Search for SRD content..."
                        />
                    </div>

                    <div className="mb-6 border-b dark:border-gray-700">
                        <nav className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                                    ? 'border-dnd-red text-dnd-red dark:text-red-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                Overview
                            </button>

                            <button
                                onClick={() => setActiveTab('reference')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'reference'
                                    ? 'border-dnd-red text-dnd-red dark:text-red-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                Reference
                            </button>

                            <button
                                onClick={() => setActiveTab('faq')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'faq'
                                    ? 'border-dnd-red text-dnd-red dark:text-red-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                FAQ
                            </button>
                        </nav>
                    </div>

                    {activeTab === 'overview' && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-xl font-medieval font-bold mb-2">What is the SRD?</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    The Systems Reference Document (SRD) contains guidelines for publishing content under the Open Gaming License (OGL) or Creative Commons. It provides creators with a subset of D&D 5th Edition content that can be freely used in their own works.
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    When creating homebrew content, it's important to understand which elements are included in the SRD and can be freely shared, versus which elements are protected intellectual property owned by Wizards of the Coast.
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    This app helps you create SRD-compliant homebrew content by validating your creations against SRD guidelines, ensuring that you can freely share your content with others.
                                </p>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-xl font-medieval font-bold mb-2">Key SRD Resources</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <a
                                        href="https://www.dndbeyond.com/srd"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                        <BookOpenIcon className="h-6 w-6 text-dnd-red mr-3" />
                                        <div>
                                            <h3 className="font-medium">Official SRD Document</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Read the full Systems Reference Document on D&D Beyond
                                            </p>
                                        </div>
                                        <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400 ml-auto" />
                                    </a>

                                    <a
                                        href="https://dnd.wizards.com/resources/systems-reference-document"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                        <DocumentTextIcon className="h-6 w-6 text-dnd-red mr-3" />
                                        <div>
                                            <h3 className="font-medium">Wizards SRD Resources</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Official resources from Wizards of the Coast
                                            </p>
                                        </div>
                                        <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400 ml-auto" />
                                    </a>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <QuestionMarkCircleIcon className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                            Need more information?
                                        </h3>
                                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                                            <p>
                                                This guide provides a basic overview of the SRD. For more detailed information,
                                                please refer to the complete SRD document linked above or consult the FAQ section.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reference' && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-xl font-medieval font-bold mb-4">SRD Content Reference</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Below is a summary of content categories included in the SRD. This is not an exhaustive list, but provides a general overview of what content can be freely used in your homebrew creations.
                                </p>
                            </div>

                            {filteredSections.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredSections.map((section) => (
                                        <div
                                            key={section.id}
                                            className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4"
                                        >
                                            <h3 className="text-lg font-medium mb-2">{section.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-300">{section.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No results found for "{searchQuery}". Try a different search term.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'faq' && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-xl font-medieval font-bold mb-4">Frequently Asked Questions</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Common questions about the SRD and creating compliant homebrew content.
                                </p>
                            </div>

                            {filteredFaq.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredFaq.map((item, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4"
                                        >
                                            <h3 className="text-lg font-medium mb-2">{item.question}</h3>
                                            <p className="text-gray-600 dark:text-gray-300">{item.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No results found for "{searchQuery}". Try a different search term.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SrdReferenceGuide;