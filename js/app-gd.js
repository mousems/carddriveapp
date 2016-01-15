// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '1067770203431-q9gqgijmr7kmtit8gugbjaivbdcr1a5q.apps.googleusercontent.com';

var SCOPES = ['https://www.googleapis.com/auth/drive'];

var GDFolderID = null
var GDFolderModifiedDate = null
var GDemail = null
/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  var mainDiv = document.getElementById('main-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.style.display = 'none';
    mainDiv.style.display = 'inline';
    loadDriveApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'inline';
    mainDiv.style.display = 'none';
  }
}
function updateFile(fileId, fileMetadata, fileData, callback) {
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

    var contentType = fileMetadata;
    // Updating the metadata is optional and you can instead use the value from drive.files.get.
    var base64Data = btoa(fileData);
    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(fileMetadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

    var request = gapi.client.request({
        'path': '/upload/drive/v2/files/' + fileId,
        'method': 'PUT',
        'params': {'uploadType': 'multipart', 'alt': 'json'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});
    if (!callback) {
      callback = function(file) {
        console.log(file)
      };
    }
    request.execute(callback);

}
/**
 * Retrieve a list of files belonging to a folder.
 *
 * @param {String} folderId ID of the folder to retrieve files from.
 * @param {String} q for search in GAPI.
 * @param {Function} callback Function to call when the request is complete.
 *
 */
function SearchFilesInFolder(folderId, q, callback) {
  var retrievePageOfChildren = function(request, result) {
    request.execute(function(resp) {
      result = result.concat(resp.items);
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
        request = gapi.client.drive.children.list({
          'folderId' : folderId,
          'pageToken': nextPageToken,
          'q': q
        });
        retrievePageOfChildren(request, result);
      } else {
        callback(result);
      }
    });
  }
  var initialRequest = gapi.client.drive.children.list({
      'folderId' : folderId,
      'q': q
    });
  retrievePageOfChildren(initialRequest, []);
}
/**
 * Insert a file into a folder.
 *
 * @param {String} folderId ID of the folder to insert the file into.
 * @param {String} fileId ID of the file to insert.
 */
function insertFileIntoFolder(folderId, fileId) {
  var body = {'id': fileId};
  var request = gapi.client.drive.children.insert({
    'folderId': folderId,
    'resource': body
  });
  request.execute(function(resp) { });
}
/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
}

/**
 * Load Drive API client library.
 */
function loadDriveApi() {
  gapi.client.load('drive', 'v2',initGetRoot);
}

/**
 * Print files.
 */
function listFiles(q,callback1,callback2="") {
  var request = gapi.client.drive.files.list({
      'q': q,
    });

    request.execute(function(resp) {
      var files = resp.items;
      if (files && files.length > 0) {
          if(typeof callback2==="function"){
              callback1(files[0],callback2);
          }else{
              callback1(files[0]);
          }
      }else{
        callback1(null);
      }
    });
}

// 取得並儲存根目錄資訊及cache
function initGetRoot(){
    result = listFiles('title="CardDriveFiles"',_SetGDFolder);
}

// 將得到的 file 存到 GD 的全欲變數
function _SetGDFolder(fileObj){
    if(fileObj){
        GDFolderID = fileObj.id;
        GDFolderModifiedDate = fileObj.modifiedDate;
        //取到根了取
        var request = gapi.client.drive.about.get();
        request.execute(function(resp) {
          GDemail = resp.user.emailAddress;
          SearchFilesInFolder(
              GDFolderID,
              'title = "CardDrive_'+CryptoJS.MD5(GDemail)+'_Cache"',
              function(items){
                  if (items && items.length > 0) {
                      console.log(items[0].id);
                  }else{
                      console.log("show init page.");
                  }
              }
          );
        });

    }else{
        // no CardDriveFiles exist , show init page
        var request = gapi.client.drive.files.insert(
            {
                "title":"CardDriveFiles",
                "description":"for CardDrive app use only",
                "mimeType":"application/vnd.google-apps.folder"
            }
        );
        request.execute(function(resp){
            console.log(resp);
            GDFolderID = resp.id;
            GDFOlderModifiedDate = resp.modifiedDate;
        });
        console.log("show init page.");
    }

}
function addFile(title, data, mimeType="text/plain"){
    var request = gapi.client.drive.files.insert(
        {
            "title": title,
            "description": "for CardDrive app use only",
            "mimeType": mimeType,
            "parents": [{id:GDFolderID}],
            "uploadType": "media"
        }
    );
    request.execute(function(resp){
        updateFile(resp.id, mimeType, data);
    });
}
/**
 * Print a file's metadata.
 *
 * @param {String} fileId ID of the file to print metadata for.
 */
function printFile(fileId) {
  var request = gapi.client.drive.files.get({
    'fileId': fileId
  });
  request.execute(function(resp) {
    console.log('Title: ' + resp.title);
    console.log('Description: ' + resp.description);
    console.log('MIME type: ' + resp.mimeType);
  });
}

/**
 * Download a file's content.
 *
 * @param {File} file Drive File instance.
 * @param {Function} callback Function to call when the request is complete.
 */
function downloadFile(file, callback) {
  if (file.downloadUrl) {
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file.downloadUrl);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onload = function() {
      callback(xhr.responseText);
    };
    xhr.onerror = function() {
      callback(null);
    };
    xhr.send();
  } else {
    callback(null);
  }
}
/**
 * Download a file's content by ID.
 *
 * @param {fileId} file Drive File ID.
 * @param {Function} callback Function to call when the request is complete.
 */
function getFileDataById(fileId, callback){
    var request = gapi.client.drive.files.get({
      'fileId': fileId
    });
    request.execute(function(resp) {
        if (resp.downloadUrl) {
          var accessToken = gapi.auth.getToken().access_token;
          var xhr = new XMLHttpRequest();
          xhr.open('GET', resp.downloadUrl);
          xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
          xhr.onload = function() {
            callback(xhr.responseText);
          };
          xhr.onerror = function() {
            callback(null);
          };
          xhr.send();
        } else {
          callback(null);
        }
    });
}
/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  // var pre = document.getElementById('output');
  // var textContent = document.createTextNode(message + '\n');
  // pre.appendChild(textContent);
  console.log(message);
}
