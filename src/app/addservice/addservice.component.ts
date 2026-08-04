/**
 * Created by pvesely on 06.10.2021
 */

import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DownloaderService} from "../downloader.service";
import {ServiceType} from "../constants";
import {Dialog} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import {TreeSelect} from "primeng/treeselect";
import {InputText} from "primeng/inputtext";
import {Select} from "primeng/select";
import {Button} from "primeng/button";
import {PrimeTemplate} from "primeng/api";

@Component({
	selector: 'app-addservice',
	templateUrl: './addservice.component.html',
	styleUrls: ['./addservice.component.css'],
	imports: [
		Dialog, Select, InputText, Button, TreeSelect, FormsModule, PrimeTemplate
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddServiceComponent implements OnInit {

	@Input() visible = false
	@Output() visibleChange = new EventEmitter<boolean>();
	@Output() addService = new EventEmitter<OGCService>()


	selectedService: any;
	serviceTreeNodes: any[] | undefined;
	serviceURL:string | undefined;
	serviceName:string | undefined;
	serviceType:ServiceType | undefined;
	serviceTypes = [{name: 'WMS', id: ServiceType.WMS}, {name: 'WMTS', id: ServiceType.WMTS}, {name: 'WFS', id: ServiceType.WFS}];

	constructor(public downloaderService:DownloaderService) {
	}

	ngOnInit(): void {
		this.downloaderService.getServices().then(files => this.serviceTreeNodes = files)
	}

	onServiceSelected(e:any) {
		const node = e.node
		this.serviceURL = node.url
		this.serviceType = node.type
		this.serviceName = node.label
	}

	onOKClicked() {
		if (this.serviceURL && this.serviceType && this.serviceName) {
			this.addService.emit({url:this.serviceURL, name:this.serviceName, type:this.serviceType})
		}
		this.hide()
	}

	hide() {
		this.visible = false
		this.visibleChange.emit(this.visible)
	}
}

export interface OGCService {

	url:string
	name:string
  version?:string|undefined
	type:ServiceType
	storagePropertyName?:string|undefined

}
