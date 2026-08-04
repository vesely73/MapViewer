import {ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';

import {providePrimeNG} from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import {HttpClient, provideHttpClient} from '@angular/common/http';
import {DialogService} from 'primeng/dynamicdialog';
import {provideAnimations} from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideZoneChangeDetection({eventCoalescing: true}),
		provideRouter(routes),
		providePrimeNG({
			theme: {
				preset: Aura
			}
    }),
    provideHttpClient(),
    provideAnimations(),
    DialogService
	]
};
