import {Component, OnInit} from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import {TreeLayersService} from "./map/treelayers.service";
import {MapInitComponent} from "./mapinit/mapinit.component";
import {MapComponent} from "./map/map.component";


@Component({
	selector: 'app-root',
	templateUrl: './app.html',
	styleUrls: ['./app.css'],
	imports: [
		MapInitComponent,
		MapComponent
	]
})
export class App implements OnInit {

	map: Map | undefined;
	title = "OGCViewer";

	constructor(private treeLayersService: TreeLayersService) {
	}

	ngOnInit(): void {
		const sCenter = localStorage.getItem("ogcvcenter")?.split(";")
		let nCenter:Array<number>
		if (sCenter) {
			nCenter = [Number.parseFloat(sCenter[0]), Number.parseFloat(sCenter[1])]
		}
		else nCenter = [0, 0]

		const sResolution = localStorage.getItem("ogcvresolution")
		let nResolution:number|undefined
		if (sResolution) {
			nResolution = Number.parseFloat(sResolution)
		}

		const viewOptions = <any>{center: nCenter}
		if (nResolution) viewOptions.resolution = nResolution
		else viewOptions.zoom = 1

		const v = new View(viewOptions)
		this.map = new Map({
			view: v,
			layers: []
		});
		v.addEventListener("change:center", evt => {
			const c = (evt.target as View).getCenter()?.join(";")
			if (c) localStorage.setItem("ogcvcenter", c);
		})
		v.addEventListener("change:resolution", evt => {
			const c = (evt.target as View).getResolution()
			if (c) localStorage.setItem("ogcvresolution", c.toString());
		})
	}

	sendMail() {
		const a = "mail"
		const b = "to:pavel."
		const c = "vesely@"
		const d = "hotmail.cz"
		window.open(a+b+c+d)
	}


}
