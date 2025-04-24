import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../store/uiSlice';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Notifications from './Notifications';

const Layout = ({ children }) => {
    const dispatch = useDispatch();
    const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
    const darkMode = useSelector((state) => state.ui.darkMode);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="flex flex-1">
                <Sidebar />

                <div
                    className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'
                        }`}
                >
                    <main className="container mx-auto px-4 py-8">
                        {/* Breadcrumbs and page header could go here */}

                        <div className="mt-4">
                            {children}
                        </div>
                    </main>

                    <Footer />
                </div>
            </div>

            <Notifications />
        </div>
    );
};

export default Layout;