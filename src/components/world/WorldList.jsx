// Open src/App.jsx and modify the imports
// Comment out the problematic imports

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import CharacterList from './components/character/CharacterList';
// import CharacterEditor from './components/character/CharacterEditor';
// import WorldList from './components/world/WorldList';
// import WorldEditor from './components/world/WorldEditor';
import MonsterList from './components/monster/MonsterList';
import MonsterEditor from './components/monster/MonsterEditor';
import SpellList from './components/spell/SpellList';
import SpellEditor from './components/spell/SpellEditor';
import SrdReferenceGuide from './components/srd/SrdReferenceGuide';

// Then also comment out any routes that use these components
// For example:

function App() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
            <Navbar />
            <main className="p-4">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/characters" element={<CharacterList />} />
                    {/* <Route path="/characters/new" element={<CharacterEditor />} /> */}
                    {/* <Route path="/characters/:id" element={<CharacterEditor />} /> */}
                    {/* <Route path="/worlds" element={<WorldList />} /> */}
                    {/* <Route path="/worlds/new" element={<WorldEditor />} /> */}
                    {/* <Route path="/worlds/:id" element={<WorldEditor />} /> */}
                    <Route path="/monsters" element={<MonsterList />} />
                    <Route path="/monsters/new" element={<MonsterEditor />} />
                    <Route path="/monsters/:id" element={<MonsterEditor />} />
                    <Route path="/spells" element={<SpellList />} />
                    <Route path="/spells/new" element={<SpellEditor />} />
                    <Route path="/spells/:id" element={<SpellEditor />} />
                    <Route path="/srd" element={<SrdReferenceGuide />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;