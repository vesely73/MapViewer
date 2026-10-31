# MapViewer

MapViewer is a web-based mapping application built with Angular that enables viewing and interacting with OGC (Open Geospatial Consortium) web services including WMS, WMTS, and WFS.

## Features

- **WMS (Web Map Service)** - Display and interact with tiled map layers from WMS services
- **WMTS (Web Map Tile Service)** - Support for tiled web map services with better performance
- **WFS (Web Feature Service)** - Load and display vector features from WFS services
- **Service Management** - Add services dynamically via URL or use pre-configured services from `services.json`
- **Flexible Layer Organization** - Browse and select layers in a tree view with support for layer hierarchies
- **Multiple Background Maps** - Switch between OSM and Azure Maps backgrounds
- **Interactive Features** - Query layer information (GetFeatureInfo) and geolocation support
- **Layer Persistence** - Save added services to browser storage for quick access on return visits

## Application Structure

The application is built with Angular and uses:
- [OpenLayers](https://openlayers.org/) for map rendering
- [PrimeNG](https://primeng.org/) for UI components
- Local storage for persisting service configurations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
npm install
```

### Development Server

Start a local development server:

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you modify any source files.

### Building for Production

```bash
npm run build
# or
ng build
```

Build artifacts are stored in the `dist/` directory.

### GitHub Pages

The Czech translation is deployed automatically to GitHub Pages when changes are pushed
to the `master` branch. Enable **Settings > Pages > Build and deployment > Source:
GitHub Actions** in the repository once. The published application is available at:

`https://vesely73.github.io/MapViewer/`

To create the same localized build locally:

```bash
npm run build:github-pages
```

## Configuring Pre-configured Services

MapViewer can be configured with pre-defined OGC services that users can quickly add. This is done through the `src/assets/services.json` file.

### services.json Structure

The `services.json` file contains a hierarchical tree structure of available services:

```json
{
  "data": [
    {
      "label": "Category Name",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "selectable": false,
      "children": [
        {
          "label": "Service Display Name",
          "url": "https://service-url/...",
          "type": "wms|wmts|wfs",
          "version": "1.3.0",
          "collapsedIcon": "pi pi-globe",
          "leaf": true
        }
      ]
    }
  ]
}
```

### Configuration Properties

#### Category Node (Folder)

- **label** - Display name of the service category
- **expandedIcon** - PrimeNG icon to show when expanded (e.g., "pi pi-folder-open")
- **collapsedIcon** - PrimeNG icon to show when collapsed (e.g., "pi pi-folder")
- **selectable** - Set to `false` for folders (users cannot select the folder itself)
- **children** - Array of child services or nested categories

#### Service Node

- **label** - Display name of the service (shown in the service list)
- **url** - Complete URL to the OGC service capabilities document
  - For WMS: typically ends with `...MapServer/WMSServer` or similar
  - For WMTS: typically the GetCapabilities XML endpoint
  - For WFS: typically the base WFS service URL
- **type** - Service type: `"wms"`, `"wmts"`, or `"wfs"`
- **version** - OGC service version (e.g., `"1.3.0"`, `"2.0.0"`)
- **collapsedIcon** - PrimeNG icon for the service (e.g., "pi pi-globe")
- **leaf** - Set to `true` to indicate this is a leaf node (no children)

### Example Configuration

```json
{
  "data": [
    {
      "label": "European Services",
      "expandedIcon": "pi pi-folder-open",
      "collapsedIcon": "pi pi-folder",
      "selectable": false,
      "children": [
        {
          "label": "EEA Urban Atlas WMS",
          "url": "https://image.discomap.eea.europa.eu/arcgis/services/UrbanAtlas/UA_UrbanAtlasChange_2012_2018/MapServer/WMSServer",
          "type": "wms",
          "version": "1.3.0",
          "collapsedIcon": "pi pi-globe",
          "leaf": true
        },
        {
          "label": "EC GISCO WMTS",
          "url": "https://gisco-services.ec.europa.eu/maps/wmts/1.0.0/WMTSCapabilities.xml",
          "type": "wmts",
          "version": "1.0.0",
          "collapsedIcon": "pi pi-globe",
          "leaf": true
        }
      ]
    }
  ]
}
```

### How Services Are Loaded

1. **On Application Startup** - MapViewer loads services from `services.json` and displays them in the service browser
2. **User Selection** - Users can expand categories and click on services to add them to their map
3. **Service Details** - When a service is selected, MapViewer fetches the service capabilities and displays available layers
4. **Layer Management** - Users can then select specific layers to display on the map
5. **Persistence** - Added services are saved to browser storage and will be automatically reloaded on next visit

### Adding Custom Services at Runtime

Users can also add custom OGC services by:
1. Clicking the "Add Service" button in the application
2. Entering the service URL
3. Selecting the service type (WMS, WMTS, or WFS)

## Using the Application

### Adding Layers to the Map

1. Browse the service tree in the left panel
2. Expand categories by clicking the folder icons
3. Click on a service name to load its capabilities
4. Check the layers you want to display on the map
5. The selected layers will appear on the map

### Layer Management

- **Expand/Collapse Layers** - Click the arrow icons to show layer hierarchies
- **Toggle Visibility** - Check/uncheck the checkbox to show/hide layers
- **Reorder Layers** - Use the up/down arrows to change layer display order
- **Remove Layers** - Click the trash icon to remove a service from the map

### Feature Information

For WMS and WFS layers with the "Information" feature enabled:
1. Click the "Info" button in the toolbar
2. Click on the map to query information for enabled layers
3. Feature details will be displayed in a popup

### Geolocation

- Click the location icon in the toolbar to center the map on your current location (requires permission)

## Architecture

The application consists of several key components:

- **MapComponent** - Main map container using OpenLayers
- **TreeLayersComponent** - Hierarchical layer tree view
- **CapabilitiesParserService** - Parses OGC service capabilities documents
- **TreeLayersService** - Manages layer creation and organization
- **LocalStorageService** - Handles persistence of services and settings

## Development

### Code Scaffolding

Generate a new component:

```bash
ng generate component component-name
```

For more schematics (components, directives, pipes):

```bash
ng generate --help
```

### Running Tests

Execute unit tests:

```bash
npm test
# or
ng test
```

## Project Status

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.9.

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.
