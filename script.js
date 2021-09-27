"use strict";

const appInputs = document.querySelector(`.app-inputs`);
const inputList = document.querySelector(".app-data-list");
const input1 = document.querySelector("#first-input");
const input2 = document.querySelector("#second-input");
const total = document.querySelector("#total");
let allExpenses = [];

window.onload = async () => {
	try {
		await renderExpenses(allExpenses);
	} catch (err) {
		console.log(err);
	} finally {
		updateTotalAmount(allExpenses);
	}
};

function updateTotalAmount(data) {
	total.textContent = `Итого: ${data.reduce(
		(acc, item) => (acc = acc + +item.amount),
		0
	)} р.`;
}

function createElem(item) {
	const element = document.createElement("div");
	element.className = "list-item";

	const titleWrapper = document.createElement("div");
	titleWrapper.style.display = "flex";
	titleWrapper.className = "title-wrapper";

	const elCounter = document.createElement("span");
	elCounter.className = "el-counter";
	elCounter.textContent = `${allExpenses.indexOf(item) + 1})`;
	elCounter.style.marginRight = "10px";

	const elTitle = document.createElement("span");
	elTitle.className = "list-title";
	elTitle.textContent = `Магазин "${item.storeName}" ${item.date}`;

	const elAmount = document.createElement("span");
	elAmount.className = "list-amount";
	elAmount.textContent = `${item.amount} р.`;

	const elBtnList = document.createElement("div");
	elBtnList.className = "list-btns";

	const editBtn = document.createElement("img");
	editBtn.className = "edit-btn";
	editBtn.src = "./img/edit.svg";

	const deleteBtn = document.createElement("img");
	deleteBtn.className = "delete-btn";
	deleteBtn.src = "./img/delete.svg";

	const saveBtn = document.createElement("img");
	saveBtn.className = "save-btn";
	saveBtn.style.display = "none";
	saveBtn.src = "./img/ok.svg";

	const refuseBtn = document.createElement("img");
	refuseBtn.src = "./img/refuse.svg";
	refuseBtn.className = "refuse-btn";
	refuseBtn.style.display = "none";

	refuseBtn.onclick = () => {
		titleWrapper.replaceChild(elTitle, inputWrapper);
		element.replaceChild(elAmount, secondWrapper);
		saveBtn.style.display = "none";
		refuseBtn.style.display = "none";
		editBtn.style.display = "block";
	};

	deleteBtn.onclick = () =>
		deleteExpense({
			_id: item._id,
			storeName: item.storeName,
			date: item.date,
			amount: item.amount,
		});

	editBtn.addEventListener("click", () => {
		titleWrapper.replaceChild(inputWrapper, elTitle);
		element.replaceChild(secondWrapper, elAmount);
		editBtn.style.display = "none";
		saveBtn.style.display = "block";
		refuseBtn.style.display = "block";
	});

	saveBtn.onclick = async () => {
		try {
			const data = {
				_id: item._id,
				storeName: elTitleInput.value,
				date: item.date,
				amount: elAmountInput.value,
			};
			if (data.storeName === "" || data.amount === "") {
				alert("Поля ввода не должны быть пустыми.");
				return;
			}
			await updateItemInfo(data);
		} catch (err) {
			console.log(err);
		} finally {
			saveBtn.style.display = "none";
			refuseBtn.style.display = "none";
			editBtn.style.display = "block";
		}
	};

	const fLabel = document.createElement("label");
	fLabel.textContent = "test";

	const inputWrapper = document.createElement("div");
	inputWrapper.style.display = "flex";
	inputWrapper.style.flexDirection = "column";
	inputWrapper.style.position = "relative";

	const secondWrapper = document.createElement("div");
	secondWrapper.style.display = "flex";
	secondWrapper.style.flexDirection = "column";
	secondWrapper.style.position = "relative";

	const elTitleInput = document.createElement("input");
	elTitleInput.className = "title-edit-input";
	elTitleInput.type = "text";
	elTitleInput.placeholder = "Название Магазина";
	elTitleInput.value = item.storeName;
	elTitleInput.style.position = "relative";
	const inputLabel = document.createElement("label");
	inputLabel.textContent = "Куда было потрачено:";
	inputLabel.className = "input-label-edit";

	const elAmountInput = document.createElement("input");
	elAmountInput.className = "amount-edit-input";
	elAmountInput.type = "number";
	elAmountInput.placeholder = "Сколько было потрачено";
	elAmountInput.value = item.amount;
	elAmountInput.style.position = "relative";
	const inputLabelSecond = document.createElement("label");
	inputLabelSecond.textContent = "Сколько было потрачено:";
	inputLabelSecond.className = "input-label-edit";

	inputWrapper.append(inputLabel, elTitleInput);
	secondWrapper.append(inputLabelSecond, elAmountInput);
	titleWrapper.append(elCounter, elTitle);
	elBtnList.append(saveBtn, refuseBtn, editBtn, deleteBtn);
	element.append(titleWrapper, elAmount, elBtnList);
	return element;
}

async function renderExpenses() {
	try {
		const data = await fetch("http://localhost:9000/expenses");
		allExpenses = await data.json();
	} catch (err) {
		alert("Не удалось получить данные с сервера. Попробуйте позже.");
	} finally {
		inputList.innerHTML = "";
		allExpenses.forEach((item) => {
			inputList.append(createElem(item));
		});
		updateTotalAmount(allExpenses);
	}
}

async function addNewExpense(data) {
	try {
		const response = await fetch("http://localhost:9000/expenses", {
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify({
				storeName: data.storeName,
				date: data.date,
				amount: data.amount,
			}),
		});
		console.log(await response.text());
	} catch (err) {
		console.log(err);
	} finally {
		await renderExpenses(allExpenses);
		input1.value = "";
		input2.value = "";
	}
}

async function updateItemInfo(data) {
	try {
		const item = {
			id: data._id,
			storeName: data.storeName,
			date: data.date,
			amount: data.amount,
		};

		const result = await fetch(`http://localhost:9000/expenses`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify(item),
		});

		if (!result.ok) {
			const { message } = await result.json();
			alert(message);
			return;
		} else {
			renderExpenses(allExpenses);
		}
	} catch (err) {
		console.log(err);
	}
}

async function deleteExpense(data) {
	try {
		const result = await fetch("http://localhost:9000/expenses", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify({
				id: data._id,
				storeName: data.storeName,
				date: data.date,
				amount: data.amount,
			}),
		});
		console.log(await result.text());
	} catch (err) {
		alert("Сервер недоступен. Попробуйте позже.");
	} finally {
		await renderExpenses(allExpenses);
	}
}

appInputs.addEventListener("submit", async (e) => {
	try {
		e.preventDefault();
		if (!input2.value && !input1.value) {
			input2.style.border = "1px solid rgba(255,0,0,0.5)";
			input1.style.border = "1px solid rgba(255,0,0,0.5)";
			throw new Error("Поля ввода не могут быть пустыми");
		} else if (!input2.value) {
			input1.style.border = "none";
			input2.style.border = "1px solid rgba(255,0,0,0.5)";
			throw new Error("Поля ввода не могут быть пустыми");
		} else if (!input1.value) {
			input2.style.border = "none";
			input1.style.border = "1px solid rgba(255,0,0,0.5)";
			throw new Error("Поля ввода не могут быть пустыми");
		}

		if (isNaN(input2.value)) {
			input2.style.border = "1px solid rgba(255,0,0,0.5)";
			throw new Error("Некорректный ввод потраченной суммы (Только число)");
		}

		const date = new Date();

		await addNewExpense({
			storeName: input1.value,
			date: `${date.getDay()}.${
				date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth()
			}.${date.getFullYear()}`,
			amount: input2.value,
		});
		input1.style.border = "none";
		input2.style.border = "none";
	} catch (err) {
		alert(err);
	}
});

const inputs = [input1, input2];
inputs.forEach((input) =>
	input.addEventListener("keypress", () => (input.style.border = "none"))
);
