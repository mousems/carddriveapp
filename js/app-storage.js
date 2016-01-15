var LOCAL = {
    me:{
            // name: '郭杰穎',
            // email: 'mousems.kuo@gmail.com',
            // field_lastname : {
            //     value:'郭',
            //     id:''
            // },
            // field_firstname : {
            //     value:'杰穎',
            //     id:''
            // },
            // field_phone : {
            //     value:'0975179763',
            //     id:''
            // },
            // field_addressCountry : {
            //     value:'Taiwan',
            //     id:''
            // },
            // field_addressZIP : {
            //     value:'10699',
            //     id:''
            // },
            // field_addressCity : {
            //     value:'Taipei',
            //     id:''
            // },
            // field_addressTownship : {
            //     value:'Daan',
            //     id:''
            // },
            // field_addressStreet : {
            //     value:'P.OBOX 90-36',
            //     id:''
            // },
            // modifiedDate : null
    },
    contacts: {
        // abc:{
        //     name: '郭杰穎',
        //     email: 'mousems.kuo@gmail.com',
        //     field_lastname : {
        //         value:'郭',
        //         id:''
        //     },
        //     field_firstname : {
        //         value:'杰穎',
        //         id:''
        //     },
        //     field_phone : {
        //         value:'0975179763',
        //         id:''
        //     },
        //     field_addressCountry : {
        //         value:'Taiwan',
        //         id:''
        //     },
        //     field_addressZIP : {
        //         value:'10699',
        //         id:''
        //     },
        //     field_addressCity : {
        //         value:'Taipei',
        //         id:''
        //     },
        //     field_addressTownship : {
        //         value:'Daan',
        //         id:''
        //     },
        //     field_addressStreet : {
        //         value:'P.OBOX 90-36',
        //         id:''
        //     },
        //     modifiedDate : null
        // }
    },
    settings: {
        decimal: 'on'
    },
    varb: {
        lastupdate: 0
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
