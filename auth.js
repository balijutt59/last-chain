const S_URL = "https://pkqpcxqwhzuuooovqkvc.supabase.co";
const S_KEY = "sb_publishable_4nApSgj0pwrInFkUYx14_A_sM2AixLY";
const _supabase = supabase.createClient(S_URL, S_KEY);
let user = null;

async function login() { await _supabase.auth.signInWithOAuth({ provider: 'google' }); }

async function logout() { await _supabase.auth.signOut(); window.location.reload(); }

async function init() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        const params = new URLSearchParams(window.location.search);
        await fetchUser(session.user.id, params.get('ref'));
        fetchHistory(); 
        fetchLeaderboard();
        setInterval(updateCountdown, 1000);
    }
}

async function fetchUser(id, rid) {
    let { data: p } = await _supabase.from('profiles').select('*').eq('id', id).single();
    if (!p) {
        const { data } = await _supabase.from('profiles').insert([{ id, balance: 0, referred_by: rid }]).select().single();
        p = data; if (rid && rid !== id) await rewardReferrer(rid);
    }
    user = p; updateUI(); fetchRefCount();
}

window.onload = init;
