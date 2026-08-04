import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
	selector: '[layersHost]',
})

export class LayersDirective {
	constructor(public viewContainerRef: ViewContainerRef) { }
}