import SHA512 from 'sha512-es';
import swal from 'sweetalert2';
import toastr from 'toastr';
import copy from 'copy-to-clipboard';

export default class Utilities {
    constructor() {
        this.toastrAlertOptions = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": true,
            "progressBar": true,
            "positionClass": "toast-bottom-right",
            "preventDuplicates": true,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };
    }

    timeStampMaker() {
        return new Promise((resolve) => {
            let now = new Date();
            let date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
            let time = [now.getHours(), now.getMinutes(), now.getSeconds()];
            let suffix = (time[0] < 12) ? "AM" : "PM";
            time[0] = ( time[0] <= 12 ) ? time[0] : time[0] - 12;
            for (let i = 1; i < 3; i++) {
                if (time[i] < 10) {
                    time[i] = "0" + time[i];
                }
            }
            let timeStamp = `on ${date.join('/')} at ${time.join(':')} ${suffix}`;
            resolve(timeStamp);
        });
    }

    hashComputor(requiredData) {
        return new Promise((resolve) => {
            let requiredDataString = JSON.stringify(requiredData);
            let hashedValue = SHA512.hash(requiredDataString);
            resolve(hashedValue);
        });
    }

    async loadJson(titleText) {
        let inputFile = await swal({
            title: titleText,
            type: 'info',
            input: 'file',
            showCancelButton: true,
            showCloseButton: true,
            cancelButtonColor: '#d9534f',
            confirmButtonText: 'Import',
            confirmButtonColor: '#5cb85c',
            allowEscapeKey: false,
            inputAttributes: {
                accept: 'application/json'
            }
        }).catch(swal.noop);
        let parsedFile = null;
        if (inputFile) {
            parsedFile = await this.fileParser(inputFile);
            return parsedFile;
        }
        else {
            return parsedFile;
        }
    }

    fileParser(requiredFile) {
        return new Promise((resolve) => {
            let fileReader = new FileReader();
            fileReader.onload = (event) => {
                resolve(JSON.parse(event.target.result));
            };
            fileReader.readAsText(requiredFile);
        });
    }

    async userCredentialDecision() {
        let decision = false;
        try {
            decision = await swal({
                title: 'Import Provenance',
                text: 'Update Username and CUID from file?',
                type: 'question',
                showCancelButton: true,
                cancelButtonColor: '#d9534f',
                confirmButtonText: 'Update',
                confirmButtonColor: '#5cb85c',
                allowOutsideClick: false,
                allowEscapeKey: false
            });
        } catch (reason) {
            if (reason === 'cancel') {
                decision = false;
            }
        }
        return decision;
    }

    async modifyRecordsDecision() {
        let decision = false;
        try {
            decision = await swal({
                title: 'Import Provenance',
                text: 'Update records with current Username and CUID?',
                type: 'question',
                showCancelButton: true,
                cancelButtonColor: '#d9534f',
                confirmButtonText: 'Update',
                confirmButtonColor: '#5cb85c',
                allowOutsideClick: false,
                allowEscapeKey: false
            });
        } catch (reason) {
            if (reason === 'cancel') {
                decision = false;
            }
        }
        return decision;
    }

    async gistInput(titleText) {
        let validator = (input) => {
            return new Promise(function (resolve, reject) {
                if (input) {
                    if (input.length < 32) {
                        reject('Please enter a valid 32 character gist id');
                    }
                    else {
                        resolve();
                    }
                } else {
                    reject('Please enter a valid 32 character gist id');
                }
            });
        };
        let gistID = await swal({
            title: titleText,
            text: 'Enter Gist ID',
            input: 'text',
            inputPlaceholder: 'id',
            inputAttributes: {
                maxlength: '32'
            },
            type: 'info',
            showCancelButton: true,
            showCloseButton: true,
            cancelButtonColor: '#d9534f',
            confirmButtonText: 'Import',
            confirmButtonColor: '#5cb85c',
            allowOutsideClick: false,
            allowEscapeKey: false,
            inputValidator: validator
        }).catch(swal.noop);
        if (gistID) {
            return gistID;
        }
        else {
            gistID = null;
            return gistID;
        }
    }

    async gistConfirmation(gistInformation, titleText) {
        await swal({
            title: titleText,
            html: `<a href=${gistInformation[0]} style="text-decoration: none; color:#a5dc86" target="_blank">Click here to explore on GitHub</a>`,
            input: 'text',
            inputValue: `             ${gistInformation[1]}`,
            inputAttributes: {
                readonly: true
            },
            type: 'success',
            confirmButtonColor: '#5cb85c',
            confirmButtonText: 'Copy and Close',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).catch(swal.noop);
        await this.copyID(gistInformation[1]);
    }

    async jsonConfirmation(titleText, textText) {
        await swal({
            title: titleText,
            text: textText,
            type: 'success',
            timer: 3000,
            confirmButtonColor: '#5cb85c',
            showCloseButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false
        }).catch(swal.noop);
    }

    async corruptConfirmation() {
        await swal({
            title: 'Import Error',
            text: 'Corrupt provenance imported',
            type: 'error',
            confirmButtonColor: '#d9534f',
            showCloseButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false
        }).catch(swal.noop);
    }

    async importConfirmation(recordCount) {
        await swal({
            title: 'Import Successful',
            text: `${recordCount} records imported`,
            type: 'success',
            timer: 3000,
            confirmButtonColor: '#5cb85c',
            showCloseButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false
        }).catch(swal.noop);
    }

    async deleteConfirmation() {
        let decision = false;
        try {
            decision = await swal({
                title: 'Delete Provenance',
                text: 'Are you sure?',
                type: 'warning',
                showCancelButton: true,
                cancelButtonColor: '#5cb85c',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#f0ad4e',
                allowOutsideClick: false,
                allowEscapeKey: false
            });
        } catch (reason) {
            if (reason === 'cancel') {
                decision = false;
            }
        }
        if (decision) {
            await swal({
                title: 'Deletion Successful',
                text: 'Will reinitialize in a moment',
                type: 'info',
                timer: 2000,
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false
            }).catch(swal.noop);
        }
        return decision;
    }

    static async usernameInputHelper() {
        let validator = (input) => {
            return new Promise(function (resolve, reject) {
                if (input) {
                    if (input.length < 6) {
                        reject('Please enter a valid six characters plus username');
                    }
                    else {
                        resolve();
                    }
                } else {
                    reject('Please enter a valid six characters plus username');
                }
            });
        };
        let usernameInput = await swal({
            title: 'Username',
            text: 'Enter username',
            input: 'text',
            inputPlaceholder: 'username',
            inputAttributes: {
                maxlength: '16'
            },
            type: 'info',
            confirmButtonColor: '#5cb85c',
            allowOutsideClick: false,
            allowEscapeKey: false,
            inputValidator: validator
        }).catch(swal.noop);
        return usernameInput;
    }

   async copyID(gistID){
       copy(gistID);
       let timeStamp = await this.timeStampMaker();
       let tempConsoleMessage = `%cSimprov%c:%c[${timeStamp}]%c>> %cCopied gist id to clipboard`;
       console.log(tempConsoleMessage, 'color:#FF4500', 'color:#FF6347', 'color:#DAA520', 'color:#FF6347', 'color:#32CD32');
       await this.toastrAlert('Copied gist id to clipboard', 'info');
    }

    toastrAlert(toastrMessage, toastrType) {
        return new Promise((resolve) => {
            toastr[toastrType](toastrMessage, null, this.toastrAlertOptions);
            resolve();
        });
    }

    classUtilitiesInformation() {
        console.log('This is Class Utilities');
    }
}