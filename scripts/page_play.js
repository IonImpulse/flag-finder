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

    updateGameScreen();
}
