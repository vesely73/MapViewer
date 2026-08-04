/**
 * Created by pvesely on 28.10.2021
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {DynamicDialogConfig} from "primeng/dynamicdialog";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {Tab, TabList, TabPanel, TabPanels, Tabs} from "primeng/tabs";
import {HttpClient} from '@angular/common/http';

@Component({
	selector: 'app-wmsfeatureinfo',
	templateUrl: './wmsfeatureinfo.component.html',
	styleUrls: ['./wmsfeatureinfo.component.css'],
	imports: [
		Tabs,
		TabList,
		Tab,
		TabPanels,
		TabPanel
	],
	encapsulation: ViewEncapsulation.None
})

export class WmsfeatureinfoComponent {

	gfis:Array<GetFeatureInfoType>

	constructor(private config: DynamicDialogConfig, private sanitizer: DomSanitizer, private http: HttpClient) {
		this.gfis = config.data
    this.loadHtmlContents();
	}


  private loadHtmlContents() {
    this.gfis.forEach((gfi, idx) => {
      this.http.get(gfi.url, { responseType: 'text' }).subscribe(html => {
        gfi.html = this.sanitizer.bypassSecurityTrustHtml(html);
      });
    });
  }
}

export interface GetFeatureInfoType {

	url:string
	title:string
  html?:SafeHtml

}
