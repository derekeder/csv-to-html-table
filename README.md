# CSV to HTML Table

Display any CSV file as a searchable, filterable, pretty HTML table. Done in 100% JavaScript.

Check out the working demo: http://derekeder.github.io/csv-to-html-table/

## Usage

### 1. Clone this repository (in the command line)

``` bash
git clone git@github.com:derekeder/csv-to-html-table.git
cd csv-to-html-table
```

### 2. Add your CSV file to the `data/` folder

### 3. In `index.html` configure the `init_table()` function

``` html
<script>
  init_table({
    csv_path: 'data/Health Clinics in Chicago.csv', 
    element: 'table-container', 
    allow_download: true,
    csv_options: {separator: ',', delimiter: '"'},
    datatables_options: {"paging": false}
  });
</script>
```

* `csv_path` Path to your CSV file.
* `element` The HTML element to render your table to. Defaults to `table-container`
* `allow_download` if true, shows a link to download the CSV file. Defaults to `false`
* `csv_options` jQuery CSV configuration. Use this if you want to use a custom `delimiter` or `separator` in your input file. See [their documentation](https://code.google.com/p/jquery-csv/wiki/API#$.csv.toArrays%28%29).
* `datatables_options` DataTables configuration. See [their documentation](http://datatables.net/reference/option/).

### 4. Run it

You can run this by uploading it to a web server, or locally using this handy python command:

```bash
python -m SimpleHTTPServer
```

navigate to http://localhost:8000/

## Dependencies

* [Bootstrap](http://getbootstrap.com/) - Responsive HTML, CSS and Javascript framework
* [jQuery](https://jquery.com/) - a fast, small, and feature-rich JavaScript library
* [jQuery CSV](https://code.google.com/p/jquery-csv/) - Parse CSV (Comma Separated Values) to Javascript arrays or dictionaries.
* [DataTables](http://datatables.net/) - add advanced interaction controls to any HTML table.

## Errors / Bugs

If something is not behaving intuitively, it is a bug, and should be reported.
Report it here: https://github.com/derekeder/csv-to-html-table/issues

## Note on Patches/Pull Requests
 
* Fork the project.
* Make your feature addition or bug fix.
* Send a pull request. Bonus points for topic branches.

## Copyright

Copyright (c) 2015 Derek Eder. Released under the [MIT License](https://github.com/derekeder/csv-to-html-table/blob/master/LICENSE).
