// Function to format numbers as currency
function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
}
// Function to fetch and display the current Bitcoin price with percentage change
async function fetchAndDisplayBTCPrice() {
    try {
        const response = await fetch("https://api.coindesk.com/v1/bpi/currentprice/BTC.json");
        const data = await response.json();
        const currentPrice = parseFloat(data.bpi.USD.rate.replace(/,/g, ""));

        // Fetch historical price for the previous day
        const historicalResponse = await fetch(
            "https://api.coindesk.com/v1/bpi/historical/close.json?for=yesterday"
        );
        const historicalData = await historicalResponse.json();
        const yesterdayPrice = Object.values(historicalData.bpi)[0];

        // Calculate the percentage change
        const percentageChange = (((currentPrice - yesterdayPrice) / yesterdayPrice) * 100).toFixed(2);

        // Display the current price and percentage change
        const priceDisplay = document.getElementById("btcPrice");
        const displayText = `Current BTC Price: ${formatCurrency(currentPrice)} (${percentageChange > 0 ? "+" : ""}${percentageChange}%)`;

        if (priceDisplay) {
            priceDisplay.textContent = displayText;
        } else {
            const priceElement = document.createElement("div");
            priceElement.id = "btcPrice";
            priceElement.style.textAlign = "center"; // Center the price display
            priceElement.style.padding = "15px";
            priceElement.textContent = displayText;
            document.body.insertBefore(priceElement, document.body.firstChild);
        }
    } catch (error) {
        console.error("Error fetching Bitcoin price:", error);
    }
}

// Initial fetch and interval setup
fetchAndDisplayBTCPrice();
setInterval(fetchAndDisplayBTCPrice, 500);

// Login functionality
const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.querySelector('.dashboard-container');
const loginMessage = document.getElementById('login-message');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simple hardcoded authentication for demonstration
    if (username === 'andy' && password === '1234') {
        loginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
    } else {
        loginMessage.textContent = 'Invalid username or password';
        loginMessage.style.color = 'red';
    }
});

// Sidebar navigation interaction
document.querySelectorAll('.sidebar nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
        document.querySelectorAll('.sidebar nav a').forEach(navLink => navLink.classList.remove('active'));

        const targetSection = document.querySelector(link.getAttribute('href'));
        targetSection.classList.remove('hidden');
        link.classList.add('active');
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const tradeForm = document.getElementById("tradeForm");
    const tradeHistoryTable = document.getElementById("tradeHistoryTable");

    // Handle form submission
    tradeForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form from reloading the page

        // Fetch values from the form
        const tradeDate = document.getElementById("tradeDate").value;
        const entryPrice = parseFloat(document.getElementById("entryPrice").value);
        const exitPrice = parseFloat(document.getElementById("exitPrice").value) || 0;
        const investment = parseFloat(document.getElementById("investmentAmount").value);
        const leverage = parseFloat(document.getElementById("leverage").value);
        const tradeType = document.getElementById("tradeType").value;
        const notes = document.getElementById("notes").value || "N/A";

        // Calculate profit or loss
        const profitLoss =
            tradeType === "long"
                ? ((exitPrice - entryPrice) * investment * leverage) / entryPrice
                : ((entryPrice - exitPrice) * investment * leverage) / entryPrice;

        // Format values
        const formattedEntryPrice = formatCurrency(entryPrice);
        const formattedExitPrice = exitPrice ? formatCurrency(exitPrice) : "N/A";
        const formattedInvestment = formatCurrency(investment);
        const formattedProfitLoss = formatCurrency(profitLoss);

        // Add a new row to the trade history table
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
                <td>${tradeDate}</td>
                <td>${formattedEntryPrice}</td>
                <td>${formattedExitPrice}</td>
                <td>${formattedInvestment}</td>
                <td>${formattedProfitLoss}</td>
                <td>${leverage}</td>
                <td>${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)}</td>
                <td>${notes}</td>
                <td>
                    <button class="edit-button" title="Edit">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="delete-button" title="Delete">
                        <span class="material-icons">delete</span>
                    </button>
                </td>
            `;
        tradeHistoryTable.appendChild(newRow);
        updateOverview();


        // Reset the form for new input
        tradeForm.reset();
        updatePotentialProfit(); // Reset the potential profit display
        alert("Trade added to history!");
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const tradeHistoryTable = document.getElementById("tradeHistoryTable");
    const editTradeModal = document.getElementById("editTradeModal");
    const editTradeForm = document.getElementById("editTradeForm");
    let rowToEdit = null;

    // Open modal and populate form
    tradeHistoryTable.addEventListener("click", function (event) {
        if (event.target.closest(".edit-button")) {
            rowToEdit = event.target.closest("tr"); // Store the row being edited
            const cells = rowToEdit.querySelectorAll("td");

            // Populate modal form fields
            document.getElementById("editTradeDate").value = cells[0].textContent;
            document.getElementById("editEntryPrice").value = parseFloat(cells[1].textContent.replace(/[^0-9.-]+/g, ""));
            document.getElementById("editExitPrice").value = parseFloat(cells[2].textContent.replace(/[^0-9.-]+/g, ""));
            document.getElementById("editInvestmentAmount").value = parseFloat(cells[3].textContent.replace(/[^0-9.-]+/g, ""));
            document.getElementById("editLeverage").value = cells[5].textContent.trim();
            document.getElementById("editTradeType").value = cells[6].textContent.toLowerCase();
            document.getElementById("editNotes").value = cells[7].textContent;

            // Show the modal
            editTradeModal.style.display = "block";
        }
    });

    // Save changes and update the row
    editTradeForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (rowToEdit) {
            const updatedTrade = {
                date: document.getElementById("editTradeDate").value,
                entryPrice: parseFloat(document.getElementById("editEntryPrice").value),
                exitPrice: parseFloat(document.getElementById("editExitPrice").value) || 0,
                investment: parseFloat(document.getElementById("editInvestmentAmount").value),
                leverage: parseFloat(document.getElementById("editLeverage").value),
                tradeType: document.getElementById("editTradeType").value,
                notes: document.getElementById("editNotes").value || "N/A"
            };

            // Update row with new values
            rowToEdit.innerHTML = `
                    <td>${updatedTrade.date}</td>
                    <td>${formatCurrency(updatedTrade.entryPrice)}</td>
                    <td>${formatCurrency(updatedTrade.exitPrice)}</td>
                    <td>${formatCurrency(updatedTrade.investment)}</td>
                    <td>${formatCurrency(
                updatedTrade.tradeType === "long"
                    ? ((updatedTrade.exitPrice - updatedTrade.entryPrice) * updatedTrade.investment * updatedTrade.leverage) / updatedTrade.entryPrice
                    : ((updatedTrade.entryPrice - updatedTrade.exitPrice) * updatedTrade.investment * updatedTrade.leverage) / updatedTrade.entryPrice
            )}</td>
                    <td>${updatedTrade.leverage}</td>
                    <td>${updatedTrade.tradeType.charAt(0).toUpperCase() + updatedTrade.tradeType.slice(1)}</td>
                    <td>${updatedTrade.notes}</td>
                    <td>
                        <button class="edit-button" title="Edit">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="delete-button" title="Delete">
                            <span class="material-icons">delete</span>
                        </button>
                    </td>
                `;

            // Hide the modal
            editTradeModal.style.display = "none";
        }
    });

    // Close the modal
    document.querySelector("#editTradeModal .close").addEventListener("click", function () {
        editTradeModal.style.display = "none";
    });
});

//  the modal profit
function updateModalPotentialProfit() {
    const entryPrice = parseFloat(document.getElementById("editEntryPrice").value) || 0;
    const exitPrice = parseFloat(document.getElementById("editExitPrice").value) || 0;
    const investment = parseFloat(document.getElementById("editInvestmentAmount").value) || 0;
    const leverage = parseFloat(document.getElementById("editLeverage").value) || 1;
    const tradeType = document.getElementById("editTradeType").value;

    let profit = 0;

    if (tradeType === "long") {
        profit = ((exitPrice - entryPrice) * investment * leverage) / entryPrice;
    } else if (tradeType === "short") {
        profit = ((entryPrice - exitPrice) * investment * leverage) / entryPrice;
    }

    const modalPotentialProfit = document.getElementById("modalPotentialProfit");
    modalPotentialProfit.textContent = `Potential Profit: ${formatCurrency(profit)}`;
}
document.addEventListener("DOMContentLoaded", () => {
    const editTradeForm = document.getElementById("editTradeForm");

    // Attach event listeners to modal fields
    ["editEntryPrice", "editExitPrice", "editInvestmentAmount", "editLeverage", "editTradeType"].forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener("input", updateModalPotentialProfit);
            field.addEventListener("change", updateModalPotentialProfit); // For dropdowns like tradeType
        }
    });
});
document.getElementById("tradeHistoryTable").addEventListener("click", function (event) {
    const target = event.target.closest("button"); // Get the clicked button

    if (!target) return; // Ensure a button was clicked

    if (target.classList.contains("edit-button")) {
        // Edit functionality
        const row = target.closest("tr");
        const cells = row.querySelectorAll("td");

        document.getElementById("editTradeDate").value = cells[0].textContent;
        document.getElementById("editEntryPrice").value = parseFloat(cells[1].textContent.replace(/[^0-9.-]+/g, ""));
        document.getElementById("editExitPrice").value = parseFloat(cells[2].textContent.replace(/[^0-9.-]+/g, ""));
        document.getElementById("editInvestmentAmount").value = parseFloat(cells[3].textContent.replace(/[^0-9.-]+/g, ""));
        document.getElementById("editLeverage").value = cells[5].textContent.trim();
        document.getElementById("editTradeType").value = cells[6].textContent.toLowerCase();
        document.getElementById("editNotes").value = cells[7].textContent;

        updateModalPotentialProfit(); // Update potential profit display in the modal
        document.getElementById("editTradeModal").style.display = "block"; // Show modal
    } else if (target.classList.contains("delete-button")) {
        // Delete functionality
        const row = target.closest("tr");
        if (row) {
            row.remove(); // Remove the row from the table
        }
    }
});


function updatePotentialProfit() {
    // Fetch values from the Add Trade form
    const entryPrice = parseFloat(document.querySelector("#open-trade #entryPrice").value) || 0;
    const exitPrice = parseFloat(document.querySelector("#open-trade #exitPrice").value) || 0;
    const investment = parseFloat(document.querySelector("#open-trade #investmentAmount").value) || 0;
    const leverage = parseFloat(document.querySelector("#open-trade #leverage").value) || 1;
    const tradeType = document.querySelector("#open-trade #tradeType").value;

    let profit = 0;

    // Calculate profit based on trade type
    if (tradeType === "long") {
        profit = ((exitPrice - entryPrice) * investment * leverage) / entryPrice;
    } else if (tradeType === "short") {
        profit = ((entryPrice - exitPrice) * investment * leverage) / entryPrice;
    }

    // Update the potential profit display
    const potentialProfitDisplay = document.querySelector("#open-trade #potentialProfit");
    potentialProfitDisplay.textContent = `Potential Profit: ${formatCurrency(profit)}`;
}
// Attach event listeners for inputs affecting potential profit
document.querySelector("#open-trade #entryPrice").addEventListener("input", updatePotentialProfit);
document.querySelector("#open-trade #exitPrice").addEventListener("input", updatePotentialProfit);
document.querySelector("#open-trade #investmentAmount").addEventListener("input", updatePotentialProfit);
document.querySelector("#open-trade #leverage").addEventListener("input", updatePotentialProfit);
document.querySelector("#open-trade #tradeType").addEventListener("change", updatePotentialProfit);

// Dynamic table row addition for Trade History
const tradeHistoryTable = document.getElementById('tradeHistoryTable');
const dummyTrades = [
    { date: '2023-01-01', entry: 1000, exit: 1200, investment: 500, profit: 100 },
    { date: '2023-02-15', entry: 1100, exit: 1150, investment: 400, profit: 20 },
];

// Handle Edit and Delete actions
document.getElementById("tradeHistoryTable").addEventListener("click", function (event) {
    const target = event.target;

    if (target.classList.contains("edit-button")) {
        // Edit functionality
        const row = target.closest("tr");
        const cells = row.querySelectorAll("td");

        // Populate the form with the existing trade data
        document.getElementById("tradeDate").value = cells[0].textContent;
        document.getElementById("entryPrice").value = parseFloat(cells[1].textContent.replace(/[^0-9.-]+/g, ""));
        document.getElementById("exitPrice").value = parseFloat(cells[2].textContent.replace(/[^0-9.-]+/g, ""));
        document.getElementById("investmentAmount").value = parseFloat(cells[3].textContent.replace(/[^0-9.-]+/g, ""));
        document.getElementById("leverage").value = cells[5].textContent.trim();
        document.getElementById("tradeType").value = cells[6].textContent.toLowerCase();
        document.getElementById("notes").value = cells[7].textContent;

        // Remove the row being edited
        row.remove();
    } else if (target.classList.contains("delete-button")) {
        // Delete functionality
        const row = target.closest("tr");
        row.remove(); // Simply remove the row from the table
    }
});


// Interactive settings functionality (example toggle)
const settingsSection = document.getElementById('settings');
const settingsToggle = document.createElement('button');
settingsToggle.textContent = 'Toggle Dark Mode';
settingsToggle.style.padding = '10px';
settingsToggle.style.backgroundColor = '#1e90ff';
settingsToggle.style.color = '#ffffff';
settingsToggle.style.border = 'none';
settingsToggle.style.borderRadius = '5px';
settingsToggle.style.cursor = 'pointer';

settingsToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

settingsSection.appendChild(settingsToggle);

// Analytics functionality
const analyticsCtx = document.getElementById('analyticsChart').getContext('2d');
const analyticsChart = new Chart(analyticsCtx, {
    type: 'bar',
    data: {
        labels: ['Long Trades', 'Short Trades'],
        datasets: [{
            label: 'Trade Distribution',
            data: [10, 5], // Replace with dynamic values
            backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)'],
            borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            }
        }
    }
});
// Open and close profile modal
const profileModal = document.getElementById('profileModal');
document.querySelector('.user-info').addEventListener('click', () => {
    profileModal.style.display = 'block';
});
document.querySelector('#profileModal .close').addEventListener('click', () => {
    profileModal.style.display = 'none';
});

// Save profile settings
document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const bio = document.getElementById('bio').value;
    const location = document.getElementById('location').value;
    const language = document.getElementById('language').value;
    const username = document.getElementById('changeUsername').value;
    const theme = document.getElementById('theme').value;

    // Example handling of updates (adjust logic as needed)
    if (username) {
        document.querySelector('.user-info p').textContent = `Welcome, ${username}`;
    }

    alert(`Profile updated:\nName: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nBio: ${bio}\nLocation: ${location}\nLanguage: ${language}\nTheme: ${theme}`);
    profileModal.style.display = 'none';
});

function updateOverview() {
    const tradeRows = document.querySelectorAll("#tradeHistoryTable tr");

    let totalProfit = 0;
    let totalInvestment = 0;
    let activeTrades = tradeRows.length;
    const profitData = [];
    const dateLabels = [];

    tradeRows.forEach(row => {
        const profitLoss = parseFloat(row.cells[4]?.textContent.replace(/[^0-9.-]+/g, "")) || 0;
        const investment = parseFloat(row.cells[3]?.textContent.replace(/[^0-9.-]+/g, "")) || 0;
        const tradeDate = row.cells[0]?.textContent;

        totalProfit += profitLoss;
        totalInvestment += investment;

        // Populate chart data
        profitData.push(profitLoss);
        dateLabels.push(tradeDate);
    });

    // Calculate average return
    const averageReturn = totalInvestment > 0 ? ((totalProfit / totalInvestment) * 100).toFixed(2) : 0;

    // Update the Overview section
    document.getElementById("totalProfit").textContent = formatCurrency(totalProfit);
    document.getElementById("averageReturn").textContent = `${averageReturn}%`;
    document.getElementById("activeTrades").textContent = activeTrades;

    // Update the chart
    updateProfitTrendChart(dateLabels, profitData);
}

let profitTrendChart = null; // Ensure a single instance of the chart

function updateProfitTrendChart(labels, data) {
    const ctx = document.getElementById("profitTrendChart").getContext("2d");

    if (profitTrendChart) {
        // Update existing chart data
        profitTrendChart.data.labels = labels;
        profitTrendChart.data.datasets[0].data = data;
        profitTrendChart.update();
    } else {
        // Initialize the chart if it doesn't exist
        profitTrendChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Profit Trend",
                    data: data,
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 2,
                    fill: true,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top",
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Trade Date",
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Profit ($)",
                        },
                    },
                },
            },
        });
    }
}


document.getElementById("tradeHistoryTable").addEventListener("click", function (event) {
    const target = event.target.closest("button"); // Define `target` properly

    if (!target) return; // Ensure a button was clicked

    if (target.classList.contains("edit-button")) {
        // Handle Edit
        const row = target.closest("tr");
        // ...edit logic here
    } else if (target.classList.contains("delete-button")) {
        // Handle Delete
        const row = target.closest("tr");
        if (row) {
            row.remove(); // Remove the row
            updateOverview(); // Update the overview
        }
    }
});

