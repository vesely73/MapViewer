import {Injectable} from "@angular/core";
import TileLayer from "ol/layer/Tile";
import {TileWMS, WMTS} from "ol/source";
import {optionsFromCapabilities} from "ol/source/WMTS";
import {TreeLayersComponent} from "./treelayers.component";
import {OGCService} from "../addservice/addservice.component";
import {WFSCapabilities} from "../capabilitiesparser.service";
import LayerGroup from "ol/layer/Group";
import BaseLayer from "ol/layer/Base";
import VectorSource from "ol/source/Vector";
import GML3 from "ol/format/GML3";
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import VectorLayer from "ol/layer/Vector";
import {Fill, Stroke, Style} from "ol/style";

@Injectable({
  providedIn: 'root'
})
export class TreeLayersService {

	treeLayers:Array<TreeService> = []

	addTreeService(component:TreeLayersComponent, service:OGCService, index:number) {
		if (index==this.treeLayers.length) {
			this.treeLayers.push({component:component, service:service})
		}
		else {
			const newTreeLayers:Array<TreeService> = []
			for (let i = 0; i<this.treeLayers.length; i++) {
				if (i==index) newTreeLayers.push({component:component, service:service})
				newTreeLayers.push(this.treeLayers[i])

			}
			this.treeLayers = newTreeLayers
		}
		this.reindexLayers()
	}

	private reindexLayers() {
		let ix = 99
		this.treeLayers.forEach(ts => {
			ts.component?.layer?.setZIndex(ix--)
		})
	}

	getTreeService(ix:number):TreeService {
		return this.treeLayers[ix]
	}

	getTreeServiceIndex(component:TreeLayersComponent):number {
		let ix = 0
		for (let i = 0; i<this.treeLayers.length; i++) {
			if (this.treeLayers[i].component===component) {
				ix = i
				break
			}
		}
		return ix
	}

	removeComponent(component:TreeLayersComponent) {
		const newTreeLayers:Array<TreeService> = []
		this.treeLayers.forEach(ts => {
			if (ts.component!==component) newTreeLayers.push(ts)
		})
		this.treeLayers = newTreeLayers
	}

	createWFSGroupLayer(url:string, id:number, capabilities:WFSCapabilities):LayerGroup {
		const layers = new Array<BaseLayer>()
		capabilities.FeatureTypeList?.forEach(fType => {
			const vectorSource = new VectorSource({
				format: new GML3(),
				url: function (extent, resolution, projection):string {
					return url + "?service=WFS&version=1.1.0&request=GetFeature&typename=" + fType.Name + "&outputFormat=GML3&srsname=" + projection.getCode() + "&bbox="
						+ extent.join(',') + "," + projection.getCode()
				},
				strategy:bboxStrategy
			})
			const vector = new VectorLayer({
				source: vectorSource,
				style: new Style({
					fill:new Fill({
						color: 'rgba(0, 0, 255, 0.5)'
					}),
					stroke: new Stroke({
						color: 'rgba(0, 0, 255, 1.0)',
						width: 2,
					}),
				}),
			})
			vector.set("name", fType.Name)
			layers.push(vector)
		})
		return new LayerGroup({layers:layers, visible:false})
	}

	createWMSLayer(url:string, id:number):TileLayer<TileWMS> {
		const tileLayer = new TileLayer<TileWMS>({
			source: new TileWMS({
				url:url,
				params:{"TILED":true}
			}),
			visible:false
		})
		return tileLayer
	}

	createWMTSLayer(url:string, id:number, capabilities:any, layer:string, tileMatrixSet?:string):TileLayer<WMTS>|undefined {
		const options = optionsFromCapabilities(capabilities, {
			layer: layer,
			matrixSet: tileMatrixSet,
		});
		if (options) {
			const tileLayer = new TileLayer({
				source: new WMTS(options),
				visible:false
			})
			return tileLayer;
		}
		return undefined
	}

	createWMTSGroupLayer(url:string, id:number, capabilities:any, tileMatrixSet?:string):LayerGroup {
		const layers = new Array<BaseLayer>()
		capabilities.Contents.Layer?.forEach((layer: { Identifier: any; Title: any; }) => {
			const wmtsLayer = this.createWMTSLayer(url, id, capabilities, layer.Identifier, tileMatrixSet)
			if (wmtsLayer) {
				wmtsLayer.set("name", layer.Identifier)
				layers.push(wmtsLayer)
			}
		})
		return new LayerGroup({layers:layers, visible:false})
	}
}

export interface TreeService {

	component:TreeLayersComponent
	service:OGCService

}
