import {Inject, Injectable, LOCALE_ID} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {TreeNode} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class DownloaderService {
  constructor(
    private http: HttpClient,
    @Inject(LOCALE_ID) private localeId: string
  ) { }

  getServices() {
    const servicesFile = this.localeId.toLowerCase().startsWith('cs')
      ? 'assets/services_cz.json'
      : 'assets/services.json';

    return this.http.get<any>(servicesFile)
      .toPromise()
      .then(res => <TreeNode[]>res.data);
  }

}
