async function start() {
    console.log("Loading data...");

    await loadAllFlags();

    console.log("Data loaded.");

    setInterval(() => {
        for (let i = 1; i < 5; i++) {
            createDriftingFlags(i);
        }
    }, 2000);
}
start();