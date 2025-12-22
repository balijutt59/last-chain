// --- CONFIGURATION ---
const S_URL = "https://pkqpcxqwhzuuooovqkvc.supabase.co";
const S_KEY = "sb_publishable_4nApSgj0pwrInFkUYx14_A_sM2AixLY";
const _supabase = supabase.createClient(S_URL, S_KEY);
let user = null;

// --- LOGIN FUNCTION WITH REDIRECT FIX ---
async function login() { 
    await _supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
            // Ye line sab se zaroori hai taake 404 error na aaye
            redirectTo: 'https://balijutt59.github.io/last-chain/index.html/' 
        }
    }); 
}

// --- LOGOUT ---
async function logout() { 
    await _supabase.auth.signOut(); 
    window.location.href = 'https://balijutt59.github.io/last-chain/index.html'; 
}

// --- INITIALIZATION ---
async function init() {
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (session) {
        const params = new URLSearchParams(window.location.search);
        // User data fetch karein aur referral check karein
        await fetchUser(session.user.id, params.get('ref'));
        
        // Baki files ke functions call karein (Dashboard & Tasks)
        if (typeof fetchHistory === "function") fetchHistory();
        if (typeof fetchLeaderboard === "function") fetchLeaderboard();
        
        // Timer shuru karein
        setInterval(() => {
            if (typeof updateCountdown === "function") updateCountdown();
        }, 1000);
    } else {
        // Agar session nahi hai to login screen dikhayein
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
    }
}

// --- FETCH OR CREATE USER PROFILE ---
async function fetchUser(id, rid) {
    let { data: p, error } = await _supabase.from('profiles').select('*').eq('id', id).single();
    
    if (!p) {
        // Naya user banayein agar database mein nahi hai
        const { data: newUser } = await _supabase.from('profiles').insert([
            { id, balance: 0, referred_by: rid }
        ]).select().single();
        p = newUser;
    }
    
    user = p;
    
    // UI update karein (dashboard.js mein mojood function)
    if (typeof updateUI === "function") updateUI();
    // Referral count update karein (tasks.js mein mojood function)
    if (typeof fetchRefCount === "function") fetchRefCount();
}

// Window load hote hi system shuru karein
window.onload = init;
