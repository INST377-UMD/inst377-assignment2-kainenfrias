document.addEventListener('DOMContentLoaded', function () {
    const apiKey = 'fSIOczbF_9undbou4fD1M_Y13Fy5cSEw';
    const ctx = document.getElementById('stock-chart').getContext('2d');
  
    let stockChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Stock Price',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          fill: false
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: 'Date' } },
          y: { title: { display: true, text: 'Price ($)' } }
        }
      }
    });
  
    document.getElementById('fetch-stock').addEventListener('click', async function () {
      const ticker = document.getElementById('stock-ticker').value.trim().toUpperCase();
      const days = document.getElementById('time-range').value;
      const fetchButton = document.getElementById('fetch-stock');
  
      if (!ticker) {
        showError('Please enter a stock ticker');
        return;
      }
  
      try {
        fetchButton.disabled = true;
        fetchButton.textContent = 'Loading...';
  
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        const toDate = new Date();
  
        const formattedFrom = formatDate(fromDate);
        const formattedTo = formatDate(toDate);
  
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${formattedFrom}/${formattedTo}?apiKey=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
  
        const data = await response.json();
        if (!data.results || data.results.length === 0) throw new Error('No data found for this ticker');
  
        const dates = data.results.map(item => new Date(item.t).toLocaleDateString());
        const prices = data.results.map(item => item.c);
  
        stockChart.data.labels = dates;
        stockChart.data.datasets[0].data = prices;
        stockChart.data.datasets[0].label = `${ticker} Stock Price`;
        stockChart.update();
  
        clearError();
      } catch (err) {
        console.error('Error:', err);
        showError(err.message);
        stockChart.data.labels = [];
        stockChart.data.datasets[0].data = [];
        stockChart.update();
      } finally {
        fetchButton.disabled = false;
        fetchButton.textContent = 'Get Stock Data';
      }
    });
  
    function formatDate(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  
    function showError(msg) {
      clearError();
      const div = document.createElement('div');
      div.className = 'error-message';
      div.textContent = msg;
      document.querySelector('.stock-controls').appendChild(div);
    }
  
    function clearError() {
      const existing = document.querySelector('.error-message');
      if (existing) existing.remove();
    }
  
    // ✅ Top 5 Reddit Stocks from Tradestie
    async function fetchTopRedditStocks() {
      try {
        const response = await fetch('https://tradestie.com/api/v1/apps/reddit?date=2022-04-03');
        if (!response.ok) throw new Error(`API failed with status ${response.status}`);
  
        const data = await response.json();
  
        const top5 = data
          .filter(stock => stock.ticker && stock.no_of_comments && stock.sentiment)
          .sort((a, b) => b.no_of_comments - a.no_of_comments)
          .slice(0, 5);
  
        const tbody = document.querySelector('#reddit-stocks tbody');
        tbody.innerHTML = '';
  
        top5.forEach(stock => {
          const row = document.createElement('tr');
  
          // Ticker with Yahoo link
          const tickerCell = document.createElement('td');
          const link = document.createElement('a');
          link.href = `https://finance.yahoo.com/quote/${stock.ticker}`;
          link.textContent = stock.ticker;
          link.target = '_blank';
          tickerCell.appendChild(link);
          row.appendChild(tickerCell);
  
          // Comment count
          const commentCell = document.createElement('td');
          commentCell.textContent = stock.no_of_comments;
          row.appendChild(commentCell);
  
          // Sentiment with icon
          const sentimentCell = document.createElement('td');
          const icon = document.createElement('span');
          icon.className = 'sentiment-icon';
  
          const sentiment = stock.sentiment.toLowerCase();
          if (sentiment.includes('bull')) {
            icon.textContent = '🐂';
            icon.title = 'Bullish';
          } else if (sentiment.includes('bear')) {
            icon.textContent = '🐻';
            icon.title = 'Bearish';
          } else {
            icon.textContent = '❓';
            icon.title = 'Unknown';
          }
  
          sentimentCell.appendChild(icon);
          sentimentCell.append(` ${stock.sentiment}`);
          row.appendChild(sentimentCell);
  
          tbody.appendChild(row);
        });
      } catch (err) {
        console.error('Failed to load Reddit stocks:', err);
        const tbody = document.querySelector('#reddit-stocks tbody');
        tbody.innerHTML = '<tr><td colspan="3">Failed to load data.</td></tr>';
      }
    }
  
    // Trigger on load
    fetchTopRedditStocks();
  });
  