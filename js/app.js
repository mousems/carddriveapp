var TRANS = {
    int_currency : '國際組織匯率',
    foreign_fee  : '跨國手續',
    local_val    : '本次交易金額',
    cashback_val : '現金回饋',
    gain_val     : '淨回饋收入',
    actual_val   : '實際支付金額',
    type         : '卡別',
    cashback_per    : '現金回饋率(%)',
    foreign_fee_per : '海外交易手續費率(%)',
    opr             : '操作',
    delete          : '刪除',
    cards           : '卡片',
    currency        : '匯率',
    visa            : 'Visa',
    mastercard      : 'MasterCard',
    cash            : 'Cash',
    date            : '最後更新日期'
};

var display_overview = function() {

    var card_array   = [];

    // Card record
    for( var card_index in LOCAL.cards ) {

        var detail_array = [];

        for( var key in LOCAL.cards[card_index] ) {

            if( key != 'name' ) {
                detail_array.push({
                    title: TRANS[key],
                    note : '',
                    value: LOCAL.cards[card_index][key] == null ? '-' : LOCAL.cards[card_index][key]
                });
            }
        }

        detail_array.push({
            title: TRANS['opr'],
            note : '',
            value: TRANS['delete']
        });

        card_array.push([
            TRANS['cards'] + ' / ' + LOCAL.cards[card_index].name,
            '-',
            detail_array
        ]);
    }

    // Currency record
    for( var int_org in LOCAL.currency ) {

        var detail_array = [];

        for( var cur in LOCAL.currency[int_org] ) {

            if( cur != 'date' ) {

                detail_array.push({
                    title: cur,
                    note : '',
                    value: 'NTD$ ' + LOCAL.currency[int_org][cur].NTD
                });

            } else {

                detail_array.push({
                    title: TRANS[cur],
                    note : '',
                    value: LOCAL.currency[int_org][cur] == null ? '-' : LOCAL.currency[int_org][cur]
                });

            }
        }

        card_array.push([
            TRANS['currency'] + ' / ' + TRANS[int_org],
            '-',
            detail_array
        ]);

    }

    generator.cards(card_array, 'result');
};

$(function(){

    // Init
    display_overview();

    // Add popup close
    $('#add-cancel').click(function(){
        $("#popupAdd").popup( "close" );
    });

    // Save popup
    $('#add-form').submit(function(event){

        event.preventDefault();

        var form_data = $(this).serializeArray(),
            card_obj  = {};

        //console.log(form_data);

        for( var index in form_data ) {

            if( form_data[index].name != 'name' && form_data[index].name != 'type' )
                card_obj[form_data[index].name] = parseFloat(form_data[index].value);
            else {
                card_obj[form_data[index].name] = form_data[index].value;
            }
        }

        console.log(card_obj);

        // Add to LOCAL
        storage_card_add(card_obj);

        // refresh
        display_overview();

        $("#popupAdd").popup("close");
    });

    // Calculate event
    $('#inputbox').on('input', function(event){

        var base_value     = $('#inputbox').val(),
            base_currency  = $('#base_currency').val(),
            card_array     = [];

        //console.log(base_value.length);

        if( base_value == '' || base_value.length == 0 ) {
            display_overview();
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
                LOCAL.cards[card_index].name,
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
