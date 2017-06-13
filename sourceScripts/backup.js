export default class Backup {
    constructor() {
    }

    async publishGist(gistData, fileName, fileDescription) {
        let postContent = {
            description: fileDescription,
            public: true,
            files: {
                [fileName]: {
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

    async retriveGist(gistID, fileName) { //TODO handle invalid ID
        let fetchFrom = `https://api.github.com/gists/${gistID}`;
        let response = await fetch(fetchFrom, {
            method: 'get'
        });
        let responseData = await response.json();
        return (JSON.parse(responseData.files[fileName].content));
    }

    downloadJson(jsonData, fileName) {
        return new Promise((resolve) => {
            let data = `text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(jsonData))}`;
            let link = document.createElement('a');
            link.href = `data:${data}`;
            link.download = fileName;
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
