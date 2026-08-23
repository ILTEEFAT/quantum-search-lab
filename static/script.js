document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // =========================================================
    // ELEMENTS
    // =========================================================

    const searchButton = document.getElementById("searchButton");
    const datasetInput = document.getElementById("data");
    const targetInput = document.getElementById("target");

    const resultTarget = document.getElementById("resultTarget");
    const classicalCost = document.getElementById("classicalCost");
    const quantumIterations = document.getElementById("quantumIterations");
    const searchResult = document.getElementById("searchResult");

    const classicalFound = document.getElementById("classicalFound");
    const quantumFound = document.getElementById("quantumFound");

    const classicalSearchCost =
        document.getElementById("classicalSearchCost");

    const quantumSearchCost =
        document.getElementById("quantumSearchCost");

    const classicalChart =
        document.getElementById("classicalChart");

    const quantumChart =
        document.getElementById("quantumChart");


    // =========================================================
    // CHECK REQUIRED ELEMENTS
    // =========================================================

    if (!searchButton) {
        console.error("ERROR: #searchButton was not found.");
        return;
    }

    if (!datasetInput) {
        console.error("ERROR: #data was not found.");
        return;
    }

    if (!targetInput) {
        console.error("ERROR: #target was not found.");
        return;
    }

    console.log("Quantum Search Lab JS loaded successfully.");


    // =========================================================
    // UTILITY FUNCTIONS
    // =========================================================

    function setText(element, value) {
        if (element) {
            element.textContent = value;
        }
    }


    function parseDataset(text) {
        return text
            .split(",")
            .map(value => value.trim())
            .filter(value => value !== "")
            .map(Number);
    }


    function validateDataset(dataset) {
        if (dataset.length === 0) {
            return false;
        }

        return dataset.every(Number.isFinite);
    }


    // =========================================================
    // CLASSICAL LINEAR SEARCH
    // =========================================================

    function linearSearch(dataset, target) {

        let comparisons = 0;

        for (let i = 0; i < dataset.length; i++) {

            comparisons++;

            if (dataset[i] === target) {
                return {
                    found: true,
                    index: i,
                    comparisons: comparisons
                };
            }
        }

        return {
            found: false,
            index: -1,
            comparisons: comparisons
        };
    }


    // =========================================================
    // GROVER ITERATION ESTIMATE
    // =========================================================

    function calculateGroverIterations(size) {

        if (size <= 1) {
            return 1;
        }

        return Math.max(
            1,
            Math.ceil(
                (Math.PI / 4) * Math.sqrt(size)
            )
        );
    }


    // =========================================================
    // BUTTON LOADING STATE
    // =========================================================

    function setButtonLoading(loading) {

        if (loading) {

            searchButton.disabled = true;

            searchButton.innerHTML = `
                <span>Running...</span>
                <span class="button-arrow">→</span>
            `;

        } else {

            searchButton.disabled = false;

            searchButton.innerHTML = `
                <span>Run Search</span>
                <span class="button-arrow">→</span>
            `;
        }
    }


    // =========================================================
    // UPDATE RESULT INFORMATION
    // =========================================================

    function updateResults(
        dataset,
        target,
        found,
        index,
        comparisons,
        groverIterations
    ) {

        setText(resultTarget, target);

        setText(
            classicalCost,
            comparisons
        );

        setText(
            quantumIterations,
            groverIterations
        );


        setText(
            searchResult,
            found
                ? `FOUND @ INDEX ${index}`
                : "NOT FOUND"
        );


        setText(
            classicalFound,
            found
                ? `YES — index ${index}`
                : "NO"
        );


        /*
         * This is a conceptual visualization of
         * Grover's search, not a claim that the
         * browser executed a real quantum circuit.
         */

        setText(
            quantumFound,
            found ? "YES" : "NO"
        );


        setText(
            classicalSearchCost,
            `${comparisons} comparison${
                comparisons === 1 ? "" : "s"
            }`
        );


        setText(
            quantumSearchCost,
            `~${groverIterations} iteration${
                groverIterations === 1 ? "" : "s"
            }`
        );


        // Render graphs

        renderClassicalGraph(
            dataset,
            target,
            index,
            comparisons
        );

        renderQuantumGraph(
            dataset,
            target,
            index,
            groverIterations
        );
    }


    // =========================================================
    // CLASSICAL GRAPH
    // =========================================================

    function renderClassicalGraph(
        dataset,
        target,
        foundIndex,
        comparisons
    ) {

        if (!classicalChart) {
            return;
        }

        classicalChart.innerHTML = "";


        const wrapper = document.createElement("div");

        wrapper.style.display = "flex";
        wrapper.style.alignItems = "flex-end";
        wrapper.style.justifyContent = "center";
        wrapper.style.gap = "10px";
        wrapper.style.width = "100%";
        wrapper.style.height = "180px";
        wrapper.style.padding = "20px";
        wrapper.style.boxSizing = "border-box";


        const maxValue = Math.max(
            ...dataset.map(value => Math.abs(value)),
            1
        );


        dataset.forEach((value, index) => {

            const container =
                document.createElement("div");

            container.style.display = "flex";
            container.style.flexDirection = "column";
            container.style.alignItems = "center";
            container.style.justifyContent = "flex-end";
            container.style.height = "100%";
            container.style.minWidth = "35px";


            const bar =
                document.createElement("div");


            const checked =
                index < comparisons;

            const isTarget =
                index === foundIndex;


            const height = Math.max(
                18,
                Math.min(
                    125,
                    (Math.abs(value) / maxValue) * 110
                )
            );


            bar.style.width = "30px";
            bar.style.height = `${height}px`;

            bar.style.borderRadius =
                "6px 6px 2px 2px";


            if (isTarget) {

                bar.style.background = "#d9ff4d";
                bar.style.boxShadow =
                    "0 0 18px rgba(217,255,77,0.45)";

            } else if (checked) {

                bar.style.background = "#7658ff";

            } else {

                bar.style.background =
                    "rgba(255,255,255,0.12)";
            }


            bar.style.transition =
                "all 0.35s ease";


            const label =
                document.createElement("span");

            label.textContent = value;

            label.style.marginTop = "8px";
            label.style.fontFamily =
                "DM Mono, monospace";
            label.style.fontSize = "11px";
            label.style.color = "#a7a7b4";


            container.appendChild(bar);
            container.appendChild(label);

            wrapper.appendChild(container);
        });


        classicalChart.appendChild(wrapper);
    }


    // =========================================================
    // QUANTUM GRAPH
    // =========================================================

    function renderQuantumGraph(
        dataset,
        target,
        foundIndex,
        iterations
    ) {

        if (!quantumChart) {
            return;
        }

        quantumChart.innerHTML = "";


        const wrapper =
            document.createElement("div");


        wrapper.style.display = "flex";
        wrapper.style.alignItems = "flex-end";
        wrapper.style.justifyContent = "center";
        wrapper.style.gap = "10px";
        wrapper.style.width = "100%";
        wrapper.style.height = "180px";
        wrapper.style.padding = "20px";
        wrapper.style.boxSizing = "border-box";


        const amplifiedProbability =
            Math.min(
                0.95,
                0.25 + iterations * 0.15
            );


        dataset.forEach((value, index) => {

            const container =
                document.createElement("div");


            container.style.display = "flex";
            container.style.flexDirection = "column";
            container.style.alignItems = "center";
            container.style.justifyContent = "flex-end";
            container.style.height = "100%";
            container.style.minWidth = "35px";


            const bar =
                document.createElement("div");


            let probability;


            if (index === foundIndex) {

                probability =
                    amplifiedProbability;

            } else {

                probability =
                    Math.max(
                        0.05,
                        (1 - amplifiedProbability) /
                        Math.max(dataset.length - 1, 1)
                    );
            }


            const height =
                Math.max(
                    18,
                    Math.min(
                        130,
                        probability * 130
                    )
                );


            bar.style.width = "30px";
            bar.style.height = `${height}px`;

            bar.style.borderRadius =
                "6px 6px 2px 2px";


            if (index === foundIndex) {

                bar.style.background = "#7658ff";

                bar.style.boxShadow =
                    "0 0 20px rgba(118,88,255,0.45)";

            } else {

                bar.style.background =
                    "rgba(118,88,255,0.22)";
            }


            bar.style.transition =
                "all 0.4s ease";


            const label =
                document.createElement("span");

            label.textContent = value;

            label.style.marginTop = "8px";
            label.style.fontFamily =
                "DM Mono, monospace";
            label.style.fontSize = "11px";
            label.style.color = "#a7a7b4";


            container.appendChild(bar);
            container.appendChild(label);

            wrapper.appendChild(container);
        });


        quantumChart.appendChild(wrapper);
    }


    // =========================================================
    // TRY FLASK BACKEND
    // =========================================================

    async function tryBackend(datasetText, target) {

        try {

            const response =
                await fetch("/search", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        data: datasetText,
                        target: target
                    })
                });


            if (!response.ok) {
                throw new Error(
                    `Backend returned HTTP ${response.status}`
                );
            }


            const result =
                await response.json();


            console.log(
                "Flask response:",
                result
            );


            return result;

        } catch (error) {

            console.warn(
                "Flask /search unavailable. Using local search.",
                error
            );

            return null;
        }
    }


    // =========================================================
    // MAIN SEARCH FUNCTION
    // =========================================================

    async function runSearch(event) {

        if (event) {
            event.preventDefault();
        }


        if (searchButton.disabled) {
            return;
        }


        const datasetText =
            datasetInput.value.trim();


        const targetText =
            targetInput.value.trim();


        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!datasetText) {

            alert(
                "Please enter a dataset."
            );

            datasetInput.focus();

            return;
        }


        if (!targetText) {

            alert(
                "Please enter a target value."
            );

            targetInput.focus();

            return;
        }


        const dataset =
            parseDataset(datasetText);


        if (!validateDataset(dataset)) {

            alert(
                "Please enter valid numbers separated by commas."
            );

            datasetInput.focus();

            return;
        }


        const target =
            Number(targetText);


        if (!Number.isFinite(target)) {

            alert(
                "Target must be a valid number."
            );

            targetInput.focus();

            return;
        }


        // -----------------------------------------------------
        // START
        // -----------------------------------------------------

        setButtonLoading(true);


        try {

            /*
             * First perform the search locally.
             *
             * This guarantees that the UI works even if
             * Flask is temporarily unavailable.
             */

            const localResult =
                linearSearch(
                    dataset,
                    target
                );


            let finalResult =
                localResult;


            /*
             * Try Flask as well.
             *
             * If Flask responds correctly, use its result.
             * Otherwise keep the local result.
             */

            const backendResult =
                await tryBackend(
                    datasetText,
                    target
                );


            if (
                backendResult &&
                typeof backendResult === "object"
            ) {

                if (
                    typeof backendResult.found ===
                    "boolean"
                ) {

                    finalResult = {

                        found:
                            backendResult.found,

                        index:
                            Number.isInteger(
                                backendResult.index
                            )
                                ? backendResult.index
                                : -1,

                        comparisons:
                            Number.isFinite(
                                backendResult.comparisons
                            )
                                ? backendResult.comparisons
                                : localResult.comparisons
                    };
                }
            }


            // -------------------------------------------------
            // GROVER ESTIMATE
            // -------------------------------------------------

            const groverIterations =
                calculateGroverIterations(
                    dataset.length
                );


            // -------------------------------------------------
            // UPDATE UI
            // -------------------------------------------------

            updateResults(

                dataset,

                target,

                finalResult.found,

                finalResult.index,

                finalResult.comparisons,

                groverIterations
            );


            // -------------------------------------------------
            // SCROLL TO RESULTS
            // -------------------------------------------------

            const resultsSection =
                document.querySelector(
                    ".results-section"
                );


            if (resultsSection) {

                setTimeout(() => {

                    resultsSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }, 150);
            }


        } catch (error) {

            console.error(
                "Search failed:",
                error
            );


            setText(
                searchResult,
                "ERROR"
            );


            alert(
                "Something went wrong.\n\n" +
                error.message
            );


        } finally {

            setButtonLoading(false);
        }
    }


    // =========================================================
    // BUTTON CLICK
    // =========================================================

    searchButton.addEventListener(
        "click",
        runSearch
    );


    // =========================================================
    // ENTER KEY
    // =========================================================

    datasetInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                runSearch();
            }
        }
    );


    targetInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                runSearch();
            }
        }
    );


    // =========================================================
    // INITIAL STATE
    // =========================================================

    console.log(
        "Quantum Search Lab ready."
    );

});
