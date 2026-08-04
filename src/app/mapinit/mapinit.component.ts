/**
 * Created by pvesely on 06.10.2021
 */

import { Component, OnInit, ChangeDetectionStrategy, Input, ElementRef } from '@angular/core';

import Map from 'ol/Map';

@Component({
	selector: 'app-mapinit',
	template: '',
	styles: [':host { width: 100%; height: 100%; display: block; }',
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MapInitComponent implements OnInit {
  @Input() map: Map | undefined;
  constructor(private elementRef: ElementRef) {
  }
  ngOnInit() {
    this.map?.setTarget(this.elementRef.nativeElement);
  }

}
