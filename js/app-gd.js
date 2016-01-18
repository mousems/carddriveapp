// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '1067770203431-q9gqgijmr7kmtit8gugbjaivbdcr1a5q.apps.googleusercontent.com';

var SCOPES = ['https://www.googleapis.com/auth/drive'];

var GDFolderID = null;
var GDFolderModifiedDate = null;
var GDemail = null;
var GDCacheID = null;
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
function updateFile(fileId, fileMetadata, fileData, callback, title) {
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

    var contentType = fileMetadata;
    // Updating the metadata is optional and you can instead use the value from drive.files.get.
    var base64Data = btoa(encodeURIComponent(fileData));
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
    if (!callback || !title) {
        request.execute(function(file){
            console.log(file);
        });
    }else{
        request.execute(function(file){
            callback(file,title);
        });
    }


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
function listFiles(q, callback1, callback2) {
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
    result = listFiles('title="CardDriveFiles"',_SetGDFolder, null);
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
                      GDCacheID = items[0].id;
                      SyncData();
                  }else{
                      $("#popupNew").popup("open")
                  }
              }
          );
        });

    }else{
        var request = gapi.client.drive.about.get();
        request.execute(function(resp) {
          GDemail = resp.user.emailAddress;
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
          $("#popupNew").popup("open")
        });

    }

}
function addFile(title, data, mimeType, callback){
    if (mimeType==null) {
        mimeType = "text/plain";
    }
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
        sleep(110);
        updateFile(resp.id, mimeType, data, callback, title);
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
      callback(decodeURIComponent(xhr.responseText));
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
function getFileDataById(fileId, callback, param2){
    var request = gapi.client.drive.files.get({
      'fileId': fileId
    });
    request.execute(function(resp) {
        sleep(110);
        var accessToken = gapi.auth.getToken().access_token;
        $.ajax({
            url: resp.downloadUrl,
            type: "GET",
            beforeSend: function(xhr){
                xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            }
        }).done(function(response, textStatus, jqXHR) {
            console.log(jqXHR);
            if (param2!== null) {
                callback(decodeURIComponent(response), param2);
            }else{
                callback(decodeURIComponent(response));
            }
        }).fail(function( jqXHR, textStatus, errorThrown ) {
            console.log(textStatus);
        });
    });
}
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e12; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
function SyncData(){
    // before you call, please check GDCacheID.
    if (GDCacheID) {
        getFileDataById(
            GDCacheID,
            function(CacheContent){
                Cache = JSON.parse(CacheContent);
                var MAILMD5 = CryptoJS.MD5(GDemail);
                if (isEmpty(LOCAL.me)) {

                    var ToUpdate = [];
                    var fori = 0;
                    LOCAL.ignore = Cache.ignore;
                    LOCAL.cache = Cache;


                    for (var CacheFileTitle in Cache.TF) {
                        if (Cache.TF.hasOwnProperty(CacheFileTitle)) {
                            var TitleMatch = CacheFileTitle.match("^CardDrive_"+MAILMD5+"_(.+)_(.+)");
                            if (TitleMatch) {
                                if(TitleMatch[1].match("Address")){
                                    LOCAL.me.field_AddressType = {value:TitleMatch[2]};
                                }else if(TitleMatch[1].match("Email")){
                                    LOCAL.me.field_EmailType = {value:TitleMatch[2]};
                                }else if(TitleMatch[1].match("Phone")){
                                    LOCAL.me.field_PhoneType = {value:TitleMatch[2]};
                                }
                                LOCAL.me["field_"+TitleMatch[1]] = {id:Cache.TF[CacheFileTitle]};
                                ToUpdate.push(
                                    {
                                        field_key:"field_"+TitleMatch[1],
                                        id:Cache.TF[CacheFileTitle]
                                    }
                                );
                            }else{
                                var TitleMatch = CacheFileTitle.match("^CardDrive_"+MAILMD5+"_(.+)$");
                                if(TitleMatch[1] != "Cache"){
                                    LOCAL.me["field_"+TitleMatch[1]] = {id:Cache.TF[CacheFileTitle]};
                                    ToUpdate.push(
                                        {
                                            field_key:"field_"+TitleMatch[1],
                                            id:Cache.TF[CacheFileTitle]
                                        }
                                    );
                                }
                            }
                        }else{
                            console.log("NothasOwnProperty");
                        }
                        sleep(110);
                    }
                    var ToUpdateCount = 0;
                    var ToUpdateHalf = Math.floor(ToUpdate.length/2);

                    var ToUpdateKe=0;
                    for (ToUpdateKey=0; ToUpdateKey<ToUpdateHalf; ToUpdateKey++) {
                        // get each content
                        getFileDataById(
                            ToUpdate[ToUpdateKey].id,
                            function(ToUpdateContent,ToUpdateKey){
                                if (ToUpdateContent.length > 100) {
                                    ToUpdateContent = "";
                                }
                                var field_key = ToUpdate[ToUpdateKey].field_key
                                LOCAL.me[field_key].value = ToUpdateContent;
                                ToUpdateCount++;
                                if (ToUpdateCount == ToUpdateHalf) {
                                    for (ToUpdateKey=ToUpdateHalf; ToUpdateKey<ToUpdate.length; ToUpdateKey++) {
                                        // get each content
                                        getFileDataById(
                                            ToUpdate[ToUpdateKey].id,
                                            function(ToUpdateContent,ToUpdateKey){
                                                if (ToUpdateContent.length > 100) {
                                                    ToUpdateContent = "";
                                                }
                                                var field_key = ToUpdate[ToUpdateKey].field_key
                                                LOCAL.me[field_key].value = ToUpdateContent;
                                                ToUpdateCount++;
                                                console.log(ToUpdateKey+" receive.");
                                                if (ToUpdateCount == ToUpdate.length) {
                                                    LOCAL.me.name = LOCAL.me.field_LastName.value + " " + LOCAL.me.field_FirstName.value;
                                                    LOCAL.me.email = GDemail;

                                                    var d = new Date();
                                                    LOCAL.modifiedDate = d.getTime();
                                                    storage_save();
                                                    refresh_contacts();
                                                }
                                            },
                                            ToUpdateKey
                                        );
                                    }
                                }
                            },
                            ToUpdateKey
                        );
                    }
                }
            }
        )
    }else{
        console.log("GDCacheID not found.");
    }
}
function ISODateString(d){
    function pad(n){return n<10 ? '0'+n : n}
    return d.getUTCFullYear()+'-'
    + pad(d.getUTCMonth()+1)+'-'
    + pad(d.getUTCDate())+'T'
    + pad(d.getUTCHours())+':'
    + pad(d.getUTCMinutes())+':'
    + pad(d.getUTCSeconds())+'Z'
}

function listFilesWithParm(q, callback1, callback2) {
  var request = gapi.client.drive.files.list(q);

    request.execute(function(resp) {
      var files = resp.items;
      if (files && files.length > 0) {
          if(typeof callback2==="function"){
              callback1(files,callback2);
          }else{
              callback1(files);
          }
      }else{
        callback1(null);
      }
    });
}
function CheckNewAndDownload(){
    listFilesWithParm(
        {
            q:"sharedWithMe and title contains 'CardDrive_' and modifiedDate>'"+ ISODateString(new Date(LOCAL.modifiedDate)) +"'",
            orderBy:"sharedWithMeDate desc"
        },

        function(files){
            var ToInsertContacts = [];
            var ToUpdate = [];
            for (var variableK in files) {
                if (files.hasOwnProperty(variableK)) {
                    var file = files[variableK];
                    var fileid = file.id;
                    var filetitle = file.title;
                    var fileOwnerHash = filetitle.match(/^CardDrive_([a-z\d]+)_/);
                    fileOwnerHash = fileOwnerHash[1];
                    console.log(filetitle);
                    if (LOCAL.contacts[fileOwnerHash] == undefined) {
                        //new friend
                        if (LOCAL.ignore[fileOwnerHash] == undefined) {
                            if (!ToInsertContacts[fileOwnerHash]) {
                                ToInsertContacts[fileOwnerHash] = {};
                            }

                            var CHECKTYPE = filetitle.match(/^CardDrive_.*_(.+)_(.+)$/);
                            if (filetitle.match(/^CardDrive_.*_(.+)_(.+)$/)) {
                                var ItsFieldName = CHECKTYPE[1];
                                var ItsType = CHECKTYPE[2];

                                if (ItsFieldName == "Phone") {
                                    ToInsertContacts[fileOwnerHash].field_Phone = {
                                        value:"",
                                        id:fileid
                                    };
                                    ToUpdate.push({OwnerHash:fileOwnerHash,FieldName:"field_Phone",fileid:fileid});
                                    ToInsertContacts[fileOwnerHash].field_PhoneType = {
                                        value:ItsType
                                    };
                                }else if (ItsFieldName == "Email") {
                                    ToInsertContacts[fileOwnerHash].field_Email = {
                                        value:"",
                                        id:fileid
                                    };
                                    ToUpdate.push({OwnerHash:fileOwnerHash,FieldName:"field_Email",fileid:fileid});
                                    ToInsertContacts[fileOwnerHash].field_EmailType = {
                                        value:ItsType
                                    };
                                }else{
                                    // Address

                                    ToInsertContacts[fileOwnerHash]["field_"+ItsFieldName] = {
                                        value:"",
                                        id:fileid
                                    };
                                    ToUpdate.push({OwnerHash:fileOwnerHash,FieldName:"field_"+ItsFieldName,fileid:fileid});
                                    ToInsertContacts[fileOwnerHash].field_AddressType = {
                                        value:ItsType
                                    };
                                }
                            }else{
                                CHECKTYPE = filetitle.match(/^CardDrive_.*_(.+)$/);
                                if (CHECKTYPE[1]) {
                                    var ItsFieldName = CHECKTYPE[1];
                                    ToInsertContacts[fileOwnerHash]["field_"+ItsFieldName] = {
                                        value:"",
                                        id:fileid
                                    };
                                    ToUpdate.push({OwnerHash:fileOwnerHash,FieldName:"field_"+ItsFieldName,fileid:fileid});

                                }
                            }
                        }
                    }else{

                    }


                }
            }
            console.log("ToInsertContacts:"+ToInsertContacts);
            LOCAL.contacts = {};
            for (var variableK in ToInsertContacts) {
                if (ToInsertContacts.hasOwnProperty(variableK)) {
                    LOCAL.contacts[variableK] = ToInsertContacts[variableK];
                }
            }
            DownloadAndSave5Multi(ToUpdate,0,5);
            for (var variableK in LOCAL.contacts) {
                if (LOCAL.contacts.hasOwnProperty(variableK)) {
                    LOCAL.contacts[variableK].name = LOCAL.contacts[variableK].field_LastName.value + " " + LOCAL.contacts[variableK].field_FirstName.value;
                }
            }
        },
        null
    );
}

var countSuccess = 0;
// FullList : [{OwnerHash:fileOwnerHash,FieldName:"field_"+ItsFieldName,fileid:fileid},{}...]
function DownloadAndSave5Multi(FullList,start,offset){
    if (!offset) {
        offset = 5;
    }
    for (var i = start; i < start+offset; i++) {
        if (FullList[i]) {
            getFileDataById(
                FullList[i].fileid,
                function(ToUpdateContent,OneList,SizeOfList){
                    if (ToUpdateContent.length > 100) {
                        ToUpdateContent = "";
                    }

                    LOCAL.contacts[OneList.OwnerHash][OneList.FieldName].value = ToUpdateContent;
                    LOCAL.contacts[OneList.OwnerHash].name = LOCAL.contacts[OneList.OwnerHash].field_LastName.value + " " + LOCAL.contacts[OneList.OwnerHash].field_FirstName.value;
                    countSuccess++;
                    console.log(countSuccess+" receive. / " + FullList.length);
                    if (countSuccess >= FullList.length) {
                        storage_save();
                        refresh_contacts();
                    }else if(countSuccess >= start+offset){
                        DownloadAndSave5Multi(FullList,start+offset,offset);
                    }
                },
                FullList[i],
                FullList.length
            );
        }
    }


}
/**
 * Insert a new permission.
 *
 * @param {String} fileId ID of the file to insert permission for.
 * @param {String} value User or group e-mail address, domain name or
 *                       {@code null} "default" type.
 * @param {String} type The value "user", "group", "domain" or "default".
 * @param {String} role The value "owner", "writer" or "reader".
 */
function insertPermission(fileId, value, type, role,callback) {
  var body = {
    'value': value,
    'type': type,
    'role': role
  };
  var request = gapi.client.drive.permissions.insert({
    'fileId': fileId,
    'resource': body,
    'sendNotificationEmails': false
  });
  request.execute(callback());
}
function shareFileTo(fileId, Person,callback){
    insertPermission(fileId,Person,"user","reader",callback);
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
