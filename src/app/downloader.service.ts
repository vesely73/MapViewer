import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {TreeNode} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class DownloaderService {
  constructor(private http: HttpClient) { }

  getServices() {
    return this.http.get<any>('assets/services.json')
      .toPromise()
      .then(res => <TreeNode[]>res.data);
  }

}
