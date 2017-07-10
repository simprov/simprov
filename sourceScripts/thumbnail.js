import rasterizeHTML from './rasterizeHTML.allinone'; //TODO remember to update file, when new version available from npm

export default class Thumbnail {
    constructor(configuration) {
        this.userInterfaceT = configuration;
        this.requiredWidth = 300;
        this.requiredHeight = 285;
        this.allInFrame = true;
        this.plainCSSString = '';
    }

    cssCollector() {
        return new Promise((resolve) => {
            let allStyleSheets = document.styleSheets;
            // console.log(allStyleSheets);
            let plainCSSArray = [];
            for (let styleSheet of allStyleSheets) {
                for (let cssRules of styleSheet.cssRules) {
                    plainCSSArray.push(cssRules.cssText);
                }
            }
            // console.log(plainCSSArray);
            let plainCSSString = plainCSSArray.join('');
            // console.log(plainCSSString);
            resolve(plainCSSString);
        });
    }

    dimensionComputor(renderedCanvas) {
        return new Promise((resolve) => {
            let actualWidth = renderedCanvas.width;
            let actualHeight = renderedCanvas.height;
            let dimensions = {width: 0, height: 0};
            let scaleX1 = this.requiredWidth;
            let scaleY1 = (actualHeight * this.requiredWidth) / actualWidth;
            let scaleX2 = (actualWidth * this.requiredHeight) / actualHeight;
            let scaleY2 = this.requiredHeight;
            let scaleOnWidth = false;
            scaleOnWidth = scaleX2 > this.requiredWidth;
            if (scaleOnWidth) {
                scaleOnWidth = this.allInFrame;
            }
            else {
                scaleOnWidth = !this.allInFrame;
            }

            if (scaleOnWidth) {
                dimensions.width = Math.floor(scaleX1);
                dimensions.height = Math.floor(scaleY1);
            }
            else {
                dimensions.width = Math.floor(scaleX2);
                dimensions.height = Math.floor(scaleY2);
            }
            dimensions.left = Math.floor((this.requiredWidth - dimensions.width) / 2);
            dimensions.top = Math.floor((this.requiredHeight - dimensions.height) / 2);
            // console.log(dimensions);
            resolve(dimensions);
        });
    }

    async thumbnailMaker(thumbnailConfiguration) {
        let {cropLeftOffset, cropTopOffset, thumbnailWidth, thumbnailHeight} = thumbnailConfiguration;
        let documentClone = document.cloneNode(true);
        // console.log(documentClone);
        let documentBody = documentClone.body;
        // console.log(documentBody);
        let allBodyScripts = documentBody.getElementsByTagName('script');
        // console.log(allBodyScripts.length);
        let aBSLength = allBodyScripts.length;
        while (aBSLength--) {
            allBodyScripts[aBSLength].parentNode.removeChild(allBodyScripts[aBSLength]);
        }
        if (this.userInterfaceT) {
            let simprovUIDiv = documentClone.getElementById('simprovUserInterface');
            simprovUIDiv.remove();
        }
        if (documentClone.getElementById('toast-container')) {
            let toastContainerDiv = documentClone.getElementById('toast-container');
            toastContainerDiv.remove();
        }
        // console.log(documentBody);
        if (!this.plainCSSString.length) {
            this.plainCSSString = await this.cssCollector();
        }
        // console.log(plainCSSString);
        let newStyleSheet = documentClone.createElement('style');
        newStyleSheet.appendChild(documentClone.createTextNode(this.plainCSSString));
        documentBody.appendChild(newStyleSheet);
        documentBody.insertBefore(newStyleSheet, documentBody.firstChild);

        let actualBDimensions = document.body.getBoundingClientRect();
        let bodyWidth = actualBDimensions.width;
        let bodyHeight = actualBDimensions.height;
        // console.log(bodyWidth, bodyHeight);

        let rasterizeHtmlCanvas = documentClone.createElement('canvas');
        rasterizeHtmlCanvas.width = bodyWidth;
        rasterizeHtmlCanvas.height = bodyHeight;
        let rasterizeHtmlCContex = rasterizeHtmlCanvas.getContext('2d');

        await rasterizeHTML.drawDocument(documentBody, rasterizeHtmlCanvas);

        let thumbnailCanvas = document.createElement('canvas');
        thumbnailCanvas.width = thumbnailWidth;
        thumbnailCanvas.height = thumbnailHeight;
        let thumbnailCanvasContext = thumbnailCanvas.getContext('2d');

        thumbnailCanvasContext.drawImage(rasterizeHtmlCanvas, cropLeftOffset, cropTopOffset, thumbnailWidth, thumbnailHeight, 0, 0, thumbnailWidth, thumbnailHeight);

        let dimensions = await this.dimensionComputor(thumbnailCanvas);
        let resizedThumbnailCanvas = document.createElement('canvas');
        resizedThumbnailCanvas.width = this.requiredWidth;
        resizedThumbnailCanvas.height = this.requiredHeight;
        let resizedThumbnailCanvasContext = resizedThumbnailCanvas.getContext('2d');
        resizedThumbnailCanvasContext.fillStyle = 'WhiteSmoke';
        resizedThumbnailCanvasContext.fillRect(0, 0, this.requiredWidth, this.requiredHeight);
        resizedThumbnailCanvasContext.drawImage(thumbnailCanvas, dimensions.left, dimensions.top, dimensions.width, dimensions.height);
        return resizedThumbnailCanvas.toDataURL();
    }

    classThumbnailInformation() {
        console.log('This is Class Thumbnail');
    }
}
