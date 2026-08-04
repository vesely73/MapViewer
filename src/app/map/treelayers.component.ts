/**
 * Created by pvesely on 12.10.2021
 */

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PrimeTemplate, TreeNode} from "primeng/api";
import TileLayer from "ol/layer/Tile";
import {TileWMS} from "ol/source";
import BaseLayer from "ol/layer/Base";
import {TreeLayersService} from "./treelayers.service";
import {DialogService} from "primeng/dynamicdialog";
import LayerGroup from "ol/layer/Group";
import VectorLayer from "ol/layer/Vector";
import {Tree} from "primeng/tree";
import {Button} from "primeng/button";

@Component({
	selector: 'app-tree',
	templateUrl: './treelayers.component.html',
	styleUrls: ['./treelayers.component.css'],
	imports: [
		Tree,
		Button,
		PrimeTemplate
	]
})

export class TreeLayersComponent {

	@Input() nodes: Array<TreeNode> | undefined

	@Output() selectionChanged = new EventEmitter<Array<TreeNode>>()
	@Output() layerButtonClicked = new EventEmitter<VectorLayer<any>>()

	@Output() remove = new EventEmitter<TreeLayersComponent>()
	@Output() up = new EventEmitter<TreeLayersComponent>()
	@Output() down = new EventEmitter<TreeLayersComponent>()

	parsedCapabilities:any
	layer: BaseLayer | undefined
	selectedNodes: Array<TreeNode> | undefined
	smallButton = {width: '24px', height:'24px'}

	onNodeSelected(event:any) {
		const toSelect:Array<TreeNode> = []
		this.selectedNodes?.forEach((node) => {
			if (node==event.node) this.selectParentNode(node, toSelect)
			toSelect.push(node)
		})
		if (toSelect.length!=this.selectedNodes?.length)	this.selectedNodes = toSelect
		this.onSelectionChanged()
	}

	onNodeUnselected(event:any) {
		this.onSelectionChanged()
	}

	onSelectionChanged() {
		const enabledLayers = new Array<string>()
		if (!this.selectedNodes) return
		TreeLayersComponent.findEnabledLayers(this.parsedCapabilities.data, this.selectedNodes, enabledLayers)
		if (this.layer instanceof TileLayer) {
			const layerSource = this.layer.getSource()
			if (layerSource instanceof TileWMS) {
				const params = layerSource.getParams()
				params.LAYERS = enabledLayers.join(",")
				layerSource.updateParams(params)
			}
		}
		else if (this.layer instanceof LayerGroup) {
			this.layer.getLayers().forEach(layer => {
				layer.setVisible(enabledLayers.indexOf(layer.get("name"))>=0)
			})
		}
		this.layer?.setVisible(enabledLayers.length>0)
		this.selectionChanged.emit(this.selectedNodes)
	}

	private selectParentNode(node:TreeNode, toSelect:Array<TreeNode>) {
		if (node.parent) {
			if (this.selectedNodes && !this.selectedNodes.includes(node.parent)) {
				toSelect.push(node.parent)
			}
			this.selectParentNode(node.parent, toSelect)
		}
	}

	close() {
		this.remove.emit(this)
	}

	private static findEnabledLayers(treeNodes:Array<any>, treeSelection:Array<any>, enabledLayers:Array<string>) {
		treeNodes.forEach(node => {
			if (treeSelection.includes(node) || node.partialSelected) {
				if (node.hasOwnProperty("children")) {
					this.findEnabledLayers(node.children, treeSelection, enabledLayers)
				}
				else if (node.hasOwnProperty("id")){
					enabledLayers.push(node.id)
				}
			}
		})
	}

	private findLayerById(id:string):VectorLayer<any>|null {
		if (this.layer instanceof LayerGroup) {
			for (let layer of this.layer.getLayers().getArray()) {
				if (layer instanceof VectorLayer && layer.get("name") == id) return layer
			}
		}
		return null
	}

	moveUp() {
		this.up.emit(this)
	}

	moveDown() {
		this.down.emit(this)
	}

	layerPropertyButtonClick(evt: any, layerId:string) {
		evt.stopPropagation()
		const layer = this.findLayerById(layerId)
		if (layer) {
			this.layerButtonClicked.emit(layer)
		}
	}
}
