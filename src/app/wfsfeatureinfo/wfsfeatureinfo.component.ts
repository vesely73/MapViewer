/**
Created by pavel on 15.02.2023
*/

import {Component} from '@angular/core';
import {DynamicDialogConfig} from "primeng/dynamicdialog";
import {Feature} from "ol";
import {Card} from "primeng/card";
import {TableModule} from "primeng/table";

@Component({
	selector: 'app-wfsfeatureinfo',
	templateUrl: './wfsfeatureinfo.component.html',
	styleUrls: ['./wfsfeatureinfo.component.css'],
	imports: [
		TableModule,
		Card
	]
})

export class WfsfeatureinfoComponent {

	features:Array<FeatureInfo> = []

	constructor(private config: DynamicDialogConfig) {
		const f:Array<Feature> = config.data
		f.forEach(feature => {
			const rows:Array<any> = []
			Object.entries(feature.getProperties())
				.forEach(([key, value]) => {
					rows.push({key:key, value:value})
				})
			this.features.push({rows:rows})
		})
	}

}

export interface FeatureInfo {

	rows:Array<any>

}