import { Variant } from './variant';
import { VariantSummary } from './variant-summary';
import { GenericAutocompleteResult } from './autocomplete-result';
import { VariantSearchService } from '../services/variant-search-service';
import { SampleSearch } from '../services/sample-search.service';
import { VariantSummarySearchService } from '../services/variant-summary-search-service';
import { Region } from './region';
import { SearchOption } from './search-option';
import { SearchQueries } from './search-query';
import { Position } from './position';
export class RegionAutocomplete extends GenericAutocompleteResult<Region> {
    /*search(ss: SampleSearch, vsal: VariantSearchService, options: SearchOption[]): Promise<Variant[]> {
        return ss.getSamples(new SearchQuery(this.result.chromosome, this.result.start, this.result.end, options)).then(() => {
            return vsal.getVariants(new SearchQuery(this.result.chromosome, this.result.start, this.result.end, options));
        })
    }*/

    getRegion(): Promise<Region> {
        if(this.result.genes.length > 0){
            return Promise.resolve(new Region(this.result.chromosome, this.result.start, this.result.end, this.result.genes));
        }
        return Promise.resolve(new Region(this.result.chromosome, this.result.start, this.result.end));
    }

    searchSummary(vsal2: VariantSummarySearchService, options: SearchOption[]): Promise<VariantSummary[]> {
        return vsal2.getVariants(new SearchQueries([new Region(this.result.chromosome, this.result.start, this.result.end)], options));
    }

    region(): Promise<Region> {
        return Promise.resolve(new Region(this.result.chromosome, this.result.start, this.result.end));
    }

    displayName(): string {
        return this.symbol;
    }

    categoryName() {
        return this.result instanceof Position ? 'Position' : 'Region';
    }

    match(query: string) {
        let queryTrimmed = query.trim();
        return this.symbol === queryTrimmed;
    }
}
