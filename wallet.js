/* WALLET MANAGEMENT PROTOCOL v2.0
   Features: Auto-connect, Signature Verification, Disconnect Logic
*/

async function handleWalletClick() {
    const walletBtn = document.getElementById('btn-wallet');

    // --- DISCONNECT LOGIC ---
    if (user.wallet_address) {
        if (confirm("DISCONNECT PROTOCOL: Are you sure you want to decouple this node?")) {
            try {
                const { error } = await _supabase
                    .from('profiles')
                    .update({ wallet_address: null })
                    .eq('id', user.id);

                if (!error) {
                    user.wallet_address = null;
                    alert("NODE DECOUPLED SUCCESSFULLY");
                    updateUI();
                }
            } catch (err) {
                console.error("Disconnect failed:", err);
            }
        }
        return;
    }

    // --- CONNECT LOGIC ---
    if (typeof window.ethereum !== 'undefined') {
        try {
            // 1. Auto-open MetaMask for Account Connection
            walletBtn.innerText = "OPENING WALLET...";
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Ye line wallet ko khud ba khud popup karwati hai
            const accounts = await provider.send("eth_requestAccounts", []);
            const address = accounts[0];

            // 2. Request Signature for Verification (Sign-in Option)
            walletBtn.innerText = "VERIFYING...";
            walletBtn.style.background = "#fff";
            walletBtn.style.color = "#000";

            const signer = provider.getSigner();
            const message = `LAST CHAIN SECURITY PROTOCOL\n\nAction: Connect Node\nNode ID: ${user.id}\nWallet: ${address}\n\nClick sign to authenticate.`;
            
            // Ye user ko signature (Confirm Sign in) ka option dikhayega
            const signature = await signer.signMessage(message);

            if (signature) {
                // 3. Update Database after successful signature
                const { error } = await _supabase
                    .from('profiles')
                    .update({ wallet_address: address })
                    .eq('id', user.id);

                if (!error) {
                    user.wallet_address = address;
                    updateUI(); // Dashboard par address show ho jayega
                    alert("NODE AUTHENTICATED: Connection Stable.");
                } else {
                    throw error;
                }
            }
        } catch (err) {
            console.error("Auth failed:", err);
            alert("PROTOCOL REJECTED: Connection failed or user cancelled.");
            updateUI(); // Reset button to CONNECT
        }
    } else {
        alert("E-WALLET NOT FOUND: Please install MetaMask extension.");
    }
}

// UI ko update karne wala function jo button ka text change karta hai
function updateWalletButtonUI() {
    const b = document.getElementById('btn-wallet');
    if (!b) return;

    if (user && user.wallet_address) {
        // Agar connect hai to address dikhaye (Short format: 0x12...abcd)
        const addr = user.wallet_address;
        b.innerText = addr.substring(0, 4) + "..." + addr.slice(-4);
        b.style.background = "var(--neon-alt)"; // Pinkish Glow
        b.style.color = "#fff";
    } else {
        // Agar connect nahi hai to default button
        b.innerText = "CONNECT";
        b.style.background = "var(--neon-main)"; // Neon Green
        b.style.color = "#000";
    }
}

// Purane updateUI function ke andar is naye function ko call karein
// (Aapke existing updateUI function mein iska logic hona chahiye)
