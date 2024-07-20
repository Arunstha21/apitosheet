
document.addEventListener('DOMContentLoaded', () => {
  const logData = document.getElementById('logData');
  const start = document.getElementById('start');
  const stop = document.getElementById('stop');

  start.addEventListener('click', async () => {
    const ssid = document.getElementById('ssid').value.trim();
    const url = document.getElementById('url').value.trim();
    const range = document.getElementById('range').value.trim();
    let data = { ssid, url, range };

    if (!ssid || !url || !range) {
      data = null
    }
    try {
      const response = await gsheet.rungsapi(data);
      logData.innerHTML = response.replace(/\n/g, '<br>');
    } catch (error) {
      logData.textContent = error.message;
    }
  });

  stop.addEventListener('click', () => {
    logData.textContent = "Stopped";
    console.log("stopped");
    gsheet.stopgsapi();
  });
});
