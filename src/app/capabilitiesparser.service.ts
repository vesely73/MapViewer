import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {WMSCapabilities, WMTSCapabilities} from "ol/format";
import {ServiceType} from "./constants";

@Injectable({
  providedIn: 'root'
})
export class CapabilitiesParserService {

	private static counter = 0

	constructor(private http: HttpClient) { }

	getCapabilities(url:string, serviceType:ServiceType) {
		return this.http.get<any>(url, <object>{responseType:'text'}).toPromise().then(txt => {
			if (serviceType==ServiceType.WMTS) {
				const parser = new WMTSCapabilities()
				return parser.read(txt)
			}
			else if (serviceType==ServiceType.WFS) {
				return CapabilitiesParserService.parseWFSCapabilities(txt)
			}
			else {
				const parser = new WMSCapabilities()
				return parser.read(txt)
			}
		}, err => {
			return err
		})
	}

	private static parseWFSCapabilities(txt:string):WFSCapabilities {
		const capabilities:WFSCapabilities = {}
		const fTypes:Array<FeatureType> = []
		capabilities.FeatureTypeList = fTypes
		const xmlDoc = new DOMParser().parseFromString(txt,"text/xml");
		const identNodes = xmlDoc.getElementsByTagNameNS("*", "ServiceIdentification")
		if (identNodes.length>0) {
			capabilities.Title = this.findNodeValue(identNodes[0], "Title")
			capabilities.ServiceType = this.findNodeValue(identNodes[0], "ServiceType")
			capabilities.ServiceTypeVersion = this.findNodeValue(identNodes[0], "ServiceTypeVersion")
			/*const title = identNodes[0].getElementsByTagNameNS("*", "Title")
			if (title.length>0) {
				capabilities.Title = this.getNodeValue(title[0])
			}*/
			/*const serviceType = identNodes[0].getElementsByTagNameNS("*", "ServiceType")
			if (serviceType.length>0) {
				capabilities.ServiceType = this.getNodeValue(serviceType[0])
			}
			const serviceTypeVersion = identNodes[0].getElementsByTagNameNS("*", "ServiceTypeVersion")
			if (serviceTypeVersion.length>0) {
				capabilities.ServiceTypeVersion = this.getNodeValue(serviceTypeVersion[0])
			}*/
		}
		const nodes = xmlDoc.getElementsByTagNameNS("*", "FeatureType")
		for (let i=0; i<nodes.length; i++) {
			const name = this.findNodeValue(nodes[i], "Name")
			const title = this.findNodeValue(nodes[i], "Title")
			if (name && title) {
				fTypes.push({Name:name, Title:title})
			}
			/*const name = nodes[i].getElementsByTagNameNS("*", "Name")
			const title = nodes[i].getElementsByTagNameNS("*", "Title")
			if (name.length>0 && title.length>0) {
				fTypes.push({Name:this.getNodeValue(name[0]), Title:this.getNodeValue(title[0])})
			}*/
		}
		return capabilities
	//	return CapabilitiesParserService.xmlToJson(xmlDoc)
	}

	private static findNodeValue(parent:Element, nodeName:string):string|null {
		const node = parent.getElementsByTagNameNS("*", nodeName)
		if (node.length>0) return this.getNodeValue(node[0])
		else return null
	}

	private static getNodeValue(node:Element):string|null {
		const ch = node.childNodes
		if (ch.length>0) return ch.item(0).nodeValue
		else return null
	}

	// Changes XML to JSON
	static xmlToJson(xml:any):any {

		// Create the return object
		let obj:any = {};

		if (xml.nodeType == 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
				obj["@attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) { // text
			obj = xml.nodeValue;
		}

		// do children
		if (xml.hasChildNodes()) {
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = this.removeNamespace(item.nodeName);
				if (typeof(obj[nodeName]) == "undefined") {
					obj[nodeName] = this.xmlToJson(item);
				} else {
					if (typeof(obj[nodeName].push) == "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(this.xmlToJson(item));
				}
			}
		}
		return obj;
	}

	private static removeNamespace(nodeName:string):string {
		const a = nodeName.split(":")
		return a[a.length-1]
	}

	static wmtsCapabilitiesToTreeNode(capabilities:any) {
		const nodes:Array<any> = []
    capabilities.Contents.Layer?.forEach((layer: { Identifier: any; Title: any; }) => {
      nodes.push({id:layer.Identifier, label:layer.Title, icon: "pi pi-file", type:"wmts"})
    })
		const tileMatrixSets:Array<any> = []
		const tms = capabilities.Contents.TileMatrixSet as Array<any>
		if (tms) {
			tms.forEach(tileMatrixSet => {
				tileMatrixSets.push({id:tileMatrixSet.Identifier, crs:tileMatrixSet.SupportedCRS})
			})
		}

		const rootNode = {label:capabilities.ServiceIdentification.Title, expandedIcon: "pi pi-folder-open",collapsedIcon: "pi pi-folder", children:nodes}
		return {id:this.counter++, title: capabilities.ServiceIdentification.Title, abstract: capabilities.ServiceIdentification.Abstract,
			data: [rootNode], tileMatrixSet:tileMatrixSets}
	}

	static wfsCapabilitiesToTreeNode(capabilities:WFSCapabilities) {
		const nodes = <any>[]
		capabilities.FeatureTypeList?.forEach(fType => {
			nodes.push({id:fType.Name, label:fType.Title, icon: "pi pi-file", type:"wfs", queryable:true})
		})
		const rootNode = {label:capabilities.Title, expandedIcon: "pi pi-folder-open",collapsedIcon: "pi pi-folder", children:nodes}
		return {id:this.counter++, title: capabilities.Title, data: [rootNode],
			gfi:{format:"wfs"}}
	}

	static wmsCapabilitiesToTreeNode(capabilities:any) {
		const rootLayer = capabilities.Capability.Layer
		let nodes = <any>[]
		if (rootLayer) {
			const layers = rootLayer.Layer as Array<any>
			if (layers) {
				nodes = layers.map<any>(l => this.createTreeNode(l))
			}
		}
		const rootNode = {label:capabilities.Service.Title, expandedIcon: "pi pi-folder-open",collapsedIcon: "pi pi-folder", children:nodes}
		return {id:this.counter++, title: capabilities.Service.Title, abstract: capabilities.Service.Abstract, data: [rootNode],
			gfi:this.getFeatureInfo(capabilities)}
	}

	private static createTreeNode(layer:any) {
		const subLayers = layer.Layer as Array<any>
		if (subLayers) {
			const subNodes:Array<any> = subLayers.map<any>(l => {
				return this.createTreeNode(l)
			})
			return {label:layer.Title, expandedIcon: "pi pi-folder-open",collapsedIcon: "pi pi-folder", children:subNodes}
		}
		else {
			return {id:layer.Name, label:layer.Title, icon: "pi pi-file", type:"wms", queryable:layer.queryable}
		}
	}

	private static getFeatureInfo(capabilities:any):any|undefined {
		const gfi = capabilities.Capability.Request.GetFeatureInfo
		if (gfi) {
			return {format:gfi.Format}
		}
		else return undefined
	}
}

export interface WFSCapabilities {
	FeatureTypeList?:Array<FeatureType>
	Title?:string|null
	ServiceType?:string|null
	ServiceTypeVersion?:string|null
}

export interface FeatureType {
 	Name:string|null
	Title:string|null
}
