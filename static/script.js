document.addEventListener("DOMContentLoaded", () => {
  // =========================================================
  // ELEMENTS
  // =========================================================

  const searchButton = document.getElementById("searchButton");

  const datasetInput = document.getElementById("data");
  const targetInput = document.getElementById("target");

  // Result elements
  const resultTarget = document.getElementById("resultTarget");
  const classicalCost = document.getElementById("classicalCost");
  const quantumIterations = document.getElementById("quantumIterations");
  const searchResult = document.getElementById("searchResult");

  // Comparison table
  const classicalFound = document.getElementById("classicalFound");
  const quantumFound = document.getElementById("quantumFound");

  const classicalSearchCost = document.getElementById("classicalSearchCost");

  const quantumSearchCost = document.getElementById("quantumSearchCost");

  // Graph slots
  const classicalChart = document.getElementById("classicalChart");

  const quantumChart = document.getElementById("quantumChart");

  // =========================================================
  // RUN SEARCH
  // =========================================================

  async function runSearch() {
    // -----------------------------------------------------
    // 1. READ INPUTS
    // -----------------------------------------------------

    const datasetText = datasetInput.value.trim();
    const targetText = targetInput.value.trim();

    console.log("Dataset:", datasetText);
    console.log("Target:", targetText);

    // -----------------------------------------------------
    // 2. BASIC VALIDATION
    // -----------------------------------------------------

    if (!datasetText) {
      alert("Please enter a dataset.");
      datasetInput.focus();
      return;
    }

    if (!targetText) {
      alert("Please enter a target value.");
      targetInput.focus();
      return;
    }

    // -----------------------------------------------------
    // 3. CONVERT DATASET INTO NUMBERS
    // -----------------------------------------------------

    const dataset = datasetText
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => !Number.isNaN(value));

    const target = Number(targetText);

    if (dataset.length === 0) {
      alert("Please enter valid numbers separated by commas.");
      datasetInput.focus();
      return;
    }

    if (Number.isNaN(target)) {
      alert("Target must be a valid number.");
      targetInput.focus();
      return;
    }

    // -----------------------------------------------------
    // 4. BUTTON LOADING STATE
    // -----------------------------------------------------

    searchButton.disabled = true;

    const originalButtonHTML = searchButton.innerHTML;

    searchButton.innerHTML = `
            <span>Running...</span>
            <span class="button-arrow">→</span>
        `;

    try {
      // -------------------------------------------------
      // 5. SEND DATA TO FLASK
      // -------------------------------------------------

      const response = await fetch("/search", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          data: datasetText,
          target: target,
        }),
      });

      // -------------------------------------------------
      // 6. CHECK SERVER RESPONSE
      // -------------------------------------------------

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();

      console.log("Server response:", result);

      // -------------------------------------------------
      // 7. READ CLASSICAL SEARCH RESULT
      // -------------------------------------------------

      const found = Boolean(result.found);

      const index = Number.isInteger(result.index) ? result.index : -1;

      const comparisons = Number.isFinite(result.comparisons)
        ? result.comparisons
        : 0;

      // -------------------------------------------------
      // 8. CALCULATE GROVER ITERATIONS
      //
      // Standard estimate:
      // π/4 × √N
      //
      // We are using this for the current visualization.
      // Later we can connect this to a proper Grover
      // simulation from the Python backend.
      // -------------------------------------------------

      const groverIterations = Math.max(
        1,
        Math.ceil((Math.PI / 4) * Math.sqrt(dataset.length)),
      );

      // -------------------------------------------------
      // 9. UPDATE RESULT METRICS
      // -------------------------------------------------

      resultTarget.textContent = target;

      classicalCost.textContent = comparisons;

      quantumIterations.textContent = groverIterations;

      searchResult.textContent = found ? `FOUND @ INDEX ${index}` : "NOT FOUND";

      // -------------------------------------------------
      // 10. UPDATE COMPARISON TABLE
      // -------------------------------------------------

      classicalFound.textContent = found ? `YES — index ${index}` : "NO";

      /*
       * For now the quantum section represents the
       * conceptual Grover simulation using the same
       * target/search problem.
       *
       * A real Grover simulator will be connected
       * through Flask in the next step.
       */
      quantumFound.textContent = found ? "YES" : "NO";

      classicalSearchCost.textContent = `${comparisons} comparison${comparisons === 1 ? "" : "s"}`;

      quantumSearchCost.textContent = `~${groverIterations} iteration${groverIterations === 1 ? "" : "s"}`;

      // -------------------------------------------------
      // 11. UPDATE CLASSICAL GRAPH
      // -------------------------------------------------

      renderClassicalGraph(dataset, target, index, comparisons);

      // -------------------------------------------------
      // 12. UPDATE QUANTUM GRAPH
      // -------------------------------------------------

      renderQuantumGraph(dataset, target, index, groverIterations);

      // -------------------------------------------------
      // 13. SCROLL TO RESULTS
      // -------------------------------------------------

      const resultsSection = document.querySelector(".results-section");

      if (resultsSection) {
        resultsSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } catch (error) {
      console.error("Search failed:", error);

      searchResult.textContent = "ERROR";

      alert(
        "Something went wrong while running the search.\n\n" + error.message,
      );
    } finally {
      // -------------------------------------------------
      // 14. RESTORE BUTTON
      // -------------------------------------------------

      searchButton.disabled = false;
      searchButton.innerHTML = originalButtonHTML;
    }
  }

  // =========================================================
  // CLASSICAL GRAPH
  // =========================================================

  function renderClassicalGraph(dataset, target, foundIndex, comparisons) {
    if (!classicalChart) {
      return;
    }

    // Clear existing graph
    classicalChart.innerHTML = "";

    const wrapper = document.createElement("div");

    wrapper.style.display = "flex";
    wrapper.style.alignItems = "flex-end";
    wrapper.style.justifyContent = "center";
    wrapper.style.gap = "10px";
    wrapper.style.height = "180px";
    wrapper.style.padding = "20px";

    dataset.forEach((value, index) => {
      const barContainer = document.createElement("div");

      barContainer.style.display = "flex";
      barContainer.style.flexDirection = "column";
      barContainer.style.alignItems = "center";
      barContainer.style.justifyContent = "flex-end";
      barContainer.style.height = "100%";

      const bar = document.createElement("div");

      const isChecked =
        index <= foundIndex ||
        (!Number.isInteger(foundIndex) && index < comparisons);

      const height = Math.max(20, Math.min(130, Math.abs(value) * 1.2));

      bar.style.width = "34px";
      bar.style.height = `${height}px`;
      bar.style.borderRadius = "7px 7px 3px 3px";

      bar.style.background =
        index === foundIndex
          ? "#d9ff4d"
          : isChecked
            ? "#7658ff"
            : "rgba(255,255,255,0.15)";

      bar.style.transition = "height 0.4s ease, transform 0.2s ease";

      const label = document.createElement("span");

      label.textContent = value;

      label.style.marginTop = "8px";
      label.style.fontFamily = "DM Mono, monospace";
      label.style.fontSize = "11px";
      label.style.color = "#a7a7b4";

      barContainer.appendChild(bar);
      barContainer.appendChild(label);

      wrapper.appendChild(barContainer);
    });

    classicalChart.appendChild(wrapper);
  }

  // =========================================================
  // QUANTUM GRAPH
  // =========================================================

  function renderQuantumGraph(dataset, target, foundIndex, iterations) {
    if (!quantumChart) {
      return;
    }

    // Clear existing graph
    quantumChart.innerHTML = "";

    const wrapper = document.createElement("div");

    wrapper.style.display = "flex";
    wrapper.style.alignItems = "flex-end";
    wrapper.style.justifyContent = "center";
    wrapper.style.gap = "10px";
    wrapper.style.height = "180px";
    wrapper.style.padding = "20px";

    dataset.forEach((value, index) => {
      const barContainer = document.createElement("div");

      barContainer.style.display = "flex";
      barContainer.style.flexDirection = "column";
      barContainer.style.alignItems = "center";
      barContainer.style.justifyContent = "flex-end";
      barContainer.style.height = "100%";

      const bar = document.createElement("div");

      let probability;

      if (index === foundIndex) {
        // Target receives the amplified probability
        probability = Math.min(0.95, 0.35 + iterations * 0.12);
      } else {
        // Remaining states have lower probability
        probability = Math.max(
          0.08,
          (1 - Math.min(0.95, 0.35 + iterations * 0.12)) /
            Math.max(dataset.length - 1, 1),
        );
      }

      const height = Math.max(18, probability * 130);

      bar.style.width = "34px";
      bar.style.height = `${height}px`;
      bar.style.borderRadius = "7px 7px 3px 3px";

      bar.style.background =
        index === foundIndex ? "#7658ff" : "rgba(118,88,255,0.25)";

      const label = document.createElement("span");

      label.textContent = value;

      label.style.marginTop = "8px";
      label.style.fontFamily = "DM Mono, monospace";

      label.style.fontSize = "11px";
      label.style.color = "#a7a7b4";

      barContainer.appendChild(bar);
      barContainer.appendChild(label);

      wrapper.appendChild(barContainer);
    });

    quantumChart.appendChild(wrapper);
  }

  // =========================================================
  // BUTTON EVENT
  // =========================================================

  searchButton.addEventListener("click", runSearch);

  // =========================================================
  // ENTER KEY
  // =========================================================

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const activeElement = document.activeElement;

      if (activeElement === datasetInput || activeElement === targetInput) {
        event.preventDefault();
        runSearch();
      }
    }
  });
});
