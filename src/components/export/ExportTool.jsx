import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    ArrowDownTrayIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClipboardDocumentIcon,
    DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import SrdValidator from '../srd/SrdValidator';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ExportTool = () => {
    const [selectedType, setSelectedType] = useState('all');
    const [selectedItems, setSelectedItems] = useState([]);
    const [exportFormat, setExportFormat] = useState('json');
    const [previewHtml, setPreviewHtml] = useState('');
    const [exportStatus, setExportStatus] = useState(null);
    const [srdIssues, setSrdIssues] = useState([]);
    const [showSrdWarning, setShowSrdWarning] = useState(false);
    const [exportInProgress, setExportInProgress] = useState(false);

    // Get all data from store
    const characters = useSelector((state) => state.character.characters || []);
    const customClasses = useSelector((state) => state.character.customClasses || []);
    const customRaces = useSelector((state) => state.character.customRaces || []);
    const customBackgrounds = useSelector((state) => state.character.customBackgrounds || []);
    const customFeats = useSelector((state) => state.character.customFeats || []);
    const worlds = useSelector((state) => state.world.worlds || []);
    const regions = useSelector((state) => state.world.regions || []);
    const locations = useSelector((state) => state.world.locations || []);
    const factions = useSelector((state) => state.world.factions || []);
    const npcs = useSelector((state) => state.world.npcs || []);
    const monsters = useSelector((state) => state.monster.monsters || []);
    const items = useSelector((state) => state.item.items || []);
    const spells = useSelector((state) => state.spell.spells || []);

    // Define data categories
    const dataCategories = [
        { id: 'all', name: 'All Content', items: [] },
        { id: 'character', name: 'Characters', items: characters },
        { id: 'class', name: 'Classes', items: customClasses },
        { id: 'race', name: 'Races', items: customRaces },
        { id: 'background', name: 'Backgrounds', items: customBackgrounds },
        { id: 'feat', name: 'Feats', items: customFeats },
        { id: 'world', name: 'Worlds', items: worlds },
        { id: 'region', name: 'Regions', items: regions },
        { id: 'location', name: 'Locations', items: locations },
        { id: 'faction', name: 'Factions', items: factions },
        { id: 'npc', name: 'NPCs', items: npcs },
        { id: 'monster', name: 'Monsters', items: monsters },
        { id: 'item', name: 'Magic Items', items: items },
        { id: 'spell', name: 'Spells', items: spells },
    ];

    // Set all items when "all" is selected
    useEffect(() => {
        if (selectedType === 'all') {
            const allItems = dataCategories
                .filter(cat => cat.id !== 'all')
                .flatMap(cat => cat.items.map(item => ({
                    ...item,
                    type: cat.id
                })));
            setSelectedItems(allItems);
        } else {
            const categoryItems = dataCategories
                .find(cat => cat.id === selectedType)?.items
                .map(item => ({ ...item, type: selectedType })) || [];
            setSelectedItems(categoryItems);
        }
    }, [selectedType, dataCategories]);

    // Check SRD compliance of selected items
    useEffect(() => {
        const issues = [];

        // This is a simplified check - real validation would be more complex
        selectedItems.forEach(item => {
            if (!item.isSrdCompliant) {
                issues.push({
                    severity: 'error',
                    message: `"${item.name}" (${item.type}) contains non-SRD content.`,
                    itemId: item.id,
                    itemType: item.type
                });
            }
        });

        setSrdIssues(issues);
        setShowSrdWarning(issues.length > 0);
    }, [selectedItems]);

    // Generate HTML preview
    useEffect(() => {
        if (exportFormat === 'pdf' || exportFormat === 'html') {
            generateHtmlPreview();
        }
    }, [selectedItems, exportFormat]);

    const generateHtmlPreview = () => {
        let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>D&D Homebrew Content</title>
        <style>
          body {
            font-family: 'Bookman Old Style', Georgia, serif;
            color: #333;
            line-height: 1.5;
            padding: 20px;
            background-color: #f5f5dc;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #fff;
            padding: 30px;
            border: 1px solid #d4b483;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          }
          h1 {
            text-align: center;
            color: #7e2811;
            margin-bottom: 30px;
            border-bottom: 2px solid #d4b483;
            padding-bottom: 10px;
          }
          h2 {
            color: #7e2811;
            margin-top: 30px;
            border-bottom: 1px solid #d4b483;
            padding-bottom: 5px;
          }
          h3 {
            color: #a04e23;
            margin-top: 20px;
          }
          .item {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #faf6e9;
            border: 1px solid #e6d8b5;
            border-radius: 5px;
          }
          .item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .item-name {
            font-weight: bold;
            font-size: 1.2em;
            color: #7e2811;
          }
          .item-type {
            color: #666;
            font-style: italic;
          }
          .item-description {
            margin-top: 10px;
          }
          .section {
            margin-bottom: 40px;
          }
          .property {
            margin-bottom: 5px;
          }
          .property-name {
            font-weight: bold;
          }
          .stat-block {
            background-color: #faf6e9;
            border: 1px solid #e6d8b5;
            padding: 15px;
            margin-bottom: 20px;
          }
          .stat-block-header {
            text-align: center;
            border-bottom: 1px solid #d4b483;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .abilities {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
          }
          .ability {
            text-align: center;
          }
          .ability-name {
            font-weight: bold;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 0.8em;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>D&D Homebrew Content</h1>
          <p>Custom content created with D&D Homebrew Creator. This content complies with the Systems Reference Document (SRD) guidelines.</p>
    `;

        // Group items by type
        const groupedItems = {};
        selectedItems.forEach(item => {
            if (!groupedItems[item.type]) {
                groupedItems[item.type] = [];
            }
            groupedItems[item.type].push(item);
        });

        // Add sections for each item type
        Object.entries(groupedItems).forEach(([type, items]) => {
            if (items.length > 0) {
                const typeName = dataCategories.find(cat => cat.id === type)?.name || 'Content';

                html += `
          <div class="section">
            <h2>${typeName}</h2>
        `;

                // Add each item in this category
                items.forEach(item => {
                    html += generateItemHtml(item, type);
                });

                html += `</div>`;
            }
        });

        html += `
          <div class="footer">
            <p>Created with D&D Homebrew Creator</p>
            <p>This content complies with the SRD guidelines for D&D 5th Edition</p>
          </div>
        </div>
      </body>
      </html>
    `;

        setPreviewHtml(html);
    };

    // Generate HTML for different item types
    const generateItemHtml = (item, type) => {
        switch (type) {
            case 'character':
                return `
          <div class="item">
            <div class="item-header">
              <div class="item-name">${item.name || 'Unnamed Character'}</div>
              <div class="item-type">Character</div>
            </div>
            <div class="property">
              <span class="property-name">Race:</span> ${item.race || 'Unknown'}
            </div>
            <div class="property">
              <span class="property-name">Class:</span> ${item.class || 'Unknown'} ${item.level ? `(Level ${item.level})` : ''}
            </div>
            <div class="property">
              <span class="property-name">Background:</span> ${item.background || 'Unknown'}
            </div>
            ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
          </div>
        `;

            case 'world':
                return `
          <div class="item">
            <div class="item-header">
              <div class="item-name">${item.name || 'Unnamed World'}</div>
              <div class="item-type">World</div>
            </div>
            <div class="property">
              <span class="property-name">Genre:</span> ${item.genre || 'Fantasy'}
            </div>
            ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
          </div>
        `;

            case 'monster':
                return `
          <div class="stat-block">
            <div class="stat-block-header">
              <div class="item-name">${item.name || 'Unnamed Monster'}</div>
              <div class="item-type">${item.size || 'Medium'} ${item.type || 'creature'}, ${item.alignment || 'unaligned'}</div>
            </div>
            
            <div class="property">
              <span class="property-name">Armor Class:</span> ${item.armorClass || 10}
            </div>
            <div class="property">
              <span class="property-name">Hit Points:</span> ${item.hitPoints || 0} (${item.hitDice || '1d8'})
            </div>
            <div class="property">
              <span class="property-name">Speed:</span> ${item.speed || 30} ft.
            </div>
            
            ${item.abilities ? `
              <div class="abilities">
                <div class="ability">
                  <div class="ability-name">STR</div>
                  <div>${item.abilities.strength || 10} (${Math.floor((item.abilities.strength - 10) / 2) >= 0 ? '+' : ''}${Math.floor((item.abilities.strength - 10) / 2)})</div>
                </div>
                <div class="ability">
                  <div class="ability-name">DEX</div>
                  <div>${item.abilities.dexterity || 10} (${Math.floor((item.abilities.dexterity - 10) / 2) >= 0 ? '+' : ''}${Math.floor((item.abilities.dexterity - 10) / 2)})</div>
                </div>
                <div class="ability">
                  <div class="ability-name">CON</div>
                  <div>${item.abilities.constitution || 10} (${Math.floor((item.abilities.constitution - 10) / 2) >= 0 ? '+' : ''}${Math.floor((item.abilities.constitution - 10) / 2)})</div>
                </div>
                <div class="ability">
                  <div class="ability-name">INT</div>
                  <div>${item.abilities.intelligence || 10} (${Math.floor((item.abilities.intelligence - 10) / 2) >= 0 ? '+' : ''}${Math.floor((item.abilities.intelligence - 10) / 2)})</div>
                </div>
                <div class="ability">
                  <div class="ability-name">WIS</div>
                  <div>${item.abilities.wisdom || 10} (${Math.floor((item.abilities.wisdom - 10) / 2) >= 0 ? '+' : ''}${Math.floor((item.abilities.wisdom - 10) / 2)})</div>
                </div>
                <div class="ability">
                  <div class="ability-name">CHA</div>
                  <div>${item.abilities.charisma || 10} (${Math.floor((item.abilities.charisma - 10) / 2) >= 0 ? '+' : ''}${Math.floor((item.abilities.charisma - 10) / 2)})</div>
                </div>
              </div>
            ` : ''}
            
            ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
          </div>
        `;

            default:
                return `
          <div class="item">
            <div class="item-header">
              <div class="item-name">${item.name || 'Unnamed Item'}</div>
              <div class="item-type">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            </div>
            ${item.description ? `<div class="item-description">${item.description}</div>` : 'No description available.'}
          </div>
        `;
        }
    };

    // Export to JSON
    const exportToJson = () => {
        const exportData = {
            exportedAt: new Date().toISOString(),
            format: 'D&D Homebrew Creator',
            version: '1.0',
            items: selectedItems
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const fileName = `dnd-homebrew-export-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();

        setExportStatus('success');

        setTimeout(() => {
            setExportStatus(null);
        }, 3000);
    };

    // Export to PDF
    const exportToPdf = async () => {
        setExportInProgress(true);

        try {
            // Create temporary iframe to render HTML
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.visibility = 'hidden';
            iframe.style.width = '816px'; // Letter size width at 96dpi
            iframe.style.height = '1056px'; // Letter size height at 96dpi
            document.body.appendChild(iframe);

            // Write preview HTML to iframe
            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(previewHtml);
            iframe.contentWindow.document.close();

            // Wait for content to load
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'letter'
            });

            // Get content element to render
            const content = iframe.contentWindow.document.querySelector('.container');

            // Need to handle multi-page rendering - this is a simplified version
            const canvas = await html2canvas(content);
            const imgData = canvas.toDataURL('image/png');

            pdf.addImage(imgData, 'PNG', 20, 20, 575, 0, '', 'FAST');

            // Save PDF
            pdf.save(`dnd-homebrew-export-${new Date().toISOString().slice(0, 10)}.pdf`);

            // Clean up
            document.body.removeChild(iframe);

            setExportStatus('success');

            setTimeout(() => {
                setExportStatus(null);
            }, 3000);
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            setExportStatus('error');

            setTimeout(() => {
                setExportStatus(null);
            }, 3000);
        } finally {
            setExportInProgress(false);
        }
    };

    // Export to HTML
    const exportToHtml = () => {
        const blob = new Blob([previewHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', url);
        linkElement.setAttribute('download', `dnd-homebrew-export-${new Date().toISOString().slice(0, 10)}.html`);
        linkElement.click();

        URL.revokeObjectURL(url);

        setExportStatus('success');

        setTimeout(() => {
            setExportStatus(null);
        }, 3000);
    };

    // Copy to clipboard
    const copyToClipboard = () => {
        let text = '';

        selectedItems.forEach(item => {
            text += `# ${item.name}\n`;
            text += `Type: ${item.type}\n\n`;

            if (item.description) {
                text += `${item.description}\n\n`;
            }

            text += '---\n\n';
        });

        navigator.clipboard.writeText(text).then(() => {
            setExportStatus('success');

            setTimeout(() => {
                setExportStatus(null);
            }, 3000);
        }, (err) => {
            console.error('Error copying to clipboard:', err);
            setExportStatus('error');

            setTimeout(() => {
                setExportStatus(null);
            }, 3000);
        });
    };

    // Handle export based on format
    const handleExport = () => {
        if (exportInProgress) return;

        switch (exportFormat) {
            case 'json':
                exportToJson();
                break;
            case 'pdf':
                exportToPdf();
                break;
            case 'html':
                exportToHtml();
                break;
            case 'text':
                copyToClipboard();
                break;
            default:
                exportToJson();
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-medieval font-bold mb-6">Export Homebrew Content</h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-medium mb-4">Select Content to Export</h2>

                <div className="mb-4">
                    <label htmlFor="content-type" className="form-label">Content Type</label>
                    <select
                        id="content-type"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="form-select"
                    >
                        <option value="all">All Content</option>
                        {dataCategories.filter(cat => cat.id !== 'all').map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name} ({category.items.length})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="export-format" className="form-label">Export Format</label>
                    <select
                        id="export-format"
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="form-select"
                    >
                        <option value="json">JSON (for importing)</option>
                        <option value="pdf">PDF Document</option>
                        <option value="html">HTML Webpage</option>
                        <option value="text">Plain Text (Copy to Clipboard)</option>
                    </select>
                </div>

                <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Selected Items ({selectedItems.length})</h3>

                    {selectedItems.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto border dark:border-gray-600 rounded-md p-2">
                            {selectedItems.map(item => (
                                <div
                                    key={`${item.type}-${item.id}`}
                                    className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <div className="flex items-center">
                                        <span className="mr-2 text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                                            {item.type}
                                        </span>
                                        <span className={item.isSrdCompliant ? '' : 'text-red-500'}>
                                            {item.name || 'Unnamed Item'}
                                        </span>
                                    </div>
                                    {!item.isSrdCompliant && (
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" title="Not SRD compliant" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No items selected for export.</p>
                    )}
                </div>

                {showSrdWarning && (
                    <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    SRD Compliance Warning
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                    <p>
                                        Some selected items contain content that may not comply with SRD guidelines.
                                        This content might not be suitable for public sharing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleExport}
                        className="btn btn-primary"
                        disabled={selectedItems.length === 0 || exportInProgress}
                    >
                        {exportInProgress ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Exporting...
                            </>
                        ) : (
                            <>
                                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                                Export {exportFormat.toUpperCase()}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {exportStatus && (
                <div className={`mb-6 p-4 rounded-lg ${exportStatus === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {exportStatus === 'success' ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            ) : (
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                            )}
                        </div>
                        <div className="ml-3">
                            <h3 className={`text-sm font-medium ${exportStatus === 'success'
                                ? 'text-green-800 dark:text-green-200'
                                : 'text-red-800 dark:text-red-200'
                                }`}>
                                {exportStatus === 'success'
                                    ? 'Export Successful'
                                    : 'Export Failed'}
                            </h3>
                            <div className={`mt-2 text-sm ${exportStatus === 'success'
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-red-700 dark:text-red-300'
                                }`}>
                                {exportStatus === 'success'
                                    ? 'Your content has been exported successfully.'
                                    : 'There was an error exporting your content. Please try again.'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {srdIssues.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-medium mb-4">SRD Compliance Issues</h2>
                    <SrdValidator issues={srdIssues} />
                </div>
            )}

            {(exportFormat === 'pdf' || exportFormat === 'html') && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-medium">Export Preview</h2>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const previewWindow = window.open('', '_blank');
                                    previewWindow.document.write(previewHtml);
                                    previewWindow.document.close();
                                }}
                                className="btn btn-secondary"
                                title="Open preview in new window"
                            >
                                <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                                Open Preview
                            </button>
                        </div>
                    </div>

                    <div className="border dark:border-gray-600 rounded-lg overflow-hidden">
                        <iframe
                            title="Export Preview"
                            srcDoc={previewHtml}
                            className="w-full h-96 bg-white"
                            sandbox="allow-same-origin"
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportTool;