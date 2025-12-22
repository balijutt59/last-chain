const S_URL = "https://pkqpcxqwhzuuooovqkvc.supabase.co";
const S_KEY = "sb_publishable_4nApSgj0pwrInFkUYx14_A_sM2AixLY";
const _supabase = supabase.createClient(S_URL, S_KEY);
let user = null;

async function login() { 
    await _supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
            // Hum direct file path use karenge
            redirectTo: 'https://balijutt59.github.io/last-chain/index.html'
        }
    }); 
}

async function logout() { 
    await _supabase.auth.signOut(); 
    window.location.href = 'https://balijutt59.github.io/last-chain/index.html'; 
}

async function init() {
    // URL se access token check karein (agar login se wapas aaye hain)
    const { data: { session }, error } = await _supabase.auth.getSession();
    
    if (session) {
        const params = new URLSearchParams(window.location.search);
        await fetchUser(session.user.id, params.get('ref'));
        
        // Dashboard components load karein
        if (window.fetchHistory) fetchHistory();
        if (window.fetchLeaderboard) fetchLeaderboard();
        
        setInterval(() => {
            if (window.updateCountdown) updateCountdown();
        }, 1000);
    } else {
        // Agar session nahi hai to login dikhayein
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
    }
}

async function fetchUser(id, rid) {
    let { data: p } = await _supabase.from('profiles').select('*').eq('id', id).single();
    if (!p) {
        const { data } = await _supabase.from('profiles').insert([{ id, balance: 0, referred_by: rid }]).select().single();
        p = data;
    }
    user = p;
    if (window.updateUI) updateUI();
    if (window.fetchRefCount) fetchRefCount();
}

window.onload = init;
