var CsvToHtmlTable = CsvToHtmlTable || {};
var CsvToHtmlTable_DataTable = {};

CsvToHtmlTable = {
    init: function (options) {
        options = options || {};
        var csv_path = options.csv_path || "";
        var el = options.element || "table-container";
        var allow_download = options.allow_download || false;
        var csv_options = options.csv_options || {};
        var datatables_options = options.datatables_options || {};
        var column_filters = options.column_filters || false;
        var custom_formatting = options.custom_formatting || [];
        var customTemplates = {};
        $.each(custom_formatting, function (i, v) {
            var colIdx = v[0];
            var func = v[1];
            customTemplates[colIdx] = func;
        });

        var $table = $("<table class='table table-striped table-condensed' id='" + el + "-table'></table>");
        var $containerElement = $("#" + el);
        $containerElement.empty().append($table);

        $.when($.get(csv_path)).then(
            function (data) {
                var csvData = $.csv.toArrays(data, csv_options);
                var $tableHead = $("<thead></thead>");
                var csvHeaderRow = csvData[0];
                var $tableHeadRow = $("<tr></tr>");
                for (var headerIdx = 0; headerIdx < csvHeaderRow.length; headerIdx++) {
                    $tableHeadRow.append($("<th></th>").text(csvHeaderRow[headerIdx]));
                }

                if (column_filters) {
                    var $tableHeadRow_filter = $("<tr></tr>");
                    for (var headerIdx = 0; headerIdx < csvHeaderRow.length; headerIdx++) {
                        $tableHeadRow_filter.append($("<th></th>").html(
                            '<input type="text" id="col_f-' + headerIdx + '" placeholder="filter column" />'));
                        $tableHeadRow_filter[0].childNodes[headerIdx].childNodes[0].onchange = function(ee) {
                            var i = parseInt(ee.target.id.substr(6));
                            CsvToHtmlTable_DataTable.column(i).search(this.value).draw();
                        }
                        $tableHeadRow_filter[0].childNodes[headerIdx].childNodes[0].onkeyup =
                            $tableHeadRow_filter[0].childNodes[headerIdx].childNodes[0].onchange
                    }
                    $tableHead.append($tableHeadRow_filter);
                }

                $tableHead.append($tableHeadRow);

                $table.append($tableHead);
                var $tableBody = $("<tbody></tbody>");

                for (var rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
                    var $tableBodyRow = $("<tr></tr>");
                    for (var colIdx = 0; colIdx < csvData[rowIdx].length; colIdx++) {
                        var $tableBodyRowTd = $("<td></td>");
                        var cellTemplateFunc = customTemplates[colIdx];
                        if (cellTemplateFunc) {
                            $tableBodyRowTd.html(cellTemplateFunc(csvData[rowIdx][colIdx]));
                        } else {
                            $tableBodyRowTd.text(csvData[rowIdx][colIdx]);
                        }
                        $tableBodyRow.append($tableBodyRowTd);
                        $tableBody.append($tableBodyRow);
                    }
                }
                $table.append($tableBody);

                CsvToHtmlTable_DataTable = $table.DataTable(datatables_options);

                if (allow_download) {
                    $containerElement.append("<p><a class='btn btn-info' href='" + csv_path + "'><i class='glyphicon glyphicon-download'></i> Download as CSV</a></p>");
                }
            });
    }
};
