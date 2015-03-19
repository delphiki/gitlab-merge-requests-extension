var privateToken    = null;
var gitlabUrl       = null;
var apiUrl          = null;
var checkPeriod     = 15;
var projects        = [];
var pendingRequests = [];
var timer           = null;

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
        } else if ('privateToken' === key) {
            privateToken = storageChange.newValue;
        } else if ('checkPeriod' === key) {
            checkPeriod = storageChange.newValue;
        }

        if (['gitlabUrl', 'privateToken', 'checkPeriod'].indexOf(key) !== -1) {
            clearTimeout(timer);
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

var betterConcat = function betterConcat(arr1, arr2) {
    for (var i = 0; i < arr2.length; i++) {
        if (arr1.indexOf(arr2[i]) === -1) {
            arr1.push(arr2[i]);
        }
    }

    return arr1;
};

var updateCounter = function updateCounter(mergeRequests) {
    if (0 === mergeRequests.length) {
        return;
    }

    pendingRequests = betterConcat(pendingRequests, mergeRequests);
    chrome.browserAction.setBadgeText({text: pendingRequests.length+''});
    chrome.browserAction.setBadgeBackgroundColor({color: [0,0,0,0]});
    if (0 === pendingRequests.length) {
        chrome.browserAction.setBadgeBackgroundColor({color: [0,200,0,255]});
    }
};

var getMergeRequestsFromProjects = function getMergeRequestsFromProjects(data) {
    if (0 === data.length) {
        return;
    }

    projects = betterConcat(projects, data);
    for (var i = 0; i < data.length; i++) {
        getQuery('/projects/'+data[i].id+'/merge_requests?state=opened&private_token='+privateToken, updateCounter);
    }
};

var getProjectsFromGroup = function getProjectsFromGroup(group) {
    console.log(group);
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
    timer = setTimeout(getGlobalCount, checkPeriod * 60 * 1000);
};
