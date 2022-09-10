function updateGameScreen() {
    const play = document.getElementById("play");

    const windows = play.firstElementChild.children;

    for (let w of windows) {
        w.classList.add("hidden");
    }

    document.getElementById(state.game_state.screen).classList.remove("hidden");
}

function startGame() {
    state.game_state.screen = "game-window";
    state.game_state.answer = getRandomFlag();
    state.game_state.guessed_flags = [];

    console.log(state.game_state.answer);

    updateGameScreen();
    renderGame();
}

function guess() {
    const search_input = document.getElementById("guess-input");
    const results = searchFlags(search_input.value, {});

    if (results.length > 0) {
        addGuess(results[0]);
        search_input.value = "";
        search_input.classList.remove("error");
        search_input.focus();
        renderGame();

        if (state.game_state.guessed_flags[0].Name === state.game_state.answer.Name) {
            state.game_state.screen = "win-window";
            renderWinScreen();
            updateGameScreen();
        }
    } else {
        search_input.classList.add("error");
    }
}

function addGuess(guess) {
    state.game_state.guessed_flags.unshift(guess);
}

function renderGame() {
    const current_guess = document.getElementById("current-guess");
    const previous_guesses = document.getElementById("previous-guesses");

    removeAllChildren(current_guess);

    if (state.game_state.guessed_flags.length !== 0) {
        const current_guess_div = generateOverlayPair(state.game_state.guessed_flags[0], state.game_state.answer);

        current_guess.appendChild(current_guess_div);
    }

    

    const divs = [];
    const p = document.createElement("h1");
    p.innerHTML = "PREVIOUS GUESSES";
    divs.push(p);
    for (let i = 1; i < state.game_state.guessed_flags.length; i++) {
        const guess = state.game_state.guessed_flags[i];
        const guess_div = generateOverlayPair(guess, state.game_state.answer);
        divs.push(guess_div);
    }

    removeAllChildren(previous_guesses);
    appendChildren(previous_guesses, divs);
}

function generateOverlayPair(guess, answer) {
    const div = document.createElement("div");
    div.classList.add("overlay-pair");

    const guess_div = createFlagDiv(guess, true, false, ["play"]);
    const guess_transparent_div = createFlagDiv(guess, false, false, ["play", "transparent"]);

    const answer_div = createFlagDiv(answer, false, false, ["play", "answer"]);

    const overlay_div = document.createElement("div");
    overlay_div.classList.add("overlay");

    overlay_div.appendChild(answer_div);
    overlay_div.appendChild(guess_transparent_div);

    div.appendChild(guess_div);
    div.appendChild(overlay_div);

    return div;
}

function renderWinScreen() {
    const flag_name = document.getElementById("win-flag-name");
    const number_of_guesses = document.getElementById("win-guesses");
    const flag_div = document.getElementById("answer-flag");

    flag_name.innerHTML = state.game_state.answer.Name;
    number_of_guesses.innerHTML = state.game_state.guessed_flags.length;

    removeAllChildren(flag_div);
    flag_div.appendChild(createFlagDiv(state.game_state.answer, false, false, ["play"]));
}