var LOCAL = {
    cards: [
        {
            type: 'cash',
            name: '郭杰穎',
            field_lastname    : '郭',
            field_firstname : '杰穎',
            field_phone : '0975179763',
            field_addressCountry : 'Taiwan',
            field_addressZIP : '10699',
            field_addressCity : 'Taipei',
            field_addressTownship : 'Daan',
            field_addressStreet : 'P.OBOX 90-36'
        }
    ],
    currency: {
        '路人甲': {
            EUR: {
                NTD: 1
            },
            date: null,
            server_date: null
        },
        '路人乙': {
            EUR: {
                NTD: 1
            },
            date: null,
            server_date: null
        },
        '路人丙': {
            EUR: {
                NTD: 1
            }
        }
    },
    settings: {
        decimal: 'on'
    }
};

var STORAGE = new LocalStorage(),
    get_tmp = STORAGE.get('LOCAL');

if( get_tmp != null )
    LOCAL = get_tmp;

var storage_card_add = function(card_obj) {
    LOCAL.cards.push(card_obj);
    storage_save();
};

var storage_save = function() {
    try {
        STORAGE.save('LOCAL', LOCAL);
    }
    catch(e) {
        console.log('Storage error!');
        console.log(e);
    }
}

var refresh_currency = function(btn_obj) {

    var save;

    $.ajax({
         type: "get",
         async: false,
         url: "http://lost.ntust.edu.tw/upload/jsonp/",
         dataType: "jsonp",
         jsonp: "callback",
         jsonpCallback: 'currency',
         beforeSend: function() {

            console.log('Retrieving currency data form API server...');
            save = $(btn_obj).val();
            $(btn_obj).val('Loading...');

         },
         success: function(res){

             console.log('Got data from server');
             console.log(res);
             $(btn_obj).val(save);

             LOCAL.currency.visa = res.visa;
             LOCAL.currency.mastercard = res.mastercard;

             storage_save();
             display_overview();
         },
         error: function(err){
             console.log('Error retrieving data');
             console.log(err);
             $(btn_obj).val('Error!');
         }
     });
}

$(function(){
    // refresh_currency();
});
