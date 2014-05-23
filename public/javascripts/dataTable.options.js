$.extend(true, $.fn.dataTable.defaults, {
    "bAutoWidth": false,
    "sPaginationType": "full_numbers",
    "oLanguage": {
        "sLengthMenu": "Montrer par page: _MENU_",
        "sZeroRecords": "Aucun résultat",
        "sInfo": "Résultats _START_ à _END_ sur _TOTAL_",
        "sInfoEmpty": "Vide",
        "sEmptyTable": "Aucune donnée",
        "sInfoFiltered": "(filtré sur les _MAX_ totals)",
        "sSearch": "Rechercher:",
        "oPaginate": {
            "sFirst": "Premier",
            "sPrevious": "Précédent",
            "sNext": "Suivant",
            "sLast": "Dernier"
        }
    },
    "sDom": '<"top-dataTables clearfix"lf<"clear">>rt<"bottom-dataTables clearfix"ip>'
});


function stringToDate(string) {
    return new Date(string.substr(6, 4), string.substr(3, 2) - 1, string.substr(0, 2), string.substr(11, 2),
        string.substr(14, 2), 0, 0);
}

$.fn.dataTableExt.oSort['dateFr-asc'] = function (a, b) {
    var dateA = stringToDate(a), dateB = stringToDate(b);

    return ((dateA.getTime() < dateB.getTime()) ? 1 : ((dateA.getTime() > dateB.getTime()) ? -1 : 0));
};

$.fn.dataTableExt.oSort['dateFr-desc'] = function (a, b) {
    var dateA = stringToDate(a), dateB = stringToDate(b);

    return ((dateA.getTime() < dateB.getTime()) ? -1 : ((dateA.getTime() > dateB.getTime()) ? 1 : 0));
};