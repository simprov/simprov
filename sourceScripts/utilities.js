import SHA512 from 'sha512-es';
import swal from 'sweetalert2';

export default class Utilities {
    constructor() {
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

    async loadJson() {
        let inputFile = await swal({
            title: 'Import Provenance',
            type: 'question',
            input: 'file',
            showCancelButton: true,
            showCloseButton: true,
            cancelButtonColor: '#d9534f',
            confirmButtonText: 'Import',
            confirmButtonColor: '#5cb85c',
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
            });
        } catch (reason) {
            if (reason === 'cancel' || reason === 'esc') {
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
            });
        } catch (reason) {
            if (reason === 'cancel' || reason === 'esc') {
                decision = false;
            }
        }
        return decision;
    }

    async gistInput() {
        let validator = (input) => {
            return new Promise(function (resolve, reject) {
                if (input) {
                    if (input.length < 32) {
                        reject('Please enter a valid ID');
                    }
                    else {
                        resolve();
                    }
                } else {
                    reject('Please enter a valid ID');
                }
            });
        };
        let gistID = await swal({
            title: 'Import Provenance',
            text: 'Enter Gist ID',
            input: 'text',
            inputPlaceholder: 'Gist ID',
            inputAttributes: {
                maxlength: '32'
            },
            type: 'question',
            showCancelButton: true,
            showCloseButton: true,
            cancelButtonColor: '#d9534f',
            confirmButtonText: 'Import',
            confirmButtonColor: '#5cb85c',
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

    async gistConfirmation(gistInformation) {
        await swal({
            title: 'Provenance Exported',
            html: `<a href=${gistInformation[0]} style="text-decoration: none; color:#a5dc86" target="_blank">Explore on GitHub</a>`,
            input: 'text',
            inputValue: `             ${gistInformation[1]}`,
            inputAttributes: {
                readonly: true
            },
            type: 'success',
            confirmButtonColor: '#5cb85c',
            allowOutsideClick: false,
            showCloseButton: true
        }).catch(swal.noop);
    }

    async jsonConfirmation() {
        await swal({
            title: 'Provenance Exported',
            text: 'simprov.json downloaded',
            type: 'success',
            timer: 3000,
            confirmButtonColor: '#5cb85c',
            showCloseButton: true
        }).catch(swal.noop);
    }

    async corruptConfirmation() {
        await swal({
            title: 'Import Error',
            text: 'Corrupt provenance imported',
            type: 'error',
            confirmButtonColor: '#d9534f',
            showCloseButton: true
        }).catch(swal.noop);
    }

    async importConfirmation(recordCount) {
        await swal({
            title: 'Import Successful',
            text: `${recordCount} records imported`,
            type: 'success',
            timer: 3000,
            confirmButtonColor: '#5cb85c',
            showCloseButton: true
        }).catch(swal.noop);
    }

    async deleteConfirmation() {
        let decision = false;
        try {
            decision = await swal({
                title: 'Delete Provenance',
                text: 'Are you sure?',
                type: 'warning',
                showCloseButton: true,
                showCancelButton: true,
                cancelButtonColor: '#5cb85c',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#f0ad4e',
                allowOutsideClick: false,
            });
        } catch (reason) {
            if (reason === 'cancel' || reason === 'esc') {
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
                allowOutsideClick: false
            }).catch(swal.noop);
        }
        return decision;
    }

    classUtilitiesInformation() {
        console.log('This is Class Utilities');
    }
}