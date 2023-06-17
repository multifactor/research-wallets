# Research Wallets
Reference implementations for custodial, self-custody, and MFKDF-based Ethereum wallets (using the [Sepolia](https://sepolia.dev/) testnet).

- **Wallet A (Custodial Wallet)**: Wallet A is a centralized, custodial cryptocurrency wallet that requires a trusted server and custodian.
  - Source code at [/custodial-wallet](https://github.com/multifactor/research-wallets/tree/main/custodial-wallet).
  - Try it out at [https://wallet-a.pages.dev/](https://wallet-a.pages.dev/).
- **Wallet B (Self-Custody Wallet)**: Wallet B is a decentralized, self-custody cryptocurrency wallet based on manual key management.
  - Source code at [/self-custody-wallet](https://github.com/multifactor/research-wallets/tree/main/self-custody-wallet).
  - Try it out at [https://wallet-b.pages.dev/](https://wallet-b.pages.dev/).
- **Wallet C (MFKDF-Based Wallet)**: Wallet C is a decentralized, self-custody cryptocurrency wallet based on multi-factor key derivation (MFKDF) technology.
  - Source code at [/mfkdf-wallet](https://github.com/multifactor/research-wallets/tree/main/mfkdf-wallet).
  - Try it out at [https://wallet-c.pages.dev/](https://wallet-c.pages.dev/).

**Warning**: These implementations exist for demonstration purposes only. They are intended for use in cryptocurrency research, particularly in the usable security domain. They have not been tested/audited for bugs or security vulnerabilities and are not intended to be used as production-ready applications. Do not use real credentials or store anything of value using these wallets.

## Deployment Instructions
The three wallets are implemented with a [Cloudflare Workers](https://workers.cloudflare.com/) backend with [Workers KV](https://www.cloudflare.com/en-gb/products/workers-kv/), and a [React](https://react.dev/) frontend using [create-react-app](https://create-react-app.dev/).

Use Node.js v16 or later and NPM v8 or later. To build and test locally, install required dependencies using `npm install`, then build using `npm build`. To deploy for free, we suggest using [Cloudflare Pages](https://pages.cloudflare.com/) with the React template. Cloudflare Pages will automatically build and deploy the backend workers and the React frontend. Make sure to attach a KV namespace to the `DB` environment variable.
