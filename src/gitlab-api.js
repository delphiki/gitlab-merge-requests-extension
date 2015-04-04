var privateToken    = null;
var gitlabUrl       = null;
var apiUrl          = null;
var checkPeriod     = 15;
var config          = {
    notMine: false,
    unassignedOnly: false
};

var projects        = [];
var pendingRequests = [];
var timer           = null;
var projectsPage    = 1;

var currentUser = null;

chrome.storage.sync.get(
    {
        gitlabUrl: null,
        privateToken: null,
        checkPeriod: 15,
        config: {
            notMine: false,
            unassignedOnly: false
        }
    },
    function (items) {
        gitlabUrl    = items.gitlabUrl;
        privateToken = items.privateToken;
        checkPeriod  = items.checkPeriod;
        config       = items.config;

        apiUrl       = gitlabUrl + '/api/v3';

        getGlobalCount();
    }
);

// listeners
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
        } else if ('config' === key) {
            config = storageChange.newValue;
        }

        if (['gitlabUrl', 'privateToken', 'checkPeriod', 'config'].indexOf(key) !== -1) {
            clearTimeout(timer);
            getGlobalCount();
        }
    }
});

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse) {
    console.log(request.action);
    if("refresh" === request.action) {
        clearTimeout(timer);
        getGlobalCount();
    }
});


var getQuery = function getQuery(url, cb) {
    var timestamp = Date.now();
    var hasParams = (-1 !== url.indexOf('?'));

    url = apiUrl+url;
    url += (hasParams ? '&' : '?')+'private_token='+privateToken;
    url += '&t='+timestamp;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
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

// display methods
var updateCounter = function updateCounter(mergeRequests) {
    if (0 === mergeRequests.length) {
        return;
    }

    var validRequests = [];
    for (var i = 0; i < mergeRequests.length; i++) {
        if (config.notMine && mergeRequests[i].author.id === currentUser.id
        || config.unassignedOnly && null !== mergeRequests[i].assignee) {
            continue;
        }
        validRequests.push(mergeRequests[i]);
    }

    pendingRequests = betterConcat(pendingRequests, validRequests);
    chrome.browserAction.setBadgeText({text: pendingRequests.length+''});
    chrome.browserAction.setBadgeBackgroundColor({color: [0,0,0,0]});
    if (0 === pendingRequests.length) {
        chrome.browserAction.setBadgeBackgroundColor({color: [0,200,0,255]});
    }
    chrome.runtime.sendMessage({ message: "refreshed" });
};

// api methods

var getMergeRequestsFromProjects = function getMergeRequestsFromProjects(userProjects) {
    if (0 === userProjects.length) {
        projectsPage = 1;
        return;
    }

    projects = betterConcat(projects, userProjects);
    for (var i = 0; i < userProjects.length; i++) {
        getQuery('/projects/'+userProjects[i].id+'/merge_requests?state=opened', updateCounter);
    }

    projectsPage++;
    getProjects();
};

var getProjects = function getProjects(user) {
    if (typeof user !== 'undefined'){
        currentUser = user;
    }

    getQuery('/projects?page='+projectsPage+'&archived=false', getMergeRequestsFromProjects);
};

var getCurrentUser = function getCurrentUser() {
    currentUser = null;
    getQuery('/user', getProjects);
}

// init method
var getGlobalCount = function getGlobalCount() {
    projects        = [];
    pendingRequests = [];
    if (null !== gitlabUrl && null !== privateToken) {
        getCurrentUser();
    } else {
        chrome.browserAction.setBadgeText({text: ''});
    }

    timer = setTimeout(getGlobalCount, checkPeriod * 60 * 1000);
};
