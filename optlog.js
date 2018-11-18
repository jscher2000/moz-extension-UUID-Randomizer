function refreshLog(blnClear){
	browser.runtime.sendMessage({
		want: "log"
	}).then((oLog) => {
		var dest = document.querySelector('#logbody');
		if (blnClear !== false) dest.innerHTML = '';
		var arrItems = oLog.logarray;
		for (var j=0; j<arrItems.length; j++){
			dest.insertAdjacentHTML('beforeend', '<tr><td>' + new Date(arrItems[j].time).toLocaleString() + '</td>' +
				'<td>' + arrItems[j].url + '</td>' +
				'<td>' + arrItems[j].headers.replace(/\|/g, '<br>') + '</td></tr>\n');
		}
	}).catch((err) => {
		var dest = document.querySelector('#logbody');
		dest.insertAdjacentHTML('afterbegin', '<tr><td colspan="3">Problem getting log: ' + err.message + '</td></tr>\n');
	});
}

refreshLog(false);
document.querySelector('#btnRefresh').addEventListener('click', refreshLog, false);
