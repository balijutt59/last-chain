// --- DASHBOARD UI UPDATES ---
function updateUI() {
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('header-pts').innerText = user.balance;
    document.getElementById('s-val').innerText = (user.streak || 0) + "d";
    document.getElementById('p-txt').innerText = `${user.balance}/5000`;
    document.getElementById('bar').style.width = Math.min((user.balance/5000)*100, 100) + "%";
    
    const b = document.getElementById('btn-wallet');
    if (user.wallet_address) {
        b.innerText = user.wallet_address.substring(0,4)+"..."+user.wallet_address.slice(-4);
        b.style.background = "var(--neon-alt)"; b.style.color = "#fff";
        checkClaimStatus(); // Function from tasks.js
    } else {
        b.innerText = "CONNECT"; b.style.background = "var(--neon-main)"; b.style.color = "#000";
    }
}

// --- HISTORY LOG ---
async function fetchHistory() {
    const { data } = await _supabase.from('task_history').select('*').eq('user_id', user.id).order('completed_at', { ascending: false });
    let tPts = 0; const today = new Date().toDateString();
    document.getElementById('history-list').innerHTML = data?.map(h => {
        const d = new Date(h.completed_at); if (d.toDateString() === today) tPts += h.points;
        return `<div style="display:flex; justify-content:space-between; padding:15px 0; border-bottom:1px solid rgba(255,255,255,0.02); font-size:11px; font-family:'Space Mono';">
            <span><b>${h.task_name}</b><br><small style="color:#444">${d.toLocaleDateString()}</small></span>
            <span style="color:var(--neon-main);">+${h.points}</span>
        </div>`;
    }).join('') || 'No records.';
    document.getElementById('t-pts').innerText = tPts;
}

// --- LEADERBOARD LOGIC ---
async function fetchLeaderboard() {
    const { data } = await _supabase.from('profiles').select('id, balance').order('balance', { ascending: false }).limit(5);
    document.getElementById('leaderboard').innerHTML = data.map(u => `<div class="lb-item" style="${u.id===user.id?'border:1px solid var(--neon-main)':''}"><span>NODE_${u.id.slice(-5)}</span><b>${u.balance}</b></div>`).join('');
    const { count } = await _supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('balance', user.balance);
    document.getElementById('my-rank').innerText = `#${(count || 0) + 1}`;
}
