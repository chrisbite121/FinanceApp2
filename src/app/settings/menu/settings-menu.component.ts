import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'settings-menu',
    templateUrl: './settings-menu.component.html',
    styleUrls: [`../settings.component.css`]
})
export class SettingsMenuComponent {

    constructor(route: ActivatedRoute) {
        route.params.subscribe(params => console.log("side menu id parameter", params['id']))
    }

 }