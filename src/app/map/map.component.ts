/**
 *
Created by pvesely on 23.09.2021
 */

import {
	ChangeDetectionStrategy,
	Component,
	ComponentFactoryResolver,
	Input,
	OnInit,
	ViewChild
} from '@angular/core';

import {Feature, Map as olMap} from 'ol';
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import {AddServiceComponent, OGCService} from "../addservice/addservice.component";
import {CapabilitiesParserService} from "../capabilitiesparser.service";
import {LayersDirective} from "./layers.directive";
import BaseLayer from "ol/layer/Base";
import {DEFAULT_DPI, ServiceType} from "../constants";
import {TreeLayersComponent} from "./treelayers.component";
import {TreeLayersService} from "./treelayers.service";
import {LocalStorageService} from "../localstorage.service";
import VectorLayer from "ol/layer/Vector";
import {WmsfeatureinfoComponent, GetFeatureInfoType} from "../wmsfeatureinfo/wmsfeatureinfo.component";
import {DialogService} from "primeng/dynamicdialog";
import VectorSource from "ol/source/Vector";
import LayerGroup from "ol/layer/Group";
import {WfsfeatureinfoComponent} from "../wfsfeatureinfo/wfsfeatureinfo.component";
import {Coordinate} from "ol/coordinate";
import {transform} from "ol/proj";
import {Style} from "ol/style";
import {ImageTile} from "ol/source";
import {Button} from "primeng/button";
import {RadioButton} from "primeng/radiobutton";
import {WfslayerpropertiesComponent} from "../wfslayerproperties/wfslayerproperties.component";
import {AzureMappropertiesComponent} from "../azuremapproperties/azuremapproperties.component";
import {Drawer} from "primeng/drawer";
import {FormsModule} from "@angular/forms";


@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.css'],
	changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    Drawer,
    RadioButton,
    Button,
    FormsModule,
    AddServiceComponent,
    WfslayerpropertiesComponent,
    AzureMappropertiesComponent,
    LayersDirective
  ]
})

export class MapComponent implements OnInit {

	@Input()
	map: olMap | undefined;

	lsidebar:boolean = false;

	infoButtonDisabled = true
	infoButtonChecked = false

	private _backgroundLayer = "osm";

	private osmLayer = new TileLayer({
		source: new OSM(),
	})

	private baseUrl = 'https://atlas.microsoft.com/map/tile?zoom={z}&x={x}&y={y}&tileSize=256&language=EN&&api-version=2.0';
	azureLayer: TileLayer<any>;

	isAddServiceVisible = false
	isWfsPropertiesVisible = false
	isAzureMapPropertiesVisible = false
  isAzureLayerEnabled = false
	wfsPropertiesLayer: VectorLayer<any> | undefined

	@ViewChild(LayersDirective, {static: true}) layersHost!: LayersDirective;

	constructor(private treeLayersService: TreeLayersService, private capabilitiesParserService:CapabilitiesParserService,
				private componentFactoryResolver: ComponentFactoryResolver, private localStorageService:LocalStorageService,
				private dialogService:DialogService) {
    const storedKey = this.localStorageService.getStoredAzureSubscriptionKey()??""
    const storedTilesetId = this.localStorageService.getStoredAzureTilesetId()??'microsoft.imagery'
    this.isAzureLayerEnabled = storedKey!=""
    this.azureLayer = new TileLayer({
      visible: false,
      preload: Infinity,
      source: new ImageTile({
        url: `${this.baseUrl}&subscription-key=${storedKey}&tilesetId=${storedTilesetId}`,
        crossOrigin: 'anonymous',
        attributions: `© ${new Date().getFullYear()} TomTom, Microsoft`,
      }),
    })
	}

	ngOnInit() {
		this.map?.setLayers([this.osmLayer,this.azureLayer])
		this.localStorageService.getStoredServices().forEach(service => {
      try {
        this.addService(service)
      }
      catch (e) {
        console.error(e)
      }
		})
	}

	get backgroundLayer(): string {
		return this._backgroundLayer;
	}

	set backgroundLayer(value: string) {
		this._backgroundLayer = value;
		this.osmLayer.setVisible(value=="osm")
		this.azureLayer.setVisible(value=="bing")
	}


	onAddService(newService: OGCService) {
		this.addService(newService)
		this.localStorageService.storeService(newService)
	}

	private addService(newService: OGCService) {
		let url:string
		switch (newService.type) {
			case ServiceType.WMTS:
				url = newService.url + "?request=GetCapabilities&service=WMTS"
				break
			case ServiceType.WFS:
				url = newService.url + "?request=GetCapabilities&service=WFS"
				break
			default:
				url = newService.url + "?request=GetCapabilities&service=WMS"
				break
		}
    if (newService.version) {
      url += `&version=${newService.version}`
    }
		this.capabilitiesParserService.getCapabilities(url, newService.type).then(capabilities => {

			if (newService.type==ServiceType.WMS) {
          const parsedCapabilities = CapabilitiesParserService.wmsCapabilitiesToTreeNode(capabilities)
          const l = this.treeLayersService.createWMSLayer(newService.url, parsedCapabilities.id)
          this.addTree(parsedCapabilities, l, newService, 0)
          this.map?.addLayer(l)
			}
			else if (newService.type==ServiceType.WMTS) {
				const parsedCapabilities = CapabilitiesParserService.wmtsCapabilitiesToTreeNode(capabilities)
				const tms = this.findTileMatrixSet(parsedCapabilities)
				const l = this.treeLayersService.createWMTSGroupLayer(newService.url, parsedCapabilities.id, capabilities, tms)
				if (l) {
					this.addTree(parsedCapabilities, l, newService, 0)
					this.map?.addLayer(l)
				}
			}
			else if (newService.type==ServiceType.WFS) {
				const parsedCapabilities = CapabilitiesParserService.wfsCapabilitiesToTreeNode(capabilities)
				const l = this.treeLayersService.createWFSGroupLayer(newService.url, parsedCapabilities.id, capabilities)
				this.addTree(parsedCapabilities, l, newService, 0)
				l.getLayers().forEach(layer => {
					if (layer instanceof VectorLayer) {
						const style = layer.getStyle()
						if (style instanceof Style) {
							this.localStorageService.getStoredStyle(style, layer.get("name"))
							layer.setStyle(style)
						}
					}
				})
				this.map?.addLayer(l)
			}
		}).catch(error => {
      console.log(error)
      this.localStorageService.clearService(newService)
    })
	}



	private findTileMatrixSet(parsedCapabilities:any):string|undefined {
		let id:string|undefined
		const mapProj = this.map?.getView().getProjection().getCode()
		for (let tms of parsedCapabilities.tileMatrixSet as Array<any>) {
			if (tms.crs==mapProj) {
				id = tms.id
				break
			}
		}
		return id
	}

	private addTree(capablilities:any, layer:BaseLayer, ogcService:OGCService, index:number) {
		const treeNodes = capablilities.data as Array<any>
		const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TreeLayersComponent)
		const componentRef = this.layersHost.viewContainerRef.createComponent<TreeLayersComponent>(componentFactory, index)
		componentRef.instance.nodes = treeNodes
		componentRef.instance.parsedCapabilities = capablilities
		componentRef.instance.layer = layer
		this.treeLayersService.addTreeService(componentRef.instance, ogcService, index)
		componentRef.instance.selectionChanged.subscribe(nodes => { this.layerSelectionChanged() })
		componentRef.instance.remove.subscribe(comp => {
			this.removeTree(comp)
			if (comp.layer)
				this.map?.removeLayer(comp.layer)
			this.localStorageService.clearService(ogcService)
		})
		componentRef.instance.up.subscribe(comp => { this.moveTreeUp(comp) })
		componentRef.instance.layerButtonClicked.subscribe(layer => { this.layerPropertiesButtonClicked(layer) })
	}

	private layerPropertiesButtonClicked(layer:VectorLayer<any>) {
		this.wfsPropertiesLayer = layer
		this.isWfsPropertiesVisible = true
	}

	private moveTreeUp(component:TreeLayersComponent) {
		let ix = this.treeLayersService.getTreeServiceIndex(component)
		if (ix>0) {
			const treeLayer = this.treeLayersService.getTreeService(ix)
			const service = treeLayer.service
			const capabilities = treeLayer.component.parsedCapabilities
			const layer = treeLayer.component.layer
			const selection = treeLayer.component.selectedNodes
			this.removeTree(component)
			ix--
			if (layer)
				this.addTree(capabilities, layer, service, ix)
			this.treeLayersService.getTreeService(ix).component.selectedNodes = selection
		}
	}

	private removeTree(component:TreeLayersComponent) {
		const ix = this.treeLayersService.getTreeServiceIndex(component)
		this.layersHost.viewContainerRef.remove(ix)
		this.treeLayersService.removeComponent(component)
	}

	private layerSelectionChanged() {
		let found = false
		for (const treeLayer of this.treeLayersService.treeLayers) {
			if (treeLayer?.component?.layer?.getVisible()) {
				let queryable = false
				if (treeLayer.component.selectedNodes) {
					for (const node of treeLayer.component.selectedNodes) {
						if ((node as any).queryable) {
							queryable = true
							break
						}
					}
				}
				if (queryable) {
					found = true
					break
				}
			}
		}
		this.infoButtonDisabled = !found
		if (this.infoButtonDisabled) {
			this.map?.removeEventListener("singleclick", this.fn)
		}
		else if (this.infoButtonChecked && !this.map?.hasListener("singleclick")) {
			this.map?.addEventListener("singleclick", this.fn)
		}
	}

	private fn = (evt:any) => {this.showFeatureInfo(evt)}

	onInfoButtonChange() {
    this.infoButtonChecked = !this.infoButtonChecked
    if (this.infoButtonChecked) {
      this.map?.addEventListener("singleclick", this.fn)
      this.infoButtonChecked = true
    }
    else {
      this.map?.removeEventListener("singleclick", this.fn)
      this.infoButtonChecked = false
    }
	}

	onLocationClick() {
		const geolocation = window.navigator.geolocation
		if (geolocation) {
			geolocation.getCurrentPosition(position => {
				var coord: Coordinate = new Array<number>(position.coords.longitude, position.coords.latitude)
				coord = transform(coord, "EPSG:4326", this.map?.getView().getProjection())
				this.map?.getView().setResolution(this.fromScaleToResolution(2000))
				this.map?.getView().setCenter(coord)
			})
		}
	}

	private fromScaleToResolution(scale:number):number {
		return scale / (DEFAULT_DPI * 39.3700787)
	}

	private showFeatureInfo(evt:any) {
		const viewResolution =  this.map?.getView().getResolution()
		const gfi = new Array<GetFeatureInfoType>()
		const features = new Array<Feature>()
		for (const treeLayer of this.treeLayersService.treeLayers) {
			const layerIds = new Array<string>()
			treeLayer.component.selectedNodes?.forEach(node => {
				if ((node as any).queryable) {
					layerIds.push((node as any).id)
				}
			})
			layerIds.forEach(layerId => {
				const layer = treeLayer.component.layer
				if (layer instanceof TileLayer) {
					const url = layer.getSource()?.getFeatureInfoUrl(
						evt.coordinate,
						viewResolution?viewResolution:0,
						this.map?.getView().getProjection(),
						{'INFO_FORMAT': 'text/html', "QUERY_LAYERS":layerId}
					);
					if (url) {
						gfi.push({url:url, title:layerId})
					}
				}
				else if (layer instanceof VectorLayer) {
					const f = (layer.getSource() as VectorSource).getFeaturesAtCoordinate(evt.coordinate)
					if (f) features.push(...f)
				}
				else if (layer instanceof LayerGroup) {
					layer.getLayers()?.forEach(layer => {
						if (layer instanceof VectorLayer) {
							const f = (layer.getSource() as VectorSource).getFeaturesAtCoordinate(evt.coordinate)
							if (f) features.push(...f)
						}
					})
				}
			})
		}

		if (features.length>0) {
			this.dialogService.open(WfsfeatureinfoComponent, {
				data:features,
				header: 'WFS Feature Info',
				width: '70%',
				height: "80vh",
				contentStyle: {"overflow": "auto"},
        closable: true,
        baseZIndex: 10000
			});
		}
		else if (gfi.length>0){
			this.dialogService.open(WmsfeatureinfoComponent, {
				data:gfi,
				header: 'WMS Feature Info',
				width: '70%',
				height: "90vh",
				contentStyle: {"overflow": "auto"},
        closable: true,
				baseZIndex: 10000
			});
		}



	}

  protected onAzureMapPropertiesChanged($event: void) {
     const storedKey = this.localStorageService.getStoredAzureSubscriptionKey()??""
      const storedTilesetId = this.localStorageService.getStoredAzureTilesetId()??'microsoft.imagery'
      this.isAzureLayerEnabled = storedKey!=""
      if (!this.isAzureLayerEnabled && this.backgroundLayer=="bing") {
        this.backgroundLayer = ""
      }
      const newUrl = `${this.baseUrl}&subscription-key=${storedKey}&tilesetId=${storedTilesetId}`;
      this.azureLayer?.getSource()?.setUrl(newUrl);

  }
}
