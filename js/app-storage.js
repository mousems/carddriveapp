var LOCAL = {
    me:{
            // name: '郭杰穎',
            // email: 'mousems.kuo@gmail.com',
            // field_LastName : {
            //     value:'郭',
            //     id:''
            // },
            // field_FirstName : {
            //     value:'杰穎',
            //     id:''
            // },
            // field_EmailType : {
            //     value:'Home',
            // },
            // field_Email: {
            //     value:'mousems.kuo@gmail.com',
            //     id:''
            // },
            // field_PhoneType : {
            //     value:'0975179763',
            // },
            // field_Phone : {
            //     value:'0975179763',
            //     id:''
            // },
            // field_Company : {
            //     value:'KK',
            //     id:''
            // },
            // field_Title : {
            //     value:'CMO',
            //     id:''
            // },
            // field_AddressType : {
            //     value:'Home',
            // },
            // field_AddressCountry : {
            //     value:'Taiwan',
            //     id:''
            // },
            // field_AddressZIP : {
            //     value:'10699',
            //     id:''
            // },
            // field_AddressCity : {
            //     value:'Taipei',
            //     id:''
            // },
            // field_AddressTownship : {
            //     value:'Daan',
            //     id:''
            // },
            // field_AddressStreet : {
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
        //     field_company : {
        //         value:'KK',
        //         id:''
        //     },
        //     field_title : {
        //         value:'CMO',
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

var Cache = null;
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

$(function(){
    // refresh_currency();
});
