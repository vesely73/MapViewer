/**
 * Created by pavel on 31.10.2025
*/

import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import TileLayer from "ol/layer/Tile";
import ImageTileSource from "ol/source/ImageTile";
import {Dialog} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import {Button} from "primeng/button";
import {Select} from "primeng/select";
import {PrimeTemplate} from "primeng/api";
import {InputText} from "primeng/inputtext";
import {DownloaderService} from '../downloader.service';
import {LocalStorageService} from '../localstorage.service';

@Component({
	selector: 'app-azuremapproperties',
	templateUrl: './azuremapproperties.component.html',
	styleUrls: ['./azuremapproperties.component.css'],
	imports: [
		Dialog,
		Select,
		Button,
		FormsModule,
		InputText,
		PrimeTemplate
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class AzureMappropertiesComponent {

	@Input() visible = false
	@Output() visibleChange = new EventEmitter<boolean>();
  @Output() propertiesChanged = new EventEmitter<void>();

	tileset: string | null = null
	subscriptionKey: string | null = null
  tilesets: any[] = [{label: "Imagery", value: "microsoft.imagery"},{label: "Road", value: "microsoft.road"}
    ,{label: "Base Hybrid Road", value: "microsoft.basehybridroad"},{label: "Terrain", value: "microsoft.terramain"}]

  constructor(public localStorageService:LocalStorageService) {
    this.subscriptionKey = this.localStorageService.getStoredAzureSubscriptionKey()
    this.tileset = this.localStorageService.getStoredAzureTilesetId()??"microsoft.imagery"
  }

	hide() {
		this.visible = false
		this.visibleChange.emit(this.visible)
	}

	onOKClicked() {
    this.localStorageService.storeAzureSubscriptionKey(this.subscriptionKey)
    this.localStorageService.storeAzureTilesetId(this.tileset)
    this.propertiesChanged.emit()
		this.hide()
	}
}
