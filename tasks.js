// --- DAILY CHECK-IN LOGIC ---
async function claimDaily() {
    if (!user.wallet_address) { alert("Connect wallet first!"); return; }
    
    const { error } = await _supabase.from('profiles').update({ 
        balance: user.balance + 100, 
        streak: (user.streak || 0) + 1, 
        last_checkin: new Date().toISOString() 
    }).eq('id', user.id);
    
    if(!error) {
        await _supabase.from('task_history').insert([{ user_id: user.id, task_name: 'Daily Sync', points: 100 }]);
        fetchUser(user.id); // Refresh user data
        fetchHistory();     // Refresh history list
    }
}

// --- TIMER & STATUS ---
function updateCountdown() {
    const timerLabel = document.getElementById('claim-timer');
    const btn = document.getElementById('c-btn');
    if (!user) return;

    if (!user.wallet_address) {
        timerLabel.innerText = "CONNECT WALLET TO START";
        return;
    }

    if (!user.last_checkin) {
        timerLabel.innerText = "SYSTEM READY"; btn.disabled = false;
        return;
    }

    const gap = (new Date(user.last_checkin).getTime() + 86400000) - Date.now();
    if (gap > 0) {
        const h = Math.floor(gap/3600000), m = Math.floor((gap%3600000)/60000), s = Math.floor((gap%60000)/1000);
        timerLabel.innerText = `NEXT SYNC: ${h}h ${m}m ${s}s`;
        btn.disabled = true; btn.innerText = "LOCKED";
    } else { 
        timerLabel.innerText = "SYSTEM READY"; btn.disabled = false; btn.innerText = "CLAIM";
    }
}

function checkClaimStatus() {
    const btn = document.getElementById('c-btn');
    if (!user.wallet_address) { btn.disabled = true; return; }
    if (!user.last_checkin) { btn.disabled = false; return; }
    const diff = Date.now() - new Date(user.last_checkin).getTime();
    btn.disabled = diff < 86400000;
}

// --- REFERRAL SYSTEM ---
async function fetchRefCount() {
    const { count } = await _supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('referred_by', user.id);
    document.getElementById('ref-count').innerText = `${count || 0} NODES`;
}

function copyRefLink() {
    const link = `${window.location.origin}${window.location.pathname}?ref=${user.id}`;
    navigator.clipboard.writeText(link); 
    alert("Referral Protocol Copied!");
}
