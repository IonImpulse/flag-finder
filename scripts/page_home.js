function startRandomFlagGrid() {
    let grid = document.getElementById("random-flag-grid");

    let max_grid_elements = 4 * 8;
    
    const initial_conts = [];

    for (let i = 0; i < max_grid_elements; i++) {
        const flag_cont = document.createElement("div");
        flag_cont.classList.add("flag-container");

        initial_conts.push(flag_cont);
    }

    removeAllChildren(grid);
    appendChildren(grid, initial_conts);

    // Append first flags
    for (let i = 0; i < max_grid_elements; i++) {
        setTimeout(() => {
            const container = grid.children[i];
            const flag = generateRandomFlag();
            flag.classList.add("fade-in");

            container.appendChild(flag);
        }, i * 40);
    }

    setTimeout(() => {
        setInterval(() => {
            let flag = generateRandomFlag();
            flag.classList.add("fade-in");
            // Get random container
            let container = grid.children[Math.floor(Math.random() * grid.children.length)];
            // Add flag
            container.appendChild(flag);
            // Remove old flag
            setTimeout(() => {
                if (container.childNodes.length > 1) {
                    container.removeChild(container.firstChild);
                }
            }, 2000);
        }, 100);
    }, max_grid_elements * 40); 
}


function generateRandomFlag() {
    let flag = state.flags[Math.floor(Math.random() * state.flags.length)];

    let div = createFlagDiv(flag, true, false, ["small", "home"]);

    return div;
}
