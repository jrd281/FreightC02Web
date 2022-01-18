import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApexOptions } from 'ng-apexcharts';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import {HomeService} from './home.service';
import {SettingsService} from '../settings/settings.service';
import {SettingsOrganization} from '../settings/settings.types';
import {Info} from './info.types';
import {DatePipe} from '@angular/common';

@Component({
    selector       : 'home',
    templateUrl    : './home.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy
{
    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};
    data: any;
    organizationName: string = '';
    settingsOrganization: SettingsOrganization;
    rowIngestionCount: string ='-';
    newRowIngestionCount: string ='-';
    info: Info;
    timeWindowOptions = [
        {label: 'Today', value: 1},
        {label: 'Past 7 Days', value: 7},
        {label: 'Past 30 Days', value: 30}
    ];
    lastProcessDate: string;
    numberOfTmses: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _projectService: ProjectService,
        private _homeService: HomeService,
        private _settingsService: SettingsService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.organizationName = '';
        this._settingsService.settingsOrganization$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.settingsOrganization = data;
                if ( this.settingsOrganization !== undefined ) {
                    this.organizationName = this.settingsOrganization.name;
                }
            });
        this._homeService.info
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.info = data;

                const processTimes = this.info.etlstats
                    .filter(value => value.processTime !== undefined)
                    .map(value => value.processTime);

                if ( processTimes.length > 0 ) {
                    const lastProcessTime = Math.max(...processTimes);
                    // eslint-disable-next-line max-len
                    this.lastProcessDate = (new Date(lastProcessTime)).toLocaleTimeString([], {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } else {
                    this.lastProcessDate = 'No TMS Data Yet';
                }

                const tmses = this.info.etlstats
                    .filter(value => value.sourceName !== undefined)
                    .map(value => value.sourceName);
                const tmsCount = [...new Set(tmses)];

                if ( tmsCount.length === 0 ) {
                    this.numberOfTmses = 'No TMS Data Yet';
                } else {
                    this.numberOfTmses = (tmsCount.length).toString();
                }

                this.handleNewRowIngestionChange(1);
                this.handleRowIngestionChange(1);
            });
        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    }
                }
            }
        };
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    public handleRowIngestionChange(value: any): void {
        if ( value !== undefined && this.info !== undefined ) {
            const milliLowerBound = (new Date()).getTime() - (value * 86400000);
                this.rowIngestionCount = String(this.info.etlstats.filter((etlStat) => {
                    return etlStat.processTime !== undefined && (etlStat.processTime > milliLowerBound);
                }).reduce((previousValue, currentValue) => previousValue + currentValue.rowcount, 0));
        } else {
            this.rowIngestionCount = '-';
        }
    }

    public handleNewRowIngestionChange(value: any): void {
        if ( value !== undefined && this.info !== undefined ) {
            const milliLowerBound = (new Date()).getTime() - (value * 86400000);
            this.newRowIngestionCount = String(this.info.etlstats.filter((etlStat) => {
                return etlStat.processTime !== undefined && (etlStat.processTime > milliLowerBound);
            }).reduce((previousValue, currentValue) => previousValue + currentValue.new, 0));
        } else {
            this.newRowIngestionCount = '-';
        }
    }
    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void
    {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
             .filter(el => el.getAttribute('fill').indexOf('url(') !== -1)
             .forEach((el) => {
                 const attrVal = el.getAttribute('fill');
                 el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
             });
    }
}
