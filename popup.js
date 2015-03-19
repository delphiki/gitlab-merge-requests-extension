var gitlabUrl       = null;
var projects        = [];
var pendingRequests = [];
var sortedData      = [];

var noPending  = document.getElementById('no-pending');
var pendingDiv = document.getElementById('pending-requests');

var sortData = function sortData() {
    var tmp = pendingRequests;
    var projectsIds = [];
    var requestsIds = [];

    for (var i = 0; i < projects.length; i++) {
        if (projectsIds.indexOf(projects[i].id) !== -1) {
            continue;
        }
        projectsIds.push(projects[i].id);

        var tmp2 = {
            id: projects[i].id,
            name: projects[i].name_with_namespace,
            path: projects[i].path_with_namespace,
            mergeRequests: []
        };

        for (var j = 0; j < tmp.length; j++) {
            if (requestsIds.indexOf(tmp[j].id) !== -1) {
                continue;
            }

            if (tmp2.id == tmp[j].project_id) {
                tmp2.mergeRequests.push(tmp[j]);
                requestsIds.push(tmp[j].id);
            }
        }

        if (tmp2.mergeRequests.length > 0) {
            sortedData.push(tmp2);
        }
    }
};

var displayRequests = function displayRequests() {
    sortData();

    var buffer = '';
    for (var i = 0; i < sortedData.length; i++) {
        var p = sortedData[i];
        buffer += '<h3>'+p.name+'</h3>';
        buffer += '<table>';

        for (var j = 0; j < p.mergeRequests.length; j++) {
            var r = p.mergeRequests[j];
            buffer += '<tr><td><a href="'+gitlabUrl+'/'+p.path+'/merge_requests/'+r.iid+'">'+r.title+'</a></td><td>'+r.author.name+'</td></tr>';
        }
        buffer += '</table>';
    }

    pendingDiv.innerHTML = buffer;
};

var updateDisplay = function updateDisplay() {
    gitlabUrl       = chrome.extension.getBackgroundPage().gitlabUrl;
    projects        = chrome.extension.getBackgroundPage().projects;
    pendingRequests = chrome.extension.getBackgroundPage().pendingRequests;

    if (projects.length > 0 && pendingRequests.length > 0) {
        noPending.style.display = 'none';
        displayRequests();
    } else {
        pendingDiv.innerHTML    = '';
        noPending.style.display = 'block';
    }
}();
