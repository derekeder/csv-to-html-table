function setColor(data) {
    if (data)
        if (parseFloat(data) > 0)
            return "<span class='positive'>" + data + "€<span>"
        else return "<span class='negative'>" + data + "€<span>"
}

CsvToHtmlTable.init({
    csv_path: "data/norden_social.csv",
    element: "table-container",
    allow_download: false,
    csv_options: {
        separator: ";",
        delimiter: '"'
    },
    datatables_options: {
        paging: true,
        order: [[ 0, "desc" ]],
        searching: false
    },
    custom_formatting: [
        [2, setColor]
    ]
});