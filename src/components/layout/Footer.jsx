import { useSelector } from 'react-redux';

const Footer = () => {
    const darkMode = useSelector((state) => state.ui.darkMode);

    return (
        <footer className={`py-4 mt-8 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <p className="text-sm">
                            D&D Homebrew Creator © {new Date().getFullYear()}
                        </p>
                    </div>
                    <div className="flex space-x-6">
                        <a
                            href="https://www.dndbeyond.com/srd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:text-dnd-red"
                        >
                            SRD Reference
                        </a>
                        <a
                            href="https://github.com/yourusername/dnd-homebrew-creator"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:text-dnd-red"
                        >
                            GitHub
                        </a>
                        <a
                            href="#"
                            className="text-sm hover:text-dnd-red"
                        >
                            Privacy Policy
                        </a>
                    </div>
                </div>
                <div className="mt-4 text-center text-xs">
                    <p>Dungeons & Dragons is a trademark of Wizards of the Coast LLC. This application is not affiliated with, endorsed, sponsored, or specifically approved by Wizards of the Coast LLC.</p>
                    <p>This application uses content from the SRD and is compliant with the Open Gaming License or Creative Commons.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;