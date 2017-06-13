export default class VendorHooks {
    constructor(configuration) {
        this.verboseVH = configuration;
    }

    isDCInitialized() {
        if (typeof window.dc === 'undefined') {
            new Error('%cSimprov%c:>> %cdc.js is not initialized', 'color:#FF4500', 'color:#FF6347', 'color:#32CD32');
        } else {
            if (this.verboseVH) {
                console.log('%cSimprov%c:>> %cdc.js is initialized', 'color:#FF4500', 'color:#FF6347', 'color:#32CD32');
            }
            return true;
        }
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
        console.log('This is Class VendorHooks');
    }
}

