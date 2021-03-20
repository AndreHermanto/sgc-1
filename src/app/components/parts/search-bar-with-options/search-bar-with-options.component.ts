import { Component, Input, HostListener, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { SearchBarService, ENSEMBL_LENGTH_LIMIT } from '../../../services/search-bar-service';
import { ClinicalFilteringService } from '../../../services/clinical-filtering.service';
import { ScrollService } from '../../../services/scroll-service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-search-bar-with-options',
    templateUrl: './search-bar-with-options.component.html',
    styleUrls: ['./search-bar-with-options.component.css']
})
export class SearchBarWithOptionsComponent implements AfterViewInit, OnInit {
    @Input() expanded = false;
    @Input() expandable = false;
    @Input() example1 = 'CFTR';
    @Input() example2 = '22:46546424-46639653';
    @Input() action = (query) => {
        this.searchBarService.query = query;
        const cohort = this.searchBarService.options[0].getValue();
        const build = this.searchBarService.buildOptions[0].getValue();
        const obj = {query: query, cohort: cohort, build: build, timestamp: Date.now()};
        this.clinicalFilteringService.clearFilters();
        this.router.navigate(['/search/results', obj]);
    };
    @Input() bgColor = 'white';
    private subscriptions: Subscription[] = [];
    regionError: boolean = false;
    ensemblLimit = ENSEMBL_LENGTH_LIMIT;

    @HostListener('document:click', ['$event']) onClick($event: Event) {
        this.toggleExpansion($event);
    }
    @HostListener('document:touch', ['$event']) onTouch($event: Event) {
        this.toggleExpansion($event);
    }
    @HostListener('document:touchstart', ['$event']) onTouchstart($event: Event) {
        this.toggleExpansion($event);
    }

    constructor(public elf: ElementRef,
                public router: Router,
                public searchBarService: SearchBarService,
                public clinicalFilteringService: ClinicalFilteringService ) {
    }

    ngOnInit(): void {
        this.searchBarService.autocompleteError = "";
    }
    
    ngAfterViewInit(): void {
        this.searchBarService.searchedEvent.subscribe(() => {
            this.expanded = false;
        });

        this.subscriptions.push(this.searchBarService.startGreaterThanEnd.subscribe((flag) =>{
            this.regionError = flag;
        }));
    }

    toggleExpansion($event: Event) {
        if (!$event) {
            return;
        }
        if (!this.elf.nativeElement.contains($event.target)) {
            if (this.expandable) {
                this.expanded = false;
            }
        }
    }

    onFocus() {
        if (this.expandable) {
            this.expanded = true;
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

}
