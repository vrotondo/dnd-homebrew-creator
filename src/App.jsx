import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import CharacterList from './components/character/CharacterList';
import CharacterEditor from './components/character/CharacterEditor';
import WorldList from './components/world/WorldList';
import WorldEditor from './components/world/WorldEditor';
import MonsterList from './components/monster/MonsterList';
import MonsterEditor from './components/monster/MonsterEditor';
import ItemList from './components/item/ItemList';
import ItemEditor from './components/item/ItemEditor';
import SpellList from './components/spell/SpellList';
import SpellEditor from './components/spell/SpellEditor';
import SrdReferenceGuide from './components/srd/SrdReferenceGuide';
import ExportTool from './components/export/ExportTool';
import Settings from './components/settings/Settings';
import NotFound from './components/NotFound';

function App() {
  const darkMode = useSelector((state) => state.ui.darkMode);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-parchment text-ink'}`}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />

            {/* Character Routes */}
            <Route path="/characters" element={<CharacterList />} />
            <Route path="/characters/new" element={<CharacterEditor />} />
            <Route path="/characters/:id" element={<CharacterEditor />} />
            <Route path="/classes" element={<CharacterList type="class" />} />
            <Route path="/classes/new" element={<CharacterEditor type="class" />} />
            <Route path="/classes/:id" element={<CharacterEditor type="class" />} />
            <Route path="/races" element={<CharacterList type="race" />} />
            <Route path="/races/new" element={<CharacterEditor type="race" />} />
            <Route path="/races/:id" element={<CharacterEditor type="race" />} />

            {/* World Routes */}
            <Route path="/worlds" element={<WorldList />} />
            <Route path="/worlds/new" element={<WorldEditor />} />
            <Route path="/worlds/:id" element={<WorldEditor />} />
            <Route path="/regions" element={<WorldList type="region" />} />
            <Route path="/regions/new" element={<WorldEditor type="region" />} />
            <Route path="/regions/:id" element={<WorldEditor type="region" />} />
            <Route path="/locations" element={<WorldList type="location" />} />
            <Route path="/locations/new" element={<WorldEditor type="location" />} />
            <Route path="/locations/:id" element={<WorldEditor type="location" />} />

            {/* Monster Routes */}
            <Route path="/monsters" element={<MonsterList />} />
            <Route path="/monsters/new" element={<MonsterEditor />} />
            <Route path="/monsters/:id" element={<MonsterEditor />} />

            {/* Item Routes */}
            <Route path="/items" element={<ItemList />} />
            <Route path="/items/new" element={<ItemEditor />} />
            <Route path="/items/:id" element={<ItemEditor />} />

            {/* Spell Routes */}
            <Route path="/spells" element={<SpellList />} />
            <Route path="/spells/new" element={<SpellEditor />} />
            <Route path="/spells/:id" element={<SpellEditor />} />

            {/* Tool Routes */}
            <Route path="/srd-reference" element={<SrdReferenceGuide />} />
            <Route path="/export" element={<ExportTool />} />
            <Route path="/settings" element={<Settings />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;