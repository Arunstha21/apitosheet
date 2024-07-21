// script.js

document.addEventListener('DOMContentLoaded', () => {
  const logData = document.getElementById('logData');
  const start = document.getElementById('start');
  const stop = document.getElementById('stop');
  let intervalId = null;

  start.addEventListener('click', async () => {
    const ssid = document.getElementById('ssid').value.trim();
    const url = document.getElementById('url').value.trim();
    const range = document.getElementById('range').value.trim();
    let data = { ssid, url, range };
    if(ssid === '' || url === '' || range === '') {
      data = null;
    }

    if (intervalId === null) {
      intervalId = setInterval(async () => {
        try {
          const result = await gsheet.gsapi(data);
          if (typeof result === 'string' && result.startsWith('Error')) {
            stopGsApi();
            logData.innerHTML = result;
          } else {
            logData.innerHTML = result.replace(/\n/g, '<br>');
          }
        } catch (error) {
          stopGsApi();
          logData.textContent = `Error: ${error.message}`;
        }
      }, 6000);
    }
  });

  stop.addEventListener('click', () => {
    stopGsApi();
  });

  function stopGsApi() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
      logData.textContent = "Stopped";
    }
  }
});
