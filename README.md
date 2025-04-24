<<<<<<< HEAD
# D&D Homebrew Creator

A React-based web application for creating, managing, and sharing your D&D 5th Edition homebrew content, with built-in SRD compliance validation.

## Features

- **Character Creation**: Build custom characters, classes, races, and backgrounds
- **World Building**: Create campaign worlds, regions, and locations
- **Monster Design**: Create custom monsters and NPCs
- **Item Forge**: Design magical items and equipment
- **Spell Workshop**: Create custom spells
- **SRD Compliance**: Built-in validation ensures your content complies with SRD guidelines for sharing
- **Export Options**: Export your creations as JSON, PDF, or HTML
- **Dark Mode**: Toggle between light and dark themes

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dnd-homebrew-creator.git
cd dnd-homebrew-creator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist` directory.

## Technologies Used

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Redux](https://redux.js.org/) with [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Headless UI](https://headlessui.dev/)
- [Heroicons](https://heroicons.com/)
- [jsPDF](https://github.com/MrRio/jsPDF) - For PDF export

## Project Structure

- `/src` - Main source code directory
  - `/components` - React components organized by feature
  - `/store` - Redux store configuration and slices
  - `/data` - Static data and SRD reference
  - `/utils` - Utility functions
  - `/hooks` - Custom React hooks

## Usage Guide

### Creating Characters

1. Navigate to the Characters page
2. Click "Create New" to start building a character
3. Fill in details in the form, including class, race, ability scores, etc.
4. The SRD validator will automatically check if your content complies with SRD guidelines
5. Save your character when finished

### Building Worlds

1. Navigate to the Worlds page
2. Click "Create New" to start building a world
3. Fill in details about your world, including regions, locations, and lore
4. Add NPCs, factions, and other elements to flesh out your world
5. Save your world when finished

### Exporting Your Content

1. Navigate to the Export page
2. Select what content you want to export
3. Choose your export format (JSON, PDF, HTML, or plain text)
4. Export your content for sharing or importing into virtual tabletops

### Settings

Use the Settings page to:
- Toggle dark mode
- Enable/disable automatic SRD validation
- Create data backups
- Restore from previous backups
- Manage application data

## SRD Compliance

This app includes tools to help ensure your homebrew content complies with the Systems Reference Document (SRD) guidelines, allowing you to freely share your creations.

The SRD validator checks your content against known SRD elements and warns you about potential non-compliant content. However, it's always a good idea to manually verify compliance, especially when creating complex homebrew.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [D&D 5E SRD](https://www.dndbeyond.com/srd) - For reference material
- [D&D Beyond](https://www.dndbeyond.com/) - For inspiration
- The D&D community for their endless creativity
=======
# DnD-5E-homebrew-content-creation-app
D&amp;D 5E Homebrew Content Creation App coded in HTML, CSS, and JavaScript using Vite and React.
>>>>>>> 2f362f98a925fc42bab47deb6e8dd5fd838c7342
