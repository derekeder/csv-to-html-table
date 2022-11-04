Array.prototype.distinct = function () {
  var o = {}, a = [], i, e;
  for (i = 0; e = this[i]; i++) {o[e] = 1};
  for (e in o) {a.push(e)};
  return a;
}

const barColors = {
  "Serverkosten": 'rgb(153,48,48)',
  "Support": 'rgb(27,115,27)',
  "Serverspeicher": 'rgba(255,97,2,0.62)',
  "Mailjet": 'rgb(176,176,42)',
  "Paypal": 'rgb(83,115,220)',
  "Sonstige Ausgaben": 'rgb(161,24,187)'
}

const parseCsv = csv => {
  return csv.split(/\r?\n/)
  .slice(1)
  .map(line => line.split(/;/))
  .map(line => [
    new Date(line[0]),
    line[1],
    parseFloat(line[2].replace(/,/, '.'))
  ]);
}

/**
 * Group data by month and by transaction type like this:
 *
 * {
 *   "2022-10": {
 *     "Serverkosten": [-16.67],
 *     "Support": [1, 2, 5]
 *   },
 *   "2022-11": {
 *     "Serverkosten": [-16.67],
 *     "Sonstige Kosten": [-33.33]
 *   }
 * }
 */
const groupByMonthAndTransactionType = (data) => {
  const groupedByMonth = {};
  for (let i = 0; i < data.length; ++i) {
    const line = data[i];
    const month = moment(line[0]).format('YYYY-MM');
    if (!groupedByMonth.hasOwnProperty(month)) {
      groupedByMonth[month] = {};
    }
    if (!groupedByMonth[month].hasOwnProperty(line[1])) {
      groupedByMonth[month][line[1]] = [];
    }
    groupedByMonth[month][line[1]].push(line[2]);
  }
  return groupedByMonth;
}

fetch('data/norden_social.csv')
.then(resp => resp.text())
.then(parseCsv)
.then(data => {
  const transactionTypes = data.map(d => d[1]).distinct();
  const groupedByMonth = groupByMonthAndTransactionType(data);
  const months = Object.keys(groupedByMonth).sort();
  const datasets = transactionTypes.map(label => {
    let factor = label === 'Support' ? 1 : -1;
    return {
      backgroundColor: barColors[label],
      label: label,
      stack: factor,
      data: months.map(month => {
        const list = groupedByMonth[month][label]
        if(!list) return 0
        return list.reduce((a,b)=>a+b,0) * factor;
      })
    };
  });
  const monthlyCostChart = new Chart(document.getElementById('myChart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: months,
      datasets: datasets
    }
  });

  const supportersChart = new Chart(document.getElementById('myChart2').getContext('2d'), {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: "Unterstützer:innen",
          backgroundColor: barColors["Support"],
          data: months.map(month => groupedByMonth[month]['Support'].length)
        }
      ]
    }
  });
});