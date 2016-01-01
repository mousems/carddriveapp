var custom_round = function(value) {
    // Round to decimal 2
    var round_to_deciaml = 1;
    return Math.round(value * Math.pow(10, round_to_deciaml)) / Math.pow(10, round_to_deciaml);
};

var calculator = (function(){

    var percentage = function(value) {
        return value / 100;
    }

    return {
        card: function(base_value, base_currency, card_obj) {

            var int_currency = LOCAL.currency[card_obj.type][base_currency].TWD,
                foreign_fee  = base_value * int_currency * percentage(card_obj.foreign_fee_per),
                local_val    = base_value * int_currency + foreign_fee,
                cashback_val = base_value * int_currency * percentage(card_obj.cashback_per),
                gain_val     = cashback_val - foreign_fee,
                actual_val   = local_val - cashback_val,
                int_date     = moment(LOCAL.currency[card_obj.type].date, 'MM/DD/YYYY').toNow();

            if( int_date == 'Invalid date' ) {
                int_date = null;
            }

            return {
                int_currency : [
                    int_currency,
                    int_date
                ],
                foreign_fee  : [
                    custom_round(foreign_fee),
                    card_obj.foreign_fee_per + '%'
                ],
                local_val    : [
                    custom_round(local_val),
                    null
                ],
                cashback_val : [
                    custom_round(cashback_val),
                    card_obj.cashback_per + '%'
                ],
                gain_val     : [
                    custom_round(gain_val),
                    null
                ],
                actual_val   : [
                    custom_round(actual_val),
                    null
                ]
            };
        }
    }

})();

var generator = (function(){

    var listview_li = function(obj) {

        var html = '<li class="ul-detail">' + obj.title +
                   '<span class="detail-note"> ' + obj.note +
                   '</span><span class="ui-li-count">' + obj.value +
                   '</span></li>';

        return html;
    };

    var collapsibleset = function(obj, index) {

        var html = '<div data-role="collapsible" id="collapsible-' + index + '">' +
                   '<h2>' + obj[0] +
                   '<span class="ui-li-count">' + obj[1] +
                   '</span></h2><ul data-role="listview" class="listview-ul"></ul></div>';

        return html;
    }

    return {

        // Return function, actually been executed
        cards: function(card_array, result_container_id) {

            // Clear
            $('#' + result_container_id).html('');

            for( var index in card_array ) {
                $('#' + result_container_id).append(
                    collapsibleset(
                        card_array[index], index
                    )
                );
            }

            // Apply jqueryMobile style and function first
            $('#' + result_container_id).collapsibleset('refresh');

            // Deal with listview inside collapsibleset later
            for( var index in card_array ) {

                for( var detail_index in card_array[index][2] ) {

                    $('#collapsible-' + index + ' .listview-ul').append(
                        listview_li(card_array[index][2][detail_index])
                    );

                }

                // Apply List View style
                $('#collapsible-' + index + ' .listview-ul').listview().listview('refresh');
            }
        }
    }

})();