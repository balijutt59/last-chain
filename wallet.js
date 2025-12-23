/* Supabase Configuration */
const S_URL = "https://pkqpcxqwhzuuooovqkvc.supabase.co";
const S_KEY = "sb_publishable_4nApSgj0pwrInFkUYx14_A_sM2AixLY";
const _supabase = supabase.createClient(S_URL, S_KEY);
let user = null;

/* 1. Wallet Click Handler */
async function handleWalletClick() {
    // A. Agar wallet pehle se connect hai -> Disconnect flow
    if (user && user.wallet_address) {
        if (confirm("Do you want to disconnect this wallet?")) {
            const { error } = await _supabase.from('profiles').update({ wallet_address: null }).eq('id', user.id);
            if (!error) {
                user.wallet_address = null;
                updateUI();
                alert("Wallet Disconnected Successfully.");
            }
        }
        return;
    }

    // B. Connect Flow
    if (window.ethereum) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // 1. MetaMask popup khud open hoga connect ke liye
            const accounts = await provider.send("eth_requestAccounts", []);
            const address = accounts[0];

            // UI feedback
            const b = document.getElementById('btn-wallet');
            b.innerText = "VERIFYING...";

            // 2. Thori dair baad Sign-in prompt (Signature Verification)
            setTimeout(async () => {
                try {
                    const signer = provider.getSigner();
                    const message = `LAST CHAIN AUTH\n\nVerify Node: ${address}\nAction: Sync System`;
                    
                    // User click karega confirm sign in par
                    const signature = await signer.signMessage(message);

                    if (signature) {
                        // 3. Database update aur Wallet Address UI par display
                        const { error } = await _supabase.from('profiles').update({ wallet_address: address }).eq('id', user.id);
                        if (!error) {
                            user.wallet_address = address;
                            updateUI();
                            alert("Node Verified Successfully!");
                        }
                    }
                } catch (signErr) {
                    alert("Signature Verification Failed.");
                    updateUI();
                }
            }, 800); // 0.8 sec delay for smooth experience

        } catch (connErr) {
            alert("Connection Request Denied.");
        }
    } else {
        alert("Please install MetaMask to continue.");
    }
}

/* 2. Authentication & Data Initialization */
async function login() { 
    await _supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: { redirectTo: window.location.origin + window.location.pathname }
    }); 
}

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
        p = data;
    }
    user = p; updateUI();
}

/* 3. UI Updater */
function updateUI() {
    if (!user) return;
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('header-pts').innerText = user.balance;
    
    // Wallet Button Update
    const b = document.getElementById('btn-wallet');
    if (user.wallet_address) {
        // Connected: Wallet Address dikhayega
        b.innerText = user.wallet_address.substring(0,5) + "..." + user.wallet_address.slice(-4);
        b.style.background = "var(--neon-alt)";
        b.style.color = "#fff";
    } else {
        // Disconnected: CONNECT dikhayega
        b.innerText = "CONNECT";
        b.style.background = "var(--neon-main)";
        b.style.color = "#000";
    }
}

/* UI Effects & Utilities (Particles etc remains same) */
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }
function switchTab(id, title) { 
    document.querySelectorAll('.tab-content').forEach(t=>t.classList.add('hidden')); 
    document.getElementById(id).classList.remove('hidden'); 
    document.getElementById('page-title').innerText=title; 
    toggleSidebar(); 
}
async function logout() { await _supabase.auth.signOut(); window.location.reload(); }
