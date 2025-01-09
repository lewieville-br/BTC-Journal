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

        // Initialize Chart.js for the profit trend chart
        const ctx = document.getElementById('profitTrendChart').getContext('2d');
        const profitTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Profit Trend',
                    data: [300, 600, 400, 800, 700, 900],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
            }
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
            `;
            tradeHistoryTable.appendChild(newRow);
    
            // Reset the form for new input
            tradeForm.reset();
            updatePotentialProfit(); // Reset the potential profit display
            alert("Trade added to history!");
        });
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
      
