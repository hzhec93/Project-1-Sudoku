import { addScore } from "../firebase/firebaseData.js";
import { rowColToIndex, checkDuplicates, solve } from "./solver.js";
import { updateScoreBoard } from "./scoreboard.js";
import { timeStart, timePause, timeReset } from "./timer.js";

// getScore().then((results) => {
// 	console.log(results);
// });

let selectedSquare = "";
let loadedPuzzle = [];
let completedPuzzle = [];
let boardIndex = "";
// Initialise sudoku board. Puzzles extracted by sudoku iphone game app.
let sudokuBoard = {
	0: [
		8, 9, 4, 0, 0, 0, 0, 5, 1, 0, 0, 7, 0, 0, 3, 0, 6, 9, 0, 6, 0, 5, 0, 4, 0, 0,
		0, 0, 3, 8, 4, 5, 1, 0, 0, 0, 2, 0, 0, 0, 0, 6, 8, 0, 5, 6, 0, 0, 0, 0, 2, 7,
		0, 0, 3, 8, 0, 1, 7, 5, 0, 0, 0, 4, 0, 0, 3, 6, 9, 1, 0, 8, 0, 1, 0, 0, 0, 0,
		5, 7, 0,
	],
	1: [
		3, 7, 8, 4, 1, 0, 2, 0, 0, 5, 6, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 7, 6, 0, 0, 0,
		1, 0, 0, 0, 3, 0, 0, 8, 0, 0, 0, 3, 2, 1, 0, 0, 6, 9, 0, 0, 0, 6, 2, 8, 4, 3,
		5, 7, 0, 0, 4, 0, 0, 0, 0, 0, 5, 0, 5, 0, 0, 3, 1, 9, 4, 6, 6, 1, 0, 0, 0, 0,
		7, 0, 8,
	],
};
let completedBoard = {
	0: [
		8, 9, 4, 6, 2, 7, 3, 5, 1, 5, 2, 7, 8, 1, 3, 4, 6, 9, 1, 6, 3, 5, 9, 4, 2, 8,
		7, 7, 3, 8, 4, 5, 1, 6, 9, 2, 2, 4, 9, 7, 3, 6, 8, 1, 5, 6, 5, 1, 9, 8, 2, 7,
		3, 4, 3, 8, 2, 1, 7, 5, 9, 4, 6, 4, 7, 5, 3, 6, 9, 1, 2, 8, 9, 1, 6, 2, 4, 8,
		5, 7, 3,
	],
	1: [
		3, 7, 8, 4, 1, 5, 2, 6, 9, 5, 6, 1, 9, 2, 8, 4, 7, 3, 4, 2, 9, 7, 6, 3, 5, 8,
		1, 7, 4, 5, 3, 9, 6, 8, 1, 2, 8, 3, 2, 1, 5, 7, 6, 9, 4, 1, 9, 6, 2, 8, 4, 3,
		5, 7, 9, 8, 4, 6, 7, 2, 1, 3, 5, 2, 5, 7, 8, 3, 1, 9, 4, 6, 6, 1, 3, 5, 4, 9,
		7, 2, 8,
	],
};
let activeBtn = null;
let hintStatus = false;
let buttonStatus = false;
let numOfHint = 3;

// let parsedDetails = [];

const movesBox = document.querySelector(".moves-box");
// const numSelector = document.querySelectorAll(".number-selector");
const numBox = document.querySelector(".number-box");
const gameBox = document.querySelector(".game-box");
const messageBox = document.querySelector(".message-box");
const textBox = document.querySelector(".text-box");
const clearBtn = document.querySelector(".clear-selector");
const hintBtn = document.querySelector(".hint-selector");
const newGameBtn = document.querySelector(".new-game-btn");
const submitBtn = document.querySelector(".submit-btn");
const resetBtn = document.querySelector(".reset-btn");
const completeBtn = document.querySelector(".complete-btn");
// const newGame = document.querySelector(".new-game");
const submit = document.querySelector(".submit");
const reset = document.querySelector(".reset");
const complete = document.querySelector(".complete");
const startTime = document.querySelector(".start-time");
const pauseTime = document.querySelector(".pause-time");
const inputName = document.querySelector("#input-name");
const timerBox = document.querySelector(".timer");
const minute = document.querySelector("#minute");
const second = document.querySelector("#second");
const alertMessage = document.querySelector(".alert");
const alertLogin = document.querySelector(".alert-login");

// Initial condition of the buttons when page loaded
submit.style.display = "none";
reset.style.display = "none";
complete.style.display = "none";
gameBox.style.display = "none";
timerBox.style.display = "none";

const screenWidth = window.innerWidth;
if (screenWidth < 750) {
	let touchStatus = false;
	const windowSizeChange = () => {
		numBox.addEventListener("touchstart", (event) => {
			selectedSquare = event.target.id;
			messageBox.innerHTML = `Selected number: &nbsp;&nbsp;<span>${selectedSquare}</span>`;
			touchStatus = true;
			toggleButton(event);
		});
		gameBox.addEventListener("touchend", (event) => {
			let squareRow = parseInt(event.target.getAttribute("row"));
			let squareCol = parseInt(event.target.getAttribute("col"));
			let squareIndex = rowColToIndex(squareRow, squareCol);
			if (touchStatus) {
				loadedPuzzle[squareIndex] = parseInt(selectedSquare);
				event.target.classList.toggle(
					"duplicate",
					!checkDuplicates(
						loadedPuzzle,
						parseInt(squareIndex),
						parseInt(selectedSquare)
					)
				);
				event.target.innerText = selectedSquare;
				touchStatus = false;
			}
			messageBox.innerText = `Please select a number`;
		});
	};

	windowSizeChange();
}

////////////////////
/// LocalStorage ///
////////////////////

// if (localStorage.length === 0) {
// 	localStorage.setItem("Rank", "[]");
// } else {
// 	parsedDetails = JSON.parse(localStorage.getItem("Rank"));
// }

// Function to load scoreboard from localStorage
// const updateScoreBoard = () => {
// 	const rankDetails = JSON.parse(localStorage.getItem("Rank"));
// 	if (rankDetails.length !== 0) {
// 		rankDetails.sort((a, b) =>
// 			a.time > b.time ? 1 : a.time < b.time ? -1 : 0
// 		);
// 	}
// 	for (
// 		let i = 0;
// 		i < (rankDetails.length <= 10 ? rankDetails.length : 10);
// 		i++
// 	) {
// 		const tr = document.createElement("tr");
// 		tr.classList.add("result");
// 		const tdRank = document.createElement("td");
// 		tdRank.innerText = i + 1;
// 		tr.appendChild(tdRank);
// 		tableDetails.appendChild(tr);
// 		Object.values(rankDetails[i]).forEach((value) => {
// 			const td = document.createElement("td");
// 			td.innerText = value;
// 			tr.appendChild(td);
// 			tableDetails.appendChild(tr);
// 		});
// 	}
// };

updateScoreBoard();

/////////////////////////////////
/// Add Drag & Drop Functions ///
/////////////////////////////////

// Drag start event handler
const dragStart = (event) => {
	// Set the data being dragged
	event.dataTransfer.setData("text", event.target.id);
	toggleButton(event);
};

// Drag over event handler
const dragOver = (event) => {
	// Prevent the default behaviour
	event.preventDefault();
};

const dragEnter = (event) => {
	event.preventDefault();
	if (event.target.classList.contains("active")) {
		event.target.classList.add("hover");
	}
};

const dragLeave = (event) => {
	event.target.classList.remove("hover");
};

// Drop event handler
const drop = (event) => {
	// Prevent the default behavior
	event.preventDefault();

	// Get the data being dropped
	const data = event.dataTransfer.getData("text");

	// Append the dropped element to the droppable element
	const draggableElement = document.getElementById(data);
	// console.log(draggableElement);
	if (event.target.classList.contains("active")) {
		event.target.innerText = draggableElement.id;
		event.target.classList.remove("hover");
		let squareRow = parseInt(event.target.getAttribute("row"));
		let squareCol = parseInt(event.target.getAttribute("col"));
		let squareIndex = rowColToIndex(squareRow, squareCol);
		loadedPuzzle[squareIndex] = parseInt(draggableElement.id);
		// if (
		// 	!checkDuplicates(
		// 		loadedPuzzle,
		// 		parseInt(squareIndex),
		// 		parseInt(draggableElement.id)
		// 	)
		// ) {
		// 	event.target.classList.add("duplicate");
		// } else {
		// 	event.target.classList.remove("duplicate");
		// }
		event.target.classList.toggle(
			"duplicate",
			!checkDuplicates(
				loadedPuzzle,
				parseInt(squareIndex),
				parseInt(draggableElement.id)
			)
		);
	}
};

numBox.addEventListener("dragstart", dragStart);
gameBox.addEventListener("dragover", dragOver);
gameBox.addEventListener("dragenter", dragEnter);
gameBox.addEventListener("dragleave", dragLeave);
gameBox.addEventListener("drop", drop);

//////////////////////////////////////
/// Load pre-loaded board randomly ///
//////////////////////////////////////
// Function to generate random pre-loaded sudoku board
const randomBoard = () => {
	const randomIndex = parseInt(
		Math.floor(Math.random() * Object.keys(sudokuBoard).length)
	);
	boardIndex = randomIndex;
	// Clone array to loadedPuzzle
	completedPuzzle = [...completedBoard[boardIndex]];
	return (loadedPuzzle = [...sudokuBoard[boardIndex]]);
};

// Create a 9x9 board
for (let i = 0; i < 81; i++) {
	const square = document.createElement("div");
	let col = i % 9;
	let row = Math.floor(i / 9);
	square.classList.add("square", "row" + row, "col" + col);
	square.setAttribute("row", row);
	square.setAttribute("col", col);

	// Assign classlist to subgrid (3x3 box)
	if (
		((col === 0 ||
			col === 1 ||
			col === 2 ||
			col === 6 ||
			col === 7 ||
			col === 8) &&
			(row === 0 ||
				row === 1 ||
				row === 2 ||
				row === 6 ||
				row === 7 ||
				row === 8)) ||
		((col === 3 || col === 4 || col === 5) &&
			(row === 3 || row === 4 || row === 5))
	) {
		square.classList.add("odd-box");
	} else {
		square.classList.add("even-box");
	}

	gameBox.appendChild(square);
}

// Function to generate the sudoku board and add event listener
const generateSudoku = (array) => {
	const squares = document.querySelectorAll(".square");
	// Generate random number to load the sudoku puzzle randomly
	for (let i = 0; i < 81; i++) {
		let num = array[i];
		squares[i].innerText = "";
		if (squares[i].classList.contains("passed")) {
			squares[i].classList.remove("passed");
		}
		if (num !== 0) {
			if (squares[i].classList.contains("active")) {
				squares[i].classList.remove("active");
			}
			squares[i].innerText = num;
		} else {
			squares[i].classList.add("active");
			squares[i].addEventListener("click", (event) => {
				let squareRow = parseInt(event.target.getAttribute("row"));
				let squareCol = parseInt(event.target.getAttribute("col"));
				let squareIndex = rowColToIndex(squareRow, squareCol);
				if (buttonStatus) {
					// if (event.target.classList.contains("duplicate")) {
					// 	event.target.classList.remove("duplicate");
					// }
					if (hintStatus) {
						// console.log(completedPuzzle[squareIndex]);
						selectedSquare = completedPuzzle[squareIndex];
						numOfHint--;
						hintBtn.innerText = `Hint: ${numOfHint}`;
						if (numOfHint === 0) {
							hintBtn.disabled = true;
						}
						activeBtn.classList.remove("selected");
						hintStatus = false;
					}
					if (selectedSquare !== "") {
						loadedPuzzle[squareIndex] = parseInt(selectedSquare);
					} else {
						loadedPuzzle[squareIndex] = 0;
					}
					event.target.classList.toggle(
						"duplicate",
						!checkDuplicates(
							loadedPuzzle,
							parseInt(squareIndex),
							parseInt(selectedSquare)
						)
					);
					event.target.innerText = selectedSquare;
					toggleButton(event);
					messageBox.innerText = `Please select a number`;
				}
			});
		}
	}
};

///////////////////////////////////
/// Create toggle-liked buttons ///
///////////////////////////////////
// Function to create toggle-liked buttons
const toggleButton = (event) => {
	event.target.classList.add("selected");

	// Reference taken from https://dev.to/oliwier965/multiple-buttons-only-one-active-on-click-50on
	if (activeBtn === null) {
		activeBtn = event.target;
	} else if (activeBtn !== event.target) {
		activeBtn.classList.remove("selected");
		activeBtn = event.target;
	}
	buttonStatus = false;
};

//////////////////////////////////////////
/// Add event listeners to all buttons ///
//////////////////////////////////////////

// Add event listener to number 1 - 9 for input purpose
// numSelector.forEach((element) =>
// 	element.addEventListener("click", (event) => {
// 		const messageBox = document.querySelector(".message-box");
// 		let input = event.target.innerText;

// 		// console.log(event.target);
// 		// console.log(event.currentTarget);

// 		messageBox.innerHTML = `Selected number:<br> <span>${input}</span>`;
// 		selectedSquare = input;

// 		// console.log(num); // string type
// 		// console.log(typeof event.target.innerText);

// 		toggleButton(event);
// 		// console.log(activeBtn);)
// 	})
// );

// Add event listener to clear button to clear selected box
clearBtn.addEventListener("click", (event) => {
	selectedSquare = "";
	messageBox.innerText = `Select a box to clear the number`;
	toggleButton(event);
	buttonStatus = true;
});

// Add event listener to hint button to provide answer for selected box
hintBtn.addEventListener("click", (event) => {
	messageBox.innerText = `Select a box for hint`;
	hintStatus = true;
	// console.log(hintStatus);
	toggleButton(event);
	buttonStatus = true;
});

// Add event listener to newGameBtn to load new sudoku puzzle board
newGameBtn.addEventListener("click", () => {
	if (inputName.value.trim() !== "") {
		inputName.disabled = true;

		timePause();
		timeReset();
		numOfHint = 3;
		hintBtn.innerText = `Hint: ${numOfHint}`;
		hintBtn.disabled = false;
		hintStatus = false;
		if (activeBtn !== null) {
			activeBtn.classList.remove("selected");
		}
		alertMessage.style.display = "none";
		timerBox.style.display = "flex";
		gameBox.style.display = "grid";
		textBox.style.display = "flex";
		messageBox.innerText = "Please select a number";
		movesBox.style.display = "flex";
		pauseTime.disabled = false;
		startTime.disabled = true;
		submit.style.display = "flex";
		reset.style.display = "flex";
		complete.style.display = "flex";
		generateSudoku(randomBoard());
		timeStart();
	} else {
		alertMessage.style.display = "flex";
	}
});

// Add event listener to submitBtn to check and solve puzzle
submitBtn.addEventListener("click", () => {
	const squares = document.querySelectorAll(".square");
	const array = [];
	squares.forEach((element) => {
		let value =
			element.innerText !== "" ? parseInt(element.innerText) : element.innerText;
		array.push(value);
	});
	if (solve(array)) {
		timePause();
		messageBox.innerText = "Puzzle Completed!";
		let updateMinute = minute.innerText;
		let updateSecond = second.innerText;
		// const playerDetail = {
		// 	name: inputName.value,
		// 	time: `${updateMinute}:${updateSecond}`,
		// };
		// parsedDetails.push(playerDetail);
		// localStorage.setItem("Rank", JSON.stringify(parsedDetails));
		document.querySelectorAll(".result").forEach((element) => {
			element.parentNode.removeChild(element);
		});

		addScore(inputName.value, `${updateMinute}:${updateSecond}`);
		updateScoreBoard();
		movesBox.style.display = "none";
		pauseTime.disabled = true;
		startTime.disabled = true;
		submit.style.display = "none";
		reset.style.display = "none";
		complete.style.display = "none";
		inputName.value = "";
		inputName.disabled = false;
	}
});

// Add event listener to resetBtn to reset the puzzle board
resetBtn.addEventListener("click", () => {
	timePause();
	timeStart();
	generateSudoku([...sudokuBoard[boardIndex]]);
	loadedPuzzle = [...sudokuBoard[boardIndex]];
});

// Add event listener to completeBtn to load all answers
completeBtn.addEventListener("click", () => {
	const form = document.querySelector(".form");
	form.style.display = "block";

	const loginBtn = document.querySelector(".loginBtn");
	const cancelBtn = document.querySelector(".cancelBtn");
	const uName = document.querySelector("#uname");
	const psw = document.querySelector("#psw");

	loginBtn.addEventListener("click", () => {
		if (uName.value === "admin" && psw.value === "123") {
			const squares = document.querySelectorAll(".square");
			for (let i = 0; i < 81; i++) {
				if (squares[i].innerText === "") {
					// console.log(squares[i].innerText);
					squares[i].innerText = completedBoard[boardIndex][i];
				}
			}
			loadedPuzzle = [...completedBoard[boardIndex]];
			uName.value = "";
			psw.value = "";
			form.style.display = "none";
			alertLogin.style.display = "none";
		} else {
			alertLogin.style.display = "flex";
		}
	});

	cancelBtn.addEventListener("click", () => {
		uName.value = "";
		psw.value = "";
		form.style.display = "none";
		alertLogin.style.display = "none";
	});
});

// Add event listener to startTime button
startTime.addEventListener("click", () => {
	timeStart();
	gameBox.style.display = "grid";
	movesBox.style.display = "flex";
	textBox.style.display = "flex";
	pauseTime.disabled = false;
	startTime.disabled = true;
	submitBtn.disabled = false;
	resetBtn.disabled = false;
	completeBtn.disabled = false;
});

// Add event listener to pauseTime button
pauseTime.addEventListener("click", () => {
	timePause();
	gameBox.style.display = "none";
	movesBox.style.display = "none";
	textBox.style.display = "none";
	pauseTime.disabled = true;
	startTime.disabled = false;
	submitBtn.disabled = true;
	resetBtn.disabled = true;
	completeBtn.disabled = true;
});
