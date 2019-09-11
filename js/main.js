/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
const state = {
	mode: 'default',
	currColor: 'green',
	prevColor: 'grey',
};

let paletteSettings = {
	currColor: 'green',
	prevColor: 'grey',
	grid: [],
};

document.addEventListener('DOMContentLoaded', getSettings);

document.getElementById('bucket').accessKey = 'p';
document.getElementById('eyedropper').accessKey = 'c';
document.getElementById('mover').accessKey = 'm';
document.getElementById('transformer').accessKey = 't';

const cells = document.getElementsByClassName('cell');
Array.prototype.forEach.call(cells, (item) => {
	item.addEventListener('click', cellClick);
});

document.getElementsByClassName('canvas')[0].addEventListener('dragover', allowDrop);

document.getElementById('bucket').addEventListener('click', changeMode);
document.getElementById('eyedropper').addEventListener('click', changeMode);
document.getElementById('mover').addEventListener('click', changeMode);
document.getElementById('transformer').addEventListener('click', changeMode);
document.getElementById('color-picker').addEventListener('change', customColorSelect);

/* -----------------------------SELECT TOOL---------------------------------------------*/
function changeMode(evt) {
	if (state.mode === evt.target.id) {
	  changeCursor('default');
		state.mode = 'default';
		changeSelection(null, evt.target.id);
		return;
	}
	if (state.mode !== 'default') {
		changeSelection(evt.target.id, state.mode);
	} else {
		changeSelection(evt.target.id, null);
	}
	state.mode = evt.target.id;
	changeCursor(state.mode);
}

/* -----------------------------Drag & Drop---------------------------------------------*/
function cellEventManager(elem, mode) {
	if (mode) {
		elem.addEventListener('dragstart', drag);
		elem.setAttribute('draggable', 'true');
		elem.addEventListener('drop', drop);
		elem.addEventListener('dragenter', shadowCell);
		elem.addEventListener('dragleave', unShadowCell);
	} else {
		elem.removeEventListener('dragstart', drag);
		elem.setAttribute('draggable', 'false');
		elem.removeEventListener('drop', drop);
		elem.removeEventListener('dragenter', shadowCell);
		elem.removeEventListener('dragleave', unShadowCell);
	}
}

function allowDrop(ev) {
	ev.preventDefault();
}

function drag(ev) {
	ev.dataTransfer.setData('text', ev.target.id);
}

function drop(ev) {
	ev.preventDefault();
	const data = ev.dataTransfer.getData('text');
	const cellsArr = Array.prototype.slice.call(document.getElementsByClassName('canvas')[0].children);
	const idxUnder = cellsArr.indexOf(ev.target);
	const idxOver = cellsArr.indexOf(document.getElementById(data));
	if (idxOver > idxUnder) {
		ev.target.before(document.getElementById(data));
	} else {
		ev.target.after(document.getElementById(data));
	}
	unShadowCell(ev);
	saveSettings();
}

function shadowCell(evt) {
	evt.target.style['box-shadow'] = '0 0 2px 2px blue';
}
function unShadowCell(evt) {
	evt.target.style['box-shadow'] = 'none';
}
/*---------------------------------------------------------------------*/

/* ---------------------BUCKET &  TRANSFORM-----------------------------*/
function cellClick(evt) {
	if (state.mode === 'bucket' && state.currColor !== null) {
		evt.target.style.backgroundColor = state.currColor;
	}
	if (state.mode === 'transformer') {
		evt.target.classList.toggle('round');
	}
	saveSettings();
}
/*---------------------------------------------------------------------*/
/* --------------------------COLOR SELECT-------------------------------------------*/
function customColorSelect(evt) {
	state.prevColor = state.currColor;
	state.currColor = evt.target.value;
	document.getElementById('prev-color-icon').style.color = state.prevColor;
	document.getElementById('curr-color-icon').style.color = state.currColor;
}

/*-------------------------------------------------------------------------------*/
function changeSelection(id1, id2) {
	if (id1) {
		document.getElementById(id1).parentElement.style['box-shadow'] = '0 0 2px 2px lime';
		document.getElementById(id1).parentElement.style.backgroundColor = 'grey';
		if (id1 === 'mover') {
			Array.prototype.forEach.call(cells, (item) => {
				cellEventManager(item, true);
			});
		}
		if (id1 === 'eyedropper') {
			document.getElementsByClassName('colors')[0].classList.remove('disabledMouse');
		}
	}
	if (id2) {
		document.getElementById(id2).parentElement.style['box-shadow'] = 'none';
		document.getElementById(id2).parentElement.style.backgroundColor = 'transparent';
		if (id2 === 'mover') {
			Array.prototype.forEach.call(cells, (item) => {
				cellEventManager(item, false);
			});
		}
		if (id2 === 'eyedropper') {
			document.getElementsByClassName('colors')[0].classList.add('disabledMouse');
		}
	}
}

function changeCursor(curType) {
	document.body.classList.remove('bucket', 'eyedropper', 'mover', 'transformer');
	if (curType !== 'default') {
		document.body.classList.add(curType);
	}
}

/* ------------------------------------COLOR PICK---------------------------------------*/
const icons = document.getElementsByClassName('fa-circle');
Array.prototype.forEach.call(icons, (item) => {
	item.addEventListener('click', colorClick);
});

function colorClick(evt) {
	const col = window.getComputedStyle(evt.target, null).getPropertyValue('color');
	state.prevColor = state.currColor;
	state.currColor = col;
	document.getElementById('prev-color-icon').style.color = state.prevColor;
	document.getElementById('curr-color-icon').style.color = state.currColor;
	saveSettings();
}

/* -----------------------------LOCAL STORAGE LOAD AND SAVE----------------------------------*/
function getSettings() {
	if (typeof localStorage.paletteSettings !== 'undefined') {
		paletteSettings = JSON.parse(localStorage.paletteSettings);
	}
	state.currColor = paletteSettings.currColor;
	document.getElementById('curr-color-icon').style.color = state.currColor;
	state.prevColor = paletteSettings.prevColor;
	document.getElementById('prev-color-icon').style.color = state.prevColor;
	Array.prototype.forEach.call(cells, (item, index) => {
		const bkColor = paletteSettings.grid[index][0];
		item.style.backgroundColor = bkColor;
		if (paletteSettings.grid[index][1]) {
			item.classList.add('round');
		}
	});
}

function saveSettings() {
	paletteSettings.currColor = state.currColor;
	paletteSettings.prevColor = state.prevColor;
	paletteSettings.grid = [];
	Array.prototype.forEach.call(cells, (item) => {
		paletteSettings.grid.push([item.style.backgroundColor, item.classList.contains('round')]);
	});
	localStorage.setItem('paletteSettings', JSON.stringify(paletteSettings));
}
