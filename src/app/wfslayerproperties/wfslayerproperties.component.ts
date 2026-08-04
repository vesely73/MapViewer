/**
 * Created by pvesely on 02.01.2022
 */

import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import VectorLayer from "ol/layer/Vector";
import {Style} from "ol/style";
import {asArray, Color} from "ol/color";
import {LocalStorageService} from "../localstorage.service";
import {Dialog} from "primeng/dialog";
import {ColorPicker} from "primeng/colorpicker";
import {FormsModule} from "@angular/forms";
import {Slider} from "primeng/slider";
import {Button} from "primeng/button";

@Component({
	selector: 'app-wfslayerproperties',
	templateUrl: './wfslayerproperties.component.html',
	styleUrls: ['./wfslayerproperties.component.css'],
	imports: [
		Dialog,
		ColorPicker,
		Slider,
		Button,
		FormsModule
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class WfslayerpropertiesComponent {

	private _layer: VectorLayer<any> | undefined

	@Input() set layer(value: VectorLayer<any> | undefined) {
		this._layer = value;
		const style = value?.getStyle()
		if (style instanceof Style) {
			const color = style.getFill()?.getColor()?.toString()
			if (color) {
				const a = asArray(color)
				this.colorFill = { r: a[0], g: a[1], b: a[2] }
				this.alpha = a[3]
			}
		}
	}

	@Input() visible = false
	@Output() visibleChange = new EventEmitter<boolean>();

	colorFill: any = {
		r: 100, g: 130, b: 150
	}

	alpha:number = 1

	constructor(private localStorageService:LocalStorageService) {
	}

	hide() {
		this.visible = false
		this.visibleChange.emit(this.visible)
	}

	onOKClicked() {
		const style = this._layer?.getStyle()
		if (style instanceof Style) {
			const color1 = [this.colorFill.r, this.colorFill.g, this.colorFill.b]
			const color2 = [this.colorFill.r, this.colorFill.g, this.colorFill.b, this.alpha]
			style.getStroke()?.setColor(color1)
			style.getFill()?.setColor(color2)
			this.localStorageService.storeStyle(style, this._layer?.get("name"))
			this._layer?.setStyle(style)
		}
		this.hide()
	}
}
