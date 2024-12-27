// Function to format numbers as currency
function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
}

// Update potential profit on user input
function updatePotentialProfit() {
    const entryPrice = parseFloat(document.getElementById("entryPrice").value) || 0;
    const exitPrice = parseFloat(document.getElementById("exitPrice").value) || 0;
    const investment = parseFloat(document.getElementById("investmentAmount").value) || 0;
    const leverage = parseFloat(document.getElementById("leverage").value) || 1;
    const tradeType = document.getElementById("tradeType").value;

    let profit = 0;

    if (tradeType === "long") {
        profit = ((exitPrice - entryPrice) * investment * leverage) / entryPrice;
    } else if (tradeType === "short") {
        profit = ((entryPrice - exitPrice) * investment * leverage) / entryPrice;
    }

    const potentialProfitDisplay = document.getElementById("potentialProfit");
    potentialProfitDisplay.textContent = `Potential Profit: ${formatCurrency(profit)}`;
}

// Attach event listeners for inputs that affect potential profit
document.getElementById("entryPrice").addEventListener("input", updatePotentialProfit);
document.getElementById("exitPrice").addEventListener("input", updatePotentialProfit);
document.getElementById("investmentAmount").addEventListener("input", updatePotentialProfit);
document.getElementById("leverage").addEventListener("input", updatePotentialProfit);
document.getElementById("tradeType").addEventListener("change", updatePotentialProfit);

// Existing trade form submission logic
document.getElementById("tradeForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const tradeDate = document.getElementById("tradeDate").value;
    const entryPrice = parseFloat(document.getElementById("entryPrice").value);
    const exitPrice = parseFloat(document.getElementById("exitPrice").value) || 0;
    const investment = parseFloat(document.getElementById("investmentAmount").value);
    const leverage = parseFloat(document.getElementById("leverage").value);
    const tradeType = document.getElementById("tradeType").value;
    const notes = document.getElementById("notes").value;

    const profitLoss =
        tradeType === "long"
            ? ((exitPrice - entryPrice) * investment * leverage) / entryPrice
            : ((entryPrice - exitPrice) * investment * leverage) / entryPrice;

    const tradeRow = document.createElement("tr");
    tradeRow.innerHTML = `
        <td>${tradeDate}</td>
        <td>${formatCurrency(entryPrice)}</td>
        <td>${formatCurrency(exitPrice)}</td>
        <td>${formatCurrency(investment)}</td>
        <td>${leverage}</td>
        <td>${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)}</td>
        <td>${formatCurrency(profitLoss)}</td>
        <td>${notes || "N/A"}</td>
    `;

    document.querySelector("#tradeTable tbody").appendChild(tradeRow);

    document.getElementById("tradeForm").reset();
    updatePotentialProfit(); // Reset potential profit display
});

// Function to fetch and display the current Bitcoin price with percentage change
async function fetchAndDisplayBTCPrice() {
    try {
        const response = await fetch("https://api.coindesk.com/v1/bpi/currentprice/BTC.json");
        const data = await response.json();
        const currentPrice = parseFloat(data.bpi.USD.rate.replace(/,/g, ''));

        // Fetch historical price for the previous day
        const historicalResponse = await fetch("https://api.coindesk.com/v1/bpi/historical/close.json?for=yesterday");
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
            priceElement.style.padding = "15px";
            priceElement.style.margin = "20px auto";
            priceElement.style.color = "#fff";
            priceElement.style.fontSize = "1.5rem";
            priceElement.style.textAlign = "center";
            priceElement.style.borderRadius = "12px";
            priceElement.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
            priceElement.style.maxWidth = "500px";
            priceElement.style.fontFamily = "Arial, sans-serif";
            priceElement.style.fontWeight = "bold";
            priceElement.textContent = displayText;

            document.body.insertBefore(priceElement, document.body.firstChild);
        }
    } catch (error) {
        console.error("Error fetching Bitcoin price:", error);
    }
}

// Initial fetch and interval setup
fetchAndDisplayBTCPrice();
setInterval(() => {
    fetchAndDisplayBTCPrice();
}, 500);

// Function to download trade history as an XLSX file
function downloadTradeHistory() {
    const rows = document.querySelectorAll("#tradeTable tbody tr");
    const tradeData = [
        ["Date", "Entry Price", "Exit Price", "Investment", "Leverage", "Trade Type", "Profit/Loss", "Notes"]
    ];

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const rowData = Array.from(cells).map((cell, index) => {
            // Remove currency formatting for numeric fields (columns 1–6)
            if ([1, 2, 3, 6].includes(index)) {
                return parseFloat(cell.textContent.replace(/[^0-9.-]+/g, "")) || 0; // Convert to raw number
            }
            return cell.textContent.trim(); // Keep other data as-is
        });
        tradeData.push(rowData);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(tradeData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trades");
    XLSX.writeFile(workbook, "Trade_History.xlsx");
}


// Add a download button to the page
const downloadButton = document.createElement("button");
downloadButton.textContent = "Download Trade History";
downloadButton.style.margin = "20px auto";
downloadButton.style.display = "block";
downloadButton.style.padding = "10px 15px";
downloadButton.style.backgroundColor = "#4CAF50";
downloadButton.style.color = "#fff";
downloadButton.style.border = "none";
downloadButton.style.borderRadius = "5px";
downloadButton.style.cursor = "pointer";
downloadButton.addEventListener("click", downloadTradeHistory);
document.body.appendChild(downloadButton);

// Function to upload an XLSX file and update trade journal
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const tradeData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const tbody = document.querySelector("#tradeTable tbody");
        tradeData.slice(1).forEach(row => {
            // Ensure row has all required columns
            if (row.length >= 8) {
                const [
                    tradeDate, 
                    entryPrice, 
                    exitPrice, 
                    investment, 
                    leverage, 
                    tradeType, 
                    profitLoss, 
                    notes
                ] = row;

                const tradeRow = document.createElement("tr");
                tradeRow.innerHTML = `
                    <td>${tradeDate || "N/A"}</td>
                    <td>${formatCurrency(parseFloat(entryPrice)) || "N/A"}</td>
                    <td>${formatCurrency(parseFloat(exitPrice)) || "N/A"}</td>
                    <td>${formatCurrency(parseFloat(investment)) || "N/A"}</td>
                    <td>${leverage || "1"}</td>
                    <td>${tradeType || "N/A"}</td>
                    <td>${formatCurrency(parseFloat(profitLoss)) || "N/A"}</td>
                    <td>${notes || "N/A"}</td>
                `;
                tbody.appendChild(tradeRow);
            }
        });
    };
    reader.readAsArrayBuffer(file);
}





// Add an upload input to the page
const uploadWrapper = document.createElement("div");
uploadWrapper.style.margin = "20px auto";
uploadWrapper.style.textAlign = "center";
uploadWrapper.style.padding = "15px";
uploadWrapper.style.backgroundColor = "#f4f4f4";
uploadWrapper.style.borderRadius = "5px";
uploadWrapper.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
uploadWrapper.style.maxWidth = "500px";

const uploadLabel = document.createElement("label");
uploadLabel.textContent = "Upload Trade History (XLSX):";
uploadLabel.style.display = "block";
uploadLabel.style.marginBottom = "10px";
uploadLabel.style.fontFamily = "Arial, sans-serif";
uploadLabel.style.fontSize = "1rem";
uploadLabel.style.color = "#222";

const uploadInput = document.createElement("input");
uploadInput.type = "file";
uploadInput.accept = ".xlsx";
uploadInput.style.padding = "10px 15px";
uploadInput.style.border = "2px solid #ddd";
uploadInput.style.borderRadius = "5px";
uploadInput.style.cursor = "pointer";
uploadInput.style.backgroundColor = "#f4f4f4";
uploadInput.style.display = "block";
uploadInput.style.margin = "auto";
uploadInput.addEventListener("change", handleFileUpload);

uploadWrapper.appendChild(uploadLabel);
uploadWrapper.appendChild(uploadInput);
document.body.appendChild(uploadWrapper);
