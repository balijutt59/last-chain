async function handleWalletClick() {
    if (user.wallet_address) {
        if (confirm("Disconnect Node?")) {
            const { error } = await _supabase.from('profiles').update({ wallet_address: null }).eq('id', user.id);
            if (!error) { user.wallet_address = null; updateUI(); }
        }
        return;
    }

    if (window.ethereum) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const address = accounts[0];
            
            const b = document.getElementById('btn-wallet');
            b.innerText = "CONFIRMING...";
            b.style.background = "#fff";

            const signer = provider.getSigner();
            const message = `LAST CHAIN AUTH\n\nVerify Node: ${address}\nAction: Sync System`;
            const signature = await signer.signMessage(message);

            if (signature) {
                const { error } = await _supabase.from('profiles').update({ wallet_address: address }).eq('id', user.id);
                if (!error) { 
                    user.wallet_address = address; 
                    updateUI(); 
                    alert("Node Verified Successfully!"); 
                }
            }
        } catch (err) { alert("Action failed."); updateUI(); }
    } else { alert("Please install MetaMask."); }
}
