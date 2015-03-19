var privateToken    = null;
var gitlabUrl       = null;
var apiUrl          = null;
var checkPeriod     = 15;
var projects        = [];
var pendingRequests = [];

chrome.storage.sync.get(
    {
        gitlabUrl: null,
        privateToken: null,
        checkPeriod: 15
    },
    function (items) {
        gitlabUrl    = items.gitlabUrl;
        privateToken = items.privateToken;
        checkPeriod  = items.checkPeriod;
        apiUrl       = gitlabUrl + '/api/v3';

        getGlobalCount();
    }
);

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];

        if ('gitlabUrl' === key) {
            gitlabUrl = storageChange.newValue;
            apiUrl = gitlabUrl + '/api/v3';
            getGlobalCount();
        } else if ('privateToken' === key) {
            privateToken = storageChange.newValue;
            getGlobalCount();
        } else if ('checkPeriod' === key) {
            checkPeriod = storageChange.newValue;
            getGlobalCount();
        }
    }
});

var getQuery = function getQuery(url, cb) {
    var timestamp = Date.now();

    if (-1 === url.indexOf('?')) {
        url += '?t='+timestamp;
    } else {
        url += '&t='+timestamp;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl+url, true);
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            cb(JSON.parse(xhr.responseText));
        }
    };
    xhr.send();
};

var updateCounter = function updateCounter(mergeRequests) {
    pendingRequests = pendingRequests.concat(mergeRequests);
    chrome.browserAction.setBadgeText({text: pendingRequests.length+''});
};

var getMergeRequestsFromProjects = function getMergeRequestsFromProjects(data) {
    projects = projects.concat(data);
    for (var i = 0; i < data.length; i++) {
        getQuery('/projects/'+data[i].id+'/merge_requests?state=opened&private_token='+privateToken, updateCounter);
    }
};

var getProjectsFromGroup = function getProjectsFromGroup(group) {
    getMergeRequestsFromProjects(group.projects);
};

var getGroupsData = function getGroupsData(groups) {
    for (var i = 0; i < groups.length; i++) {
        getQuery('/groups/'+groups[i].id+'?private_token='+privateToken, getProjectsFromGroup);
    }
};

var getGlobalCount = function getGlobalCount() {
    projects        = [];
    pendingRequests = [];
    if (null !== gitlabUrl && null !== privateToken) {
        getQuery('/projects?private_token='+privateToken, getMergeRequestsFromProjects);
        getQuery('/groups?private_token='+privateToken, getGroupsData);
    }
    setTimeout(getGlobalCount, checkPeriod * 60 * 1000);
};
