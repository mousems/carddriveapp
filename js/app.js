var TRANS = {
    me           : '本人',
    contact        : '聯絡人',
    field_EmailType:'Email類型',
    field_Email:'Email',
    field_LastName  : '姓',
    field_FirstName  : '名',
    field_PhoneType: '電話類型',
    field_Phone : '電話號碼',
    field_Title : '職稱',
    field_Company : '公司名稱',
    field_AddressType: '地址類型',
    field_AddressCountry    : 'Country',
    field_AddressZIP    : 'ZIP',
    field_AddressCity   : 'City',
    field_AddressTownship   : 'Township',
    field_AddressStreet : 'Street'
};


var refresh_contacts = function() {

    var card_array   = [];

    var detail_array = [];
    for(var me_key in LOCAL.me) {
        if(me_key.match(/^field/)) {
            detail_array.push({
                title: TRANS[me_key],
                note : '',
                value: LOCAL.me[me_key].value == null ? '-' : LOCAL.me[me_key].value
            });
        }
    }

    card_array.push([
        TRANS['me'] + ' / ' + LOCAL.me.name,
        '-',
        detail_array
    ]);

    for( var contact_key in LOCAL.contacts ) {
        var detail_array = [];

        for( var condata in LOCAL.contacts[contact_key] ) {
            if(condata.match(/^field/)) {
                detail_array.push({
                    title: TRANS[condata],
                    note : '',
                    value: LOCAL.contacts[contact_key][condata].value == null ? '-' : LOCAL.contacts[contact_key][condata].value
                });

            }
        }

        card_array.push([
            TRANS['contact'] + ' / ' + LOCAL.contacts[contact_key]['name'],
            '-',
            detail_array
        ]);
    }
    generator.cards(card_array, 'result');
};

$(function(){

    // Init
    refresh_contacts();
    addToHomescreen();

    // Add popup close
    $('#add-cancel').click(function(){
        $("#popupAdd").popup( "close" );
    });

    // Refresh Button
    $(document).on('click', '#app-refresh', function(){
        CheckNewAndDownload();
        $("#popupSettings").popup( "close" );
    });
    // edit Button
    $(document).on('click', '#app-edit', function(){
        var editForm = document.getElementById('edit-form');
        editForm.style.display = 'inline';
    });

    // Settings button
    $(document).on('click', '#app-settings', function() {
        // $('#cash_contacts_rate').val(LOCAL.contacts.cash.EUR.NTD);
        // $('#decimal-flip').val(LOCAL.settings.decimal).slider('refresh');
    });

    // Clear LocalStorage
    $(document).on('click', '#app-clear', function() {
        if(confirm('請問是否要清除所有資料？在本地的資料將全部遺失，必須重新同步。')) {
            STORAGE.nuke();
            location.reload();
            refresh_cards();
        }
    });

    // Deciaml flip
    // $(document).on('change', '#decimal-flip', function() {
    //     LOCAL.settings.decimal = $(this).val();
    //     storage_save();
    //     refresh_decimal();
    // });

    // Save popup

    $('#edit-form').submit(function(event){

        event.preventDefault();

        var form_data = $(this).serializeArray();
        var toUpdate = [];
        for( var index in form_data ) {
            if (form_data[index].value!=="" && !form_data[index].name.match(/field_.*Type/)) {
                var fieldname = form_data[index].name.match(/(field_.*)/);
                var file_id = LOCAL.me[fieldname[1]].id;
                toUpdate.push({
                    fieldname:fieldname[1],
                    file_id:file_id,
                    form_value:form_data[index].value
                });
            }
        }
        var count = 0;
        for (var variableK in toUpdate) {
            if (toUpdate.hasOwnProperty(variableK)) {
                count++;
                LOCAL.me[toUpdate[variableK].fieldname].value = toUpdate[variableK].form_value;
                updateFile(
                    toUpdate[variableK].file_id,
                    "text/plain",
                    toUpdate[variableK].form_value,
                    function(file,fieldname){

                        if(count==toUpdate.length){
                            console.log("done");
                            var editForm = document.getElementById('edit-form');
                            editForm.style.display = 'none';
                            $("#popupSettings").popup( "close" );
                            LOCAL.me.name = LOCAL.me.field_LastName.value + " " + LOCAL.me.field_FirstName.value;
                            storage_save();
                            refresh_contacts();
                        }
                    },
                    fieldname
                );
            }
        }
    });

    $('#add-form').submit(function(event){

        var form_data = $(this).serializeArray();
        var shareto = null;
        var toDo = [];
        for (var variable in form_data) {
            if (form_data.hasOwnProperty(variable)) {
                if(form_data[variable].name=="shareto"){
                    shareto = form_data[variable].value;
                    toDo.push("field_LastName");
                    toDo.push("field_FirstName");
                    toDo.push("field_Email");
                    toDo.push("field_Phone");
                }else if(form_data[variable].name=="ShareCompanyName"){
                    toDo.push("field_Title");
                    toDo.push("field_Company");

                }else if(form_data[variable].name=="ShareAddress"){
                    toDo.push("field_AddressZIP");
                    toDo.push("field_AddressCountry");
                    toDo.push("field_AddressCity");
                    toDo.push("field_AddressStreet");
                    toDo.push("field_AddressTownship");
                }
            }
        }

        var counta = 0;
        if ( toDo.length > 5) {
            var i
            for (i=0; i<5; i++) {
                if (toDo.hasOwnProperty(i)) {
                    field_name = toDo[i];
                    shareFileTo(
                        LOCAL.me[field_name].id,
                        shareto,
                        function(){
                            counta++;
                            if (counta == 5) {
                                counta = 6;
                                for (i=5; i<=toDo.length; i++) {
                                    if (toDo.hasOwnProperty(i)) {
                                        field_name = toDo[i];
                                        shareFileTo(
                                            LOCAL.me[field_name].id,
                                            shareto,
                                            function(){
                                                counta++;
                                                if (counta == toDo.length) {
                                                    console.log("done!");
                                                    $("#popupAdd").popup( "close" );
                                                }
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    )
                }
            }
        }else{
            for (var variable in toDo) {
                if (toDo.hasOwnProperty(variable)) {
                    field_name = toDo[variable];
                    shareFileTo(
                        LOCAL.me[field_name].id,
                        shareto,
                        function(){
                            counta++;
                            console.log(counta);
                            if (counta == toDo.length) {
                                console.log("done!");
                            }
                        }
                    )
                }
            }
        }

        event.preventDefault();
    });
    $('#new-form').submit(function(event){



        var form_data = $(this).serializeArray();

        var ToDoForm = [];
        for( var index in form_data ) {
            ToDoForm[form_data[index].name] = form_data[index].value;
        }
        var MAILMD5 = CryptoJS.MD5(GDemail);

        var FileNameI = [
            'CardDrive_'+MAILMD5+'_AddressCity_'+ToDoForm["field_AddressType"],
            'CardDrive_'+MAILMD5+'_AddressCountry_'+ToDoForm["field_AddressType"],
            'CardDrive_'+MAILMD5+'_AddressStreet_'+ToDoForm["field_AddressType"],
            'CardDrive_'+MAILMD5+'_AddressTownship_'+ToDoForm["field_AddressType"],
            'CardDrive_'+MAILMD5+'_AddressZIP_'+ToDoForm["field_AddressType"],
            'CardDrive_'+MAILMD5+'_Company',
            'CardDrive_'+MAILMD5+'_FirstName',
            'CardDrive_'+MAILMD5+'_LastName',
            'CardDrive_'+MAILMD5+'_Title',
            'CardDrive_'+MAILMD5+'_Phone_'+ToDoForm["field_PhoneType"],
            'CardDrive_'+MAILMD5+'_Email_Home'
        ];
        var FileName = [];
        FileName[0]=ToDoForm["field_AddressCity"];
        FileName[1]=ToDoForm["field_AddressCountry"];
        FileName[2]=ToDoForm["field_AddressStreet"];
        FileName[3]=ToDoForm["field_AddressTownship"];
        FileName[4]=ToDoForm["field_AddressZIP"];
        FileName[5]=ToDoForm["field_Company"];
        FileName[6]=ToDoForm["field_FirstName"];
        FileName[7]=ToDoForm["field_LastName"];
        FileName[8]=ToDoForm["field_Title"];
        FileName[9]=ToDoForm["field_Phone"];
        FileName[10]=GDemail;
        var Cache = {
            FT:{},
            TF:{},
            EN:{},
            ignore:[]
        };
        Cache.EN[MAILMD5]=FileName[7] + " " + FileName[6];
        var countDone = 0;
        var i;
        for (i = 0; i <= 4; i++) {
            setTimeout((function (FileName,i) {
                var FileNameK = FileNameI[i];
                addFile(FileNameK, FileName[i], "text/plain",
                    function(TargetFile,title){
                        countDone++;
                        Cache.TF[title]=TargetFile.id;
                        Cache.FT[TargetFile.id]=title;
                        if (countDone >= 5) {
                            for (i = 5; i <= 10; i++) {
                                setTimeout((function (FileName,i) {
                                    var FileNameK = FileNameI[i];
                                    addFile(FileNameK, FileName[i], "text/plain",
                                        function(TargetFile,title){
                                            countDone++;
                                            Cache.TF[title]=TargetFile.id;
                                            Cache.FT[TargetFile.id]=title;
                                            if (countDone >= 11) {
                                                var jsontosave = JSON.stringify(Cache);
                                                addFile(
                                                    'CardDrive_'+MAILMD5+'_Cache',
                                                    jsontosave,
                                                    "text/plain",
                                                    function(){
                                                        location.reload();
                                                    }
                                                )
                                            }
                                        }
                                    );
                                })(FileName,i), 500*i+10000);
                            }
                        }
                    }
                );
            })(FileName,i), 500*i+10000);
        }

        event.preventDefault();
    });

    // Calculate event
    $('#inputbox').on('input', function(event){

        var base_value     = $('#inputbox').val(),
            base_contacts  = $('#base_currency').val(),
            card_array     = [];

        //console.log(base_value.length);

        if( base_value == '' || base_value.length == 0 ) {
            refresh_cards();
            return;
        }

        for( var card_index in LOCAL.cards ) {

            var detail_raw = calculator.card(base_value, base_currency, LOCAL.cards[card_index]),
                datail_arr = [];

            //console.log(detail_raw);

            for( var key in detail_raw ) {

                var note = detail_raw[key][1];

                if( note != null ) {
                    note = '(' + note + ')';
                }
                else {
                    note = ''
                }

                datail_arr.push({
                    title : TRANS[key],
                    note  : note,
                    value : detail_raw[key][0]
                });
            }

            card_array.push([
                TRANS[LOCAL.cards[card_index].type] + ' / ' + LOCAL.cards[card_index].name,
                detail_raw.actual_val[0], // arr[1]
                datail_arr
            ]);
        }

        // Sort actual value
        card_array.sort(function(a, b) {
            return a[1] - b[1];
        });

        for( var i = 1; i < card_array.length; i++ ) {

            card_array[i][1] -= card_array[0][1];
            card_array[i][1] = custom_round(card_array[i][1]);

            if( card_array[i][1] > 0 )
                card_array[i][1] = '+' + card_array[i][1];
        }

        generator.cards(card_array, 'result');

    });

});
function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}
