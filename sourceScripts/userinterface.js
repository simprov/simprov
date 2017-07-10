export default class UserInterface {
    constructor() {
    }

    addUserInterface() {
        return new Promise((resolve) => {
            let uiHTML = ` <div id="simprovUserInterface" class="simprov-ui">

    <div id="simprovThumbnailContent" class="simprov-thumbnail-scroll-content"></div>

    <nav class="simprov-vertical-bar">
        <ul>
            <li><a id="simprovThumbnail" href="#" title="Thumbnail Strip"><i id="simprovThumbnailIcon" class="fa fa-image fa-2x"></i></a></li>
            <li><a id="simprovUndo" href="#" title="Undo"><i class="fa fa-rotate-left fa-2x"></i></a></li>
            <li><a id="simprovRedo" href="#" title="Redo"><i class="fa fa-rotate-right fa-2x"></i></a></li>
            <li><a id="simprovOverlay" href="#" title="Gallery"><i id="simprovOverlayIcon" class="fa fa-list-alt fa-2x"></i></a></li>
            <li><a id="simprovImportExport" href="#" title="Operations"><i id="simprovImportExportIcon" class="fa fa-ioxhost fa-2x"></i></a></li>
            <li><a id="simprovRealtime" href="#" title="Realtime"><i id="simprovRealtimeIcon" class="fa fa-rss fa-2x"></i></a></li>
            <li><a id="simprovCollaboration" href="#" title="Collaboration"><i id="simprovCollaborationIcon" class="fa fa-users fa-2x"></i></a></li>
        </ul>
    </nav>

     <div class="simprov-vertical-bar-submenu-import-export">
        <a id="simprovImportJson" class="fa-stack" href="#" title="Import Json"><i class="fa fa-download fa-stack-2x"></i><i class="fa fa-file-text-o fa-stack-1x fa-inverse"></i></a>
        <a id="simprovImportGist" class="fa-stack" href="#" title="Import Gist"><i class="fa fa-download fa-stack-2x"></i><i class="fa fa-git fa-stack-1x fa-inverse"></i></a>
        <a id="simprovProvenanceSize" class="fa-stack" href="#" title="File Size"><i class="fa fa-hdd-o fa-stack-2x"></i><i class="fa fa-database fa-stack-1x fa-inverse"></i></a>
        <a id="simprovSummary" class="fa-stack" href="#" title="Action Summary"><i class="fa fa-bars fa-stack-2x"></i><i class="fa fa-cubes fa-stack-1x fa-inverse"></i></a>
        <a id="simprovExportJson" class="fa-stack" href="#" title="Export Json"><i class="fa fa-upload fa-stack-2x"></i><i class="fa fa-file-text-o fa-stack-1x fa-inverse"></i></a>
        <a id="simprovExportGist" class="fa-stack" href="#" title="Export Gist"><i class="fa fa-upload fa-stack-2x"></i><i class="fa fa-git fa-stack-1x fa-inverse"></i></a>
        <a id="simprovAnnotationPanel" class="fa-stack" href="#" title="Annotation Panel"><i class="fa fa-info-circle fa-stack-2x"></i><i class="fa fa-comments-o fa-stack-1x fa-inverse"></i></a>
        <a id="simprovDeleteData" class="fa-stack" href="#" title="Delete Data"><i class="fa fa-database fa-stack-2x"></i><i class="fa fa-bolt fa-stack-1x fa-inverse"></i></a>
    </div>

    <div class="simprov-vertical-bar-submenu-realtime">
        <a id="simprovImportStreamJson" class="fa-stack" href="#" title="Import Json"><i class="fa fa-download fa-stack-2x"></i><i class="fa fa-file-text-o fa-stack-1x fa-inverse"></i></a>
        <a id="simprovImportStreamGist" class="fa-stack" href="#" title="Import Gist"><i class="fa fa-download fa-stack-2x"></i><i class="fa fa-git fa-stack-1x fa-inverse"></i></a>
        <a id="simprovStreamSize" class="fa-stack" href="#" title="Stream Size"><i class="fa fa-hdd-o fa-stack-2x"></i><i class="fa fa-database fa-stack-1x fa-inverse"></i></a>
        <a id="simprovPersistenceTrue" class="fa-stack" href="#" title="Persistent Mode"><i id="simprovPersistenceTrueIcon"  class="fa fa-cog fa-spin fa-stack-2x"></i><i class="fa fa-wrench fa-stack-1x fa-inverse"></i></a>
        <a id="simprovPersistenceFalse" class="fa-stack" href="#" title="Non-Persistent Mode"><i id="simprovPersistenceFalseIcon" class="fa fa-cog fa-stack-2x"></i><i class="fa fa-wrench fa-stack-1x fa-inverse"></i></a>
        <a id="simprovExportStreamJson" class="fa-stack" href="#" title="Export Json"><i class="fa fa-upload fa-stack-2x"></i><i class="fa fa-file-text-o fa-stack-1x fa-inverse"></i></a>
        <a id="simprovExportStreamGist" class="fa-stack" href="#" title="Export Gist"><i class="fa fa-upload fa-stack-2x"></i><i class="fa fa-git fa-stack-1x fa-inverse"></i></a>
    </div>

    <div class="simprov-vertical-bar-submenu-collaboration">
        <a id="simprovCollaborate" class="fa-stack" href="#" title="Collaborate"><i class="fa fa-cloud fa-stack-2x"></i><i class="fa fa-handshake-o fa-stack-1x fa-inverse"></i></a>
        <a id="simprovCollaborationKey" class="fa-stack" href="#" title="Collaboration Key"><i class="fa fa-plug fa-stack-2x"></i><i class="fa fa-key fa-stack-1x fa-inverse"></i></a>
    </div>

</div>

<div class="simprov-overlay">
    <a id="simprovOverlayCloseIcon" class="simprov-overlay-close" href="#"><i class="fa fa-window-close"></i></a>

    <div id="simprovTree" class="simprov-overlay-tree-container"></div>

    <div id="simprovTable" class="simprov-overlay-table-container">
        <div class="simprov-overlay-table-header">
            <table>
                <thead>
                <tr>
                    <th>Thumbnail</th>
                    <th>ID</th>
                    <th>Captured</th>
                    <th>Operations</th>
                </tr>
                </thead>
            </table>
        </div>

        <div class="simprov-overlay-table">
            <table>
                <tbody id="simprovTableContent"></tbody>
            </table>
        </div>

    </div>

</div>

<div class="simprov-annotation-overlay">
    <a id="simprovAnnotationOverlayCloseIcon" class="simprov-annotation-overlay-close" href="#"><i class="fa fa-window-close"></i></a>

    <div id="simprovAnnotationTable" class="simprov-annotation-overlay-table-container">
        <div class="simprov-annotation-overlay-table-header">
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Annotate</th>
                </tr>
                </thead>
            </table>
        </div>

        <div class="simprov-annotation-overlay-table">
            <table>
                <tbody id="simprovAnnotationTableContent"></tbody>
            </table>
        </div>

    </div>

</div>`;

            $(document.body).append(uiHTML);
            resolve();
        });
    }

    disableStreamImportUIButtons() {
        return new Promise((resolve) => {
            $('#simprovImportStreamJson').off('click');
            $('#simprovImportStreamJson').addClass('simprov-disabled');
            $('#simprovImportStreamGist').off('click');
            $('#simprovImportStreamGist').addClass('simprov-disabled');
            resolve();
        });
    }
}