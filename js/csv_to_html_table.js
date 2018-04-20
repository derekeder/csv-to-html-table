var CsvToHtmlTable = CsvToHtmlTable || {};

CsvToHtmlTable = {
    init: function (options) {
        options = options || {};
        var csv_path = options.csv_path || "";
        var el = options.element || "table-container";
        var allow_download = options.allow_download || false;
        var csv_options = options.csv_options || {};
        var datatables_options = options.datatables_options || {};
        var custom_formatting = options.custom_formatting || [];
        var $table = $("<table class='table table-striped table-condensed' id='" + el + "-table'></table>");
        var $containerElement = $("#" + el);
        $containerElement.empty().append($table);

        $.when($.get(csv_path)).then(
            function (data) {
                var csvData = $.csv.toArrays(data, csv_options);

                var tableHead = "<thead><tr>";

                var csvHeaderRow = csvData[0];
                for (var headerIdx = 0; headerIdx < csvHeaderRow.length; headerIdx++) {
                    tableHead += "<th>" + csvHeaderRow[headerIdx] + "</th>";
                }

                tableHead += "</tr></thead>";
                $table.append(tableHead);
                var $tableBody = $("<tbody></tbody>");
                $table.append($tableBody);

                for (var rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
                    var row_html = "<tr>";

                    //takes in an array of column index and function pairs
                    if (custom_formatting != []) {
                        $.each(custom_formatting, function (i, v) {
                            var colIdx = v[0];
                            var func = v[1];
                            csvData[rowIdx][colIdx] = func(csvData[rowIdx][colIdx]);
                        })
                    }

                    for (var colIdx = 0; colIdx < csvData[rowIdx].length; colIdx++) {
                        row_html += "<td>" + csvData[rowIdx][colIdx] + "</td>";
                    }

                    row_html += "</tr>";
                    $tableBody.append(row_html);
                }

                $table.DataTable(datatables_options);

                if (allow_download) {
                    $containerElement.append("<p><a class='btn btn-info' href='" + csv_path + "'><i class='glyphicon glyphicon-download'></i> Download as CSV</a></p>");
                }
            });
    }
};
