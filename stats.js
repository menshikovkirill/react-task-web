function quantile(arr, q) {
    const sorted = arr.sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;

    if (sorted[base + 1] !== undefined) {
        return Math.floor(sorted[base] + rest * (sorted[base + 1] - sorted[base]));
    } else {
        return Math.floor(sorted[base]);
    }
};

function prepareData(result) {
	return result.data.map(item => {
		item.date = item.timestamp.split('T')[0];

		return item;
	});
}

// TODO: реализовать
// показать значение метрики за несколько день
function showMetricByPeriod(data, page, dayBegin, dayEnd) {
    dayBegin = new Date(dayBegin);
    dayEnd = new Date(dayEnd);
    
    let table = {};
	table.connect = addMetricByPeriod(data, page, 'connect', dayBegin, dayEnd);
	table.ttfb = addMetricByPeriod(data, page, 'ttfb', dayBegin, dayEnd);
	table.square = addMetricByPeriod(data, page, 'lcp', dayBegin, dayEnd);
	table.load = addMetricByPeriod(data, page, 'fcp', dayBegin, dayEnd);
	table.draw = addMetricByPeriod(data, page, 'draw', dayBegin, dayEnd);
    console.log(`All metrics for period by ${dayBegin} - ${dayEnd}`);
    console.table(table);
}


// сравнить метрику в разных срезах
function compareMetric(data, page, name, date) {
	console.log(`Difference by mobile and desktop`);
  
	let table = {
        desktop: addMetricByPlatform(data, page, name, date, 'cursor'),
        touch: addMetricByPlatform(data, page, name, date, 'touch'),
    };
	console.table(table);
}



// Пример
// добавить метрику за выбранный день
function addMetricByDate(data, page, name, date) {
	let sampleData = data
					.filter(item => item.page == page && item.name == name && item.date == date)
					.map(item => item.value);

	let result = {};

	result.hits = sampleData.length;
	result.p25 = quantile(sampleData, 0.25);
	result.p50 = quantile(sampleData, 0.5);
	result.p75 = quantile(sampleData, 0.75);
	result.p95 = quantile(sampleData, 0.95);

	return result;
}
function addMetricByPeriod(data, page, name, dateFrom, dateTo) {
	let sampleData = data
					.filter(item => item.page == page && item.name == name && new Date(item.date) >= dateFrom 
                        && new Date(item.date) <= dateTo)
					.map(item => item.value);

	let result = {};

	result.hits = sampleData.length;
	result.p25 = quantile(sampleData, 0.25);
	result.p50 = quantile(sampleData, 0.5);
	result.p75 = quantile(sampleData, 0.75);
	result.p95 = quantile(sampleData, 0.95);

	return result;
}
function addMetricByPlatform(data, page, name, date, platform) {

    console.log(platform)
    let sampleData = data
					.filter(item => item.page == page && item.name == name && item.date == date && item.additional.pointer == platform)
					.map(item => item.value);

	let result = {};

	result.hits = sampleData.length;
	result.p25 = quantile(sampleData, 0.25);
	result.p50 = quantile(sampleData, 0.5);
	result.p75 = quantile(sampleData, 0.75);
	result.p95 = quantile(sampleData, 0.95);

	return result;
}
// рассчитывает все метрики за день
function calcMetricsByDate(data, page, date) {
	console.log(`All metrics for ${date}:`);

	let table = {};
	table.connect = addMetricByDate(data, page, 'connect', date);
	table.ttfb = addMetricByDate(data, page, 'ttfb', date);
	table.square = addMetricByDate(data, page, 'lcp', date);
	table.load = addMetricByDate(data, page, 'fcp', date);
	table.draw = addMetricByDate(data, page, 'draw', date);

	console.table(table);
};

fetch('https://shri.yandex/hw/stat/data?counterId=e619695c-f615-410c-95c7-3fb1e50161c2')
	.then(res => res.json())
	.then(result => {
        console.log(result)
		let data = prepareData(result);

		calcMetricsByDate(data, 'send test', '2021-10-30');
        showMetricByPeriod(data, 'send test', '2021-10-30', '2021-10-31');
        
        console.log("Compare draw metric in descktop and mobile")
        compareMetric(data, 'send test',"draw", '2021-10-31')
	});
