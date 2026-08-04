import {Injectable} from "@angular/core";
import {OGCService} from "./addservice/addservice.component";
import {Style} from "ol/style";
import {asArray, asString, Color} from "ol/color";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private static PROP_SERVICES_INDEX = "ogcvservicesindex"
  private static PROP_PREFIX = "ogcvservice"
  private static PROP_LAYER_STYLE = "ogcstyle"
  private static FILL = "fill"
  private static STROKE = "stroke"
  private static PROP_AZURE_SUBSCRIPTION_KEY = "azuresubscriptionkey"
  private static PROP_AZURE_TILESET_ID = "azuretilesetid"

  getStoredAzureTilesetId(): string | null {
    return localStorage.getItem(LocalStorageService.PROP_AZURE_TILESET_ID)
  }

  storeAzureTilesetId(tilesetId: string | null) {
    localStorage.setItem(LocalStorageService.PROP_AZURE_TILESET_ID, tilesetId??"")
  }

  getStoredAzureSubscriptionKey(): string | null {
    return localStorage.getItem(LocalStorageService.PROP_AZURE_SUBSCRIPTION_KEY)
  }

  storeAzureSubscriptionKey(key: string | null) {
    localStorage.setItem(LocalStorageService.PROP_AZURE_SUBSCRIPTION_KEY, key??"")
  }

  storeStyle(style: Style, layerId: string) {
    let id = LocalStorageService.PROP_LAYER_STYLE + layerId + LocalStorageService.FILL
    let color = style.getFill()?.getColor()
    if (color) {
      localStorage.setItem(id, asString(color as Color))
    }
    id = LocalStorageService.PROP_LAYER_STYLE + layerId + LocalStorageService.STROKE
    color = style.getStroke()?.getColor()
    if (color) {
      localStorage.setItem(id, asString(color as Color))
    }
  }

  getStoredStyle(style: Style, layerId: string) {
    let id = LocalStorageService.PROP_LAYER_STYLE + layerId + LocalStorageService.FILL
    let sColor = localStorage.getItem(id)
    if (sColor) {
      style.getFill()?.setColor(asArray(sColor))

    }
    id = LocalStorageService.PROP_LAYER_STYLE + layerId + LocalStorageService.STROKE
    sColor = localStorage.getItem(id)
    if (sColor) {
      style.getStroke()?.setColor(asArray(sColor))
    }
    //	return style
  }

  storeService(service: OGCService) {
    const ix = LocalStorageService.getServicesIndex()
    const id = LocalStorageService.PROP_PREFIX + ix
    localStorage.setItem(id, JSON.stringify(service))
    service.storagePropertyName = id
    LocalStorageService.increaseIndex(ix)
  }

  clearService(service: OGCService) {
    if (service.storagePropertyName) {
      localStorage.removeItem(service.storagePropertyName)
      service.storagePropertyName = undefined
    }

  }

  getStoredServices(): Array<OGCService> {
    const services = new Array<OGCService>()
    for (let i = 0; i < LocalStorageService.getServicesIndex(); i++) {
      const id = LocalStorageService.PROP_PREFIX + i
      const service = localStorage.getItem(id)
      if (service) {
        const oService: OGCService = JSON.parse(service)
        oService.storagePropertyName = id
        services.push(oService)
      }
    }
    return services
  }

  private static getServicesIndex(): number {
    const sServices = localStorage.getItem(LocalStorageService.PROP_SERVICES_INDEX)
    if (sServices) {
      return Number.parseInt(sServices)
    } else {
      return 0
    }
  }

  private static increaseIndex(ix: number) {
    ix++
    localStorage.setItem(this.PROP_SERVICES_INDEX, ix.toString())
  }

}
