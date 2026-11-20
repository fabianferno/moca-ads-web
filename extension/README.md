# MOCA Ads Chrome extension

The browser side of MOCA Ads. It signs users in with Moca AIR Kit, runs credential verification through the AIR credential widget, and injects credential-targeted ad banners into the pages you visit. Verification results are written to the `moca_ads_verifications` cookie, which the web app reads (see [`../docs/chrome-extension-integration.md`](../docs/chrome-extension-integration.md)).

Built with [Extension.js](https://extension.js.org), React 18, Tailwind CSS 4, wagmi and the Moca AIR SDKs.

## Layout

- `manifest.json`: MV3 manifest (permissions, content script, CSP)
- `background.ts`: cookie monitoring
- `content/`: the injected React app (login, credentials form, verification, ad banner)
- `content/utils/constants.ts`: partner ID, verifier DID, chain and contract config

## Setup

```bash
cd extension
npm install
echo "EXTENSION_PUBLIC_MOCA_VERIFIER_API_KEY=your-verifier-api-key" > .env
npm run dev     # opens a browser with the extension loaded
npm run build   # production build in dist/
```

The verifier API key comes from the Moca AIR developer dashboard. Don't commit it.
