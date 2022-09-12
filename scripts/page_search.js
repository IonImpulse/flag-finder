function search() {
    const filters = getFilters();
    const search_text = document.getElementById("search-input").value;
    const results = searchFlags(search_text, filters);

    console.info("Searching for...", search_text);
    const results_div = document.getElementById("search-results");


    if (results.length === 0) {
        removeAllChildren(results_div);

        const no_results = document.createElement("p");
        no_results.innerHTML = "No results found.";
        results_div.appendChild(no_results);
    } else {
        let divs = [];
        for (let result of results) {
            const flag_div = createFlagDiv(result, true, true, ["search", "lazyloaded"]);
            divs.push(flag_div);
        }

        state.current_search_results = divs;

        removeAllChildren(results_div);
        appendChildren(results_div, state.current_search_results.slice(0, 100));

        results_div.addEventListener("scroll", () => {

            if (results_div.scrollTop + results_div.clientHeight >= results_div.scrollHeight - 200) {
                const new_divs = state.current_search_results.slice(results_div.childElementCount, results_div.childElementCount + 100);


                appendChildren(results_div, new_divs);
            }
        })
    }
}

document.getElementById("filters-bar").addEventListener("mouseup", () => {
    setTimeout(() => {
        search();
    }, 100);
});

function getFilters() {
    const filter_conts = document.getElementsByClassName("filter-box");
    let filters = {};

    for (let filter_cont of filter_conts) {
        const filter_name = filter_cont.id;

        filters[filter_name] = [];

        const filter_inputs = filter_cont.getElementsByTagName("input");

        for (let filter of filter_inputs) {
            if (filter.checked) {
                filters[filter_name].push(filter.value);
            }
        }
    }

    return filters;
}

function searchFlags(text, filters) {
    let results = state.flags;

    // Apply filters
    for (let filter_name in filters) {
        const filter_values = filters[filter_name];

        if (filter_name == "color-filters" || filter_name == "misc-filters" || filter_name == "shapes-filters") {
            if (filter_values.length > 0) {
                results = results.filter(flag => {
                    for (let filter_value of filter_values) {
                        // Use weak == to let 0 = false and >0 = true
                        if (flag[filter_value] == true) {
                            return true;
                        }
                    }
                    return false;
                });
            }
        }

        if (filter_name == "data-set-filters") {
            if (filter_values.length > 0) {
                results = results.filter(flag => {
                    for (let filter_value of filter_values) {
                        if (flag.collection === filter_value) {
                            return true;
                        }
                    }
                    return false;
                });
            }
        }
    }

    // Apply text search
    const search_options = {
        keys: ["Name"],
        limit: 10000,
        allowTypo: true,
        all: true,
        threshold: -10000,
    };

    text = text.toLowerCase();
    text = text.replace(/[^a-z0-9 ]/g, "");
    text = text.replace(/ +/g, " ");
    text = text.trim();

    results = fuzzysort.go(text, results, search_options);

    results = results.map(result => result.obj);

    return results;
}