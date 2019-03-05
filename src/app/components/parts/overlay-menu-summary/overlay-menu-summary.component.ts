import { Component, OnInit } from '@angular/core';
import { VariantSummaryTrackService, GenomeBrowserOverlay } from '../../../services/genome-browser/variant-summary-track-service';

@Component({
    selector: 'app-overlay-menu-summary',
    templateUrl: './overlay-menu-summary.component.html',
    styleUrls: ['./overlay-menu-summary.component.css']
})
export class OverlayMenuSummaryComponent implements OnInit {

    overlays: GenomeBrowserOverlay[] = [];

    constructor(public variantTrack: VariantSummaryTrackService) {
        this.overlays = variantTrack.overlays;
    }

    ngOnInit() {

    }

    activateOverlay(overlay: GenomeBrowserOverlay) {
        this.variantTrack.setOverlay(overlay);
    }
}