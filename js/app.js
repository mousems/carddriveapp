var TRANS = {
    me           : '本人',
    contact        : '聯絡人',
    field_lastname  : '姓',
    field_firstname  : '名',
    field_phone : '電話號碼',
    field_addressCountry    : 'Country',
    field_addressZIP    : 'ZIP',
    field_addressCity   : 'City',
    field_addressTownship   : 'Township',
    field_addressStreet : 'Street'
};

var refresh_decimal = function() {

    if( LOCAL.settings.decimal == 'off' ) {
        $('#inputbox').prop('step', '');
        $('#inputbox').prop('pattern', '[0-9]*');
    } else {
        $('#inputbox').prop('step', 'any');
        $('#inputbox').prop('pattern', '');
    }

};

var refresh_cards = function() {

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
    refresh_cards();
    refresh_decimal();
    addToHomescreen();

    // Delete card
    $(document).on('click', '.delete-card', function() {
        var index = $(this).data('id');
        if( confirm('確定要刪除卡片: ' + LOCAL.cards[index].name) ) {
            LOCAL.cards.splice(index, 1);
            storage_save();
            refresh_cards();
        }
    });

    // Add popup close
    $('#add-cancel').click(function(){
        $("#popupAdd").popup( "close" );
    });

    // Refresh Button
    $(document).on('click', '#app-refresh', function(){
        refresh_contacts(this);
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
    $('#add-form').submit(function(event){

        event.preventDefault();

        var form_data = $(this).serializeArray(),
            card_obj  = {};

        //console.log(form_data);

        for( var index in form_data ) {

            if( form_data[index].name != 'name' && form_data[index].name != 'type' ) {
                card_obj[form_data[index].name] = parseFloat(form_data[index].value);
                if( isNaN(card_obj[form_data[index].name]) ) {
                    return false;
                }
            }
            else {

                card_obj[form_data[index].name] = form_data[index].value;

                if( card_obj[form_data[index].name] == 'none' || card_obj[form_data[index].name] == '') {
                    return false;
                }

            }
        }

        //console.log(card_obj);

        // Add to LOCAL
        storage_card_add(card_obj);

        // refresh
        refresh_cards();

        $("#popupAdd").popup("close");
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
