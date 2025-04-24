import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    UserIcon,
    GlobeAltIcon,
    ArchiveBoxIcon,
    SparklesIcon,
    PlusIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
    const characters = useSelector((state) => state.character.characters);
    const worlds = useSelector((state) => state.world.worlds);
    const monsters = useSelector((state) => state.monster.monsters || []);
    const items = useSelector((state) => state.item.items || []);
    const spells = useSelector((state) => state.spell.spells || []);
    const darkMode = useSelector((state) => state.ui.darkMode);

    // Placeholder image URL
    const placeholderImage = 'https://via.placeholder.com/150';

    const stats = [
        { name: 'Characters', count: characters.length, icon: UserIcon, to: '/characters', color: 'bg-blue-100 text-blue-800' },
        { name: 'Worlds', count: worlds.length, icon: GlobeAltIcon, to: '/worlds', color: 'bg-green-100 text-green-800' },
        { name: 'Monsters', count: monsters.length, icon: ArchiveBoxIcon, to: '/monsters', color: 'bg-yellow-100 text-yellow-800' },
        { name: 'Items', count: items.length, icon: ArchiveBoxIcon, to: '/items', color: 'bg-purple-100 text-purple-800' },
        { name: 'Spells', count: spells.length, icon: SparklesIcon, to: '/spells', color: 'bg-red-100 text-red-800' },
    ];

    const recentItems = [
        ...characters.slice(0, 3).map(item => ({ ...item, type: 'character', path: `/characters/${item.id}` })),
        ...worlds.slice(0, 3).map(item => ({ ...item, type: 'world', path: `/worlds/${item.id}` })),
        ...monsters.slice(0, 3).map(item => ({ ...item, type: 'monster', path: `/monsters/${item.id}` })),
    ].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-medieval font-bold mb-2">Welcome to D&D Homebrew Creator</h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Create, manage, and share your D&D 5th Edition homebrew content
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {stats.map((stat) => (
                    <Link
                        key={stat.name}
                        to={stat.to}
                        className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50 shadow'} transition-colors`}
                    >
                        <div className="flex items-center">
                            <div className={`${stat.color} p-3 rounded-md`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-lg font-semibold">{stat.count}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-medieval font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        to="/characters/new"
                        className={`flex items-center p-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50 shadow'} transition-colors`}
                    >
                        <div className="bg-blue-100 text-blue-800 p-3 rounded-md">
                            <PlusIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h3 className="font-semibold">Create Character</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Build a new character or NPC</p>
                        </div>
                    </Link>

                    <Link
                        to="/worlds/new"
                        className={`flex items-center p-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50 shadow'} transition-colors`}
                    >
                        <div className="bg-green-100 text-green-800 p-3 rounded-md">
                            <PlusIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h3 className="font-semibold">Create World</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Design a new campaign world</p>
                        </div>
                    </Link>

                    <Link
                        to="/monsters/new"
                        className={`flex items-center p-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50 shadow'} transition-colors`}
                    >
                        <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md">
                            <PlusIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h3 className="font-semibold">Create Monster</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Design a new creature</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Items */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medieval font-bold">Recent Items</h2>
                </div>

                {recentItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {recentItems.map((item) => (
                            <Link
                                key={`${item.type}-${item.id}`}
                                to={item.path}
                                className={`flex items-center p-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50 shadow'} transition-colors`}
                            >
                                <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-200">
                                    <img
                                        src={item.imageUrl || placeholderImage}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.src = placeholderImage;
                                        }}
                                    />
                                </div>
                                <div className="ml-4 flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <span className="text-xs uppercase px-2 py-1 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                                            {item.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                                        {item.description || 'No description'}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Last updated: {new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString()}
                                    </p>
                                </div>
                                <ArrowRightIcon className="h-5 w-5 ml-4 text-gray-400" />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className={`text-center p-8 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white shadow'}`}>
                        <p className="text-gray-500 dark:text-gray-400">
                            You don't have any items yet. Start creating your homebrew content!
                        </p>
                        <div className="mt-4">
                            <Link
                                to="/characters/new"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-dnd-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Create Character
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* SRD Info */}
            <div className={`mt-8 p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white shadow'}`}>
                <h2 className="text-xl font-medieval font-bold mb-2">SRD Compliance</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    The SRD (Systems Reference Document) contains guidelines for publishing D&D content. This app helps ensure your homebrew content complies with SRD guidelines.
                </p>
                <a
                    href="https://www.dndbeyond.com/srd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-dnd-red hover:underline"
                >
                    Learn more about the SRD
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                </a>
            </div>
        </div>
    );
};

export default Dashboard;