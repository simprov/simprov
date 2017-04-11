export default class VendorHooks {
    constructor() {
    }

    isDCInitialized() {
        if (typeof window.dc === 'undefined') {
            throw '> dc.js is not initialized';
        } else
            console.log('Simprov:> dc.js is initialized');
        return true;
    }

    dcRegistry(...exclude) {
        this.isDCInitialized();
        let tempChartRegistry = Array.from(dc.chartRegistry.list());
        if (exclude !== undefined) {
            exclude.sort((a, b) => {
                return a - b;
            });
            exclude.forEach(function (item, index, array) {
                array[index] = item - 1;
            });
            while (exclude.length) {
                tempChartRegistry.splice(exclude.pop(), 1);
            }
            return tempChartRegistry;
        }
        else {
            return tempChartRegistry;
        }
    }

    classVendorHookseInformation() {
        console.log('Simprov:> This is Class VendorHooks');
    }
}

