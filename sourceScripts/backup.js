export default class Backup {
    constructor() {
    }

    publishGist(gistData) {
        let postContent = {
            description: 'Simprov Provenance Data',
            public: true,
            files: {
                'simprov.json': {
                    content: JSON.stringify(gistData)
                }
            }
        };
        return fetch('https://api.github.com/gists', {
            method: 'post',
            body: JSON.stringify(postContent)
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            return Promise.resolve([data.html_url, data.id]);
        });
    }

    retriveGist(gistID) { //Todo handle invalid ID
        let fetchFrom = `https://api.github.com/gists/${gistID}`;
        return fetch(fetchFrom, {
            method: 'get'
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            return Promise.resolve(JSON.parse(data.files['simprov.json'].content));
        });
    }

    downloadJson(jsonData) {
        let data = `text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(jsonData))}`;
        let link = document.createElement('a');
        link.href = `data:${data}`;
        link.download = 'simprov.json';
        let documentBody = document.body;
        documentBody.appendChild(link);
        link.click();
        documentBody.removeChild(link);
        return Promise.resolve();
    }

    classBackupInformation() {
        console.log('Simprov:> This is Class Backup');
    }

}
