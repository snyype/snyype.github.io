async function fetchLaunchOptions() {
  try {
    const res = await fetch('/updateables');
    const text = await res.text();
    const options = {};
    let game = null;
    for (const line of text.split('\n')) {
      const l = line.trim();
      if (l.startsWith('[')) {
        game = l.slice(1, -1);
      } else if (l.startsWith('launch_option') && game) {
        options[game] = l.split('=').slice(1).join('=').trim();
      }
    }
    return options;
  } catch {
    return {};
  }
}

async function copyLaunchOption(game) {
  const options = await fetchLaunchOptions();
  const opt = options[game];
  if (!opt) {
    Swal.fire({
      icon: 'warning',
      title: 'Not found',
      text: 'No launch option found for this game.',
      background: '#0e1420',
      color: '#dde5f0',
      confirmButtonColor: '#e8a020',
    });
    return;
  }
  try {
    await navigator.clipboard.writeText(opt);
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: 'Launch option copied to clipboard.',
      background: '#0e1420',
      color: '#dde5f0',
      confirmButtonColor: '#e8a020',
      timer: 2000,
      showConfirmButton: false,
    });
  } catch {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to copy to clipboard.',
      background: '#0e1420',
      color: '#dde5f0',
      confirmButtonColor: '#e8a020',
    });
  }
}

async function downloadConfig(game) {
  const gameMap = {
    csgo: { path: 'csgo/autoexec.cfg', filename: 'autoexec.cfg' },
    dota2: { path: 'dota/autoexec.cfg', filename: 'dota2_autoexec.cfg' },
  };
  const config = gameMap[game];
  if (!config) return;

  try {
    const apiUrl = `https://api.github.com/repos/snyype/snyype.github.io/contents/${config.path}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    const content = atob(data.content);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = config.filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    Swal.fire({
      icon: 'error',
      title: 'Download failed',
      text: 'Could not fetch the config file.',
      background: '#0e1420',
      color: '#dde5f0',
      confirmButtonColor: '#e8a020',
    });
  }
}

// Populate launch code displays on page load
document.addEventListener('DOMContentLoaded', async () => {
  const options = await fetchLaunchOptions();
  const csgoEl = document.getElementById('csgo-launch');
  const dotaEl = document.getElementById('dota-launch');
  if (csgoEl) csgoEl.textContent = options['csgo'] || 'Could not load launch options.';
  if (dotaEl) dotaEl.textContent = options['dota2'] || 'Could not load launch options.';
});
