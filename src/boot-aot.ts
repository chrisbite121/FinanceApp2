// app/boot-aot.ts 
import {platformBrowser} from "@angular/platform-browser";
import {AppModuleNgFactory} from "../aot/src/app/app.module.ngfactory";
import { enableProdMode } from '@angular/core'
// for enterprise customers
// import {LicenseManager} from "ag-grid-enterprise/main";
// LicenseManager.setLicenseKey("your license key");
if (process.env.ENV === 'production') {
    enableProdMode();
    console.log('prod mode');
}
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);