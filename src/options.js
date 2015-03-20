function save_options() {
  var gitlabUrl    = document.getElementById('gitlabUrl').value;
  var privateToken = document.getElementById('privateToken').value;
  var checkPeriod  = document.getElementById('checkPeriod').value;

  var config = {
    notMine: document.getElementById('configNotMine').checked,
    unassignedOnly: document.getElementById('configUnassignedOnly').checked
  };

  if ('/' === gitlabUrl.substr(-1)) {
    gitlabUrl = gitlabUrl.substr(0, gitlabUrl.length - 1);
    document.getElementById('gitlabUrl').value = gitlabUrl;
  }

  // just to be sure
  checkPeriod = parseInt(checkPeriod);
  document.getElementById('checkPeriod').value = checkPeriod;

  chrome.storage.sync.set({
    gitlabUrl: gitlabUrl,
    privateToken: privateToken,
    checkPeriod: checkPeriod,
    config: config
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    gitlabUrl: '',
    privateToken: '',
    checkPeriod: 15,
    config: {
      notMine: false,
      unassignedOnly: false
    }
  }, function(items) {
    document.getElementById('gitlabUrl').value    = items.gitlabUrl;
    document.getElementById('privateToken').value = items.privateToken;
    document.getElementById('checkPeriod').value  = items.checkPeriod;

    document.getElementById('configNotMine').checked        = items.config.notMine;
    document.getElementById('configUnassignedOnly').checked = items.config.unassignedOnly;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
