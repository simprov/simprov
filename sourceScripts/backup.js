export default class Backup {
    constructor() {
    }

    async publishGist(gistData) {
        let postContent = {
            description: 'Simprov Provenance Data',
            public: true,
            files: {
                'simprov.json': {
                    content: JSON.stringify(gistData)
                }
            }
        };
        let response = await fetch('https://api.github.com/gists', {
            method: 'post',
            body: JSON.stringify(postContent)
        });
        let responseData = await response.json();
        return [responseData.html_url, responseData.id];
    }

    async retriveGist(gistID) { //TODO handle invalid ID
        let fetchFrom = `https://api.github.com/gists/${gistID}`;
        let response = await fetch(fetchFrom, {
            method: 'get'
        });
        let responseData = await response.json();
        return (JSON.parse(responseData.files['simprov.json'].content));
    }

    downloadJson(jsonData) {
        return new Promise((resolve) => {
            let data = `text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(jsonData))}`;
            let link = document.createElement('a');
            link.href = `data:${data}`;
            link.download = 'simprov.json';
            let documentBody = document.body;
            documentBody.appendChild(link);
            link.click();
            documentBody.removeChild(link);
            resolve();
        });
    }

    classBackupInformation() {
        console.log('This is Class Backup');
    }

}
