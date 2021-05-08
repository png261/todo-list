(function () {
	const $ = document.querySelector.bind(document);
	const $$ = document.querySelectorAll.bind(document);

	const $addInput = $('.add-task input');
	const $addBtn = $('.add-task button');
	const $listTask = $('.list-task');
	const $deleteBtn = $('#delete');
	const $numDelete = $('#delete .num');

	let lastChecked;
	let tasks = [];

	class Task {
		constructor({ id, isChecked, content }) {
			this.id = id;
			this.isChecked = isChecked;
			this.content = content
		}
		render() {
			const { id, isChecked, content } = this;
			const HTML = `
							<li id="${id}">
								<input type="checkbox" ${isChecked ? 'checked' : ''}>
								<div class="icon"></div>
								<div class="text">${content}</div>
							</li>
						`

			return HTML;
		}
	};

	function render() {
		const html = tasks.map(task => new Task(task).render()).join('');
		$listTask.innerHTML = html;
	};

	function addTask() {
		const content = $addInput.value;
		if (!content) return;

		const idExited = tasks.map(task => task.id);
		const numTask = tasks.length + 1;
		let id;

		do {
			const randomId = Math.floor(Math.random() * numTask);
			id = randomId;
		} while (idExited.includes(id));

		const taskData = {
			id: id,
			isChecked: false,
			content: content
		}
		const task = new Task(taskData);
		const HTML = task.render();

		tasks.push(task);
		$listTask.innerHTML += HTML;

		$addInput.value = '';

		render();
		handelEvent();
	};

	function deleteTask() {
		const isActive = this.classList.contains('active');
		if (isActive) {
			const $deleteTasks = $$('.delete-mode li input:checked');
			$deleteTasks.forEach(task => {
				const $task = task.closest('li')
				const id = $task.getAttribute('id');
				tasks = tasks.filter(task => task.id != id);
				$task.remove();
			})

			tasks.filter(task => task.isChecked == true).map(task => $(`li[id="${task.id}"] input`).checked = true);
		} else {
			$$('.list-task li input').forEach(input => input.checked = false);
		}

		this.classList.toggle('active');
		$listTask.classList.toggle('delete-mode');
	};

	function handleData() {
		// update data
		const taskData = window.localStorage.getItem('taskData');
		if (taskData) tasks = JSON.parse(taskData).map(data => JSON.parse(data));

		// save data
		window.addEventListener("beforeunload", function () {
			const taskSaveData = JSON.stringify(tasks.map(task => JSON.stringify(task)));
			window.localStorage.setItem('taskData', taskSaveData);
		})
	};

	function updateCheck() {
		tasks.forEach(task => {
			const id = task.id;
			const taskEl = $(`ul:not(.delete-mode) li[id="${id}"] input`);
			if (!taskEl) return;

			const isChecked = task.checked;
			task.isChecked = isChecked;
		})
	};

	function handleCheckBox(e) {
		const $checkBox = this.querySelector('input');
		let lastCheckBox;
		let inBetween = false;

		if (lastChecked) lastCheckBox = lastChecked.querySelector('input').checked;

		$checkBox.checked = !$checkBox.checked;

		// use shift to select multi tasks
		if (e.shiftKey && this != lastChecked) {
			$$('.list-task li').forEach(task => {
				const $checkBox = task.querySelector('input');

				if (task === this || task === lastChecked) inBetween = !inBetween;
				if (inBetween) $checkBox.checked = lastCheckBox;
			});
		}
		
		lastChecked = this;
		updateCheck();
		$numDelete.innerText = $$('.delete-mode li input:checked').length;
	};

	function handelEvent() {
		const $tasks = $$('.list-task li');
		$tasks.forEach(task => task.addEventListener('click', handleCheckBox));
		$deleteBtn.addEventListener('click', deleteTask);
		$addBtn.addEventListener('click',addTask);
	};

	(function start() {
		handleData();
		render();
		handelEvent();
	})();
})()