function createDriftingFlags(index) {
    let flag = state.flags[Math.floor(Math.random() * state.flags.length)];
    let grid_number = index;

    let div = createFlagDiv(flag, true, false, ["small", "scroll"]);

    div.style.gridRow = grid_number;
    div.style.gridColumn = 1;
    document.getElementById("random-drifting-flags").appendChild(div);
    setTimeout(() => {
        div.remove();
    }, 20000);
}
