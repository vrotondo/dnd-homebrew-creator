import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    HomeIcon,
    UserIcon,
    GlobeAltIcon,
    ArchiveBoxIcon,
    SparklesIcon,
    BookOpenIcon,
    Cog6ToothIcon,
    DocumentDuplicateIcon,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
    const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
    const darkMode = useSelector((state) => state.ui.darkMode);

    const navigationItems = [
        { name: 'Dashboard', to: '/', icon: HomeIcon },
        {
            name: 'Characters',
            to: '/characters',
            icon: UserIcon,
            children: [
                { name: 'Characters', to: '/characters' },
                { name: 'Classes', to: '/classes' },
                { name: 'Races', to: '/races' },
                { name: 'Backgrounds', to: '/backgrounds' },
                { name: 'Feats', to: '/feats' },
            ],
        },
        {
            name: 'Worlds',
            to: '/worlds',
            icon: GlobeAltIcon,
            children: [
                { name: 'Worlds', to: '/worlds' },
                { name: 'Regions', to: '/regions' },
                { name: 'Locations', to: '/locations' },
                { name: 'Factions', to: '/factions' },
                { name: 'NPCs', to: '/npcs' },
                { name: 'Deities', to: '/deities' },
            ],
        },
        { name: 'Monsters', to: '/monsters', icon: ArchiveBoxIcon },
        { name: 'Items', to: '/items', icon: ArchiveBoxIcon },
        { name: 'Spells', to: '/spells', icon: SparklesIcon },
        { name: 'SRD Reference', to: '/srd-reference', icon: BookOpenIcon },
        { name: 'Export', to: '/export', icon: DocumentDuplicateIcon },
        { name: 'Settings', to: '/settings', icon: Cog6ToothIcon },
    ];

    if (!sidebarOpen) return null;

    return (
        <aside
            className={`fixed left-0 top-16 bottom-0 w-64 ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'
                } overflow-y-auto transition-all duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <nav className="mt-5 px-2">
                <div className="space-y-1">
                    {navigationItems.map((item) => (
                        <div key={item.name} className="mb-2">
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                        ? 'bg-dnd-red text-white'
                                        : 'hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white'
                                    }`
                                }
                                end={!item.children}
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon
                                            className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                                                }`}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </>
                                )}
                            </NavLink>

                            {item.children && (
                                <div className="ml-8 mt-1 space-y-1">
                                    {item.children.map((child) => (
                                        <NavLink
                                            key={child.name}
                                            to={child.to}
                                            className={({ isActive }) =>
                                                `group flex items-center px-2 py-1 text-sm font-medium rounded-md ${isActive
                                                    ? 'text-dnd-red font-semibold'
                                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                                }`
                                            }
                                        >
                                            {child.name}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </nav>

            <div className={`mt-8 px-4 py-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="flex items-center">
                    <QuestionMarkCircleIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <h3 className="text-sm font-medium">SRD Validation</h3>
                </div>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Content validation ensures your homebrew can be shared publicly by adhering to SRD guidelines.
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;