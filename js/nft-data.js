/* ==========================================================================
   Chevrette Genesis — NFT data adapter
   ==========================================================================
   This file is the SINGLE SOURCE OF TRUTH for the NFT marketplace page.
   The UI (js/nft-marketplace.js) renders every dynamic section from this
   array — nothing about the NFTs themselves is hardcoded in nft.html.

   WHERE THIS DATA CAME FROM
   --------------------------------------------------------------------------
   - Collection stats (floor price, volume, owners, listed count, supply)
     and the token numbers + prices below were read directly from the live
     OpenSea collection page on Aug 29, 2026:
     https://opensea.io/collection/chevrette-genesis
   - These are the tokens that were actually listed for sale at the time of
     writing, at the real floor price of $1.00 each. Nothing here is invented.
   - OpenSea's public collection page does not expose the underlying
     contract address or per-token artwork/hrefs to an automated fetch
     (it's a JS-rendered app), so we could NOT verify an exact individual
     OpenSea item URL (https://opensea.io/item/matic/<contract>/<tokenId>)
     for any single token.

   IMPORTANT — HOW TO FINISH WIRING INDIVIDUAL LINKS
   --------------------------------------------------------------------------
   Per project rules we do not fabricate a "verified" individual URL out of
   a token number alone. Every entry below currently has:
       openseaUrl: COLLECTION_URL
   As a safe placeholder. To make each card open its *exact* NFT:
     1. Open https://opensea.io/collection/chevrette-genesis
     2. Click the specific token (e.g. "Chevrette Genesis #129")
     3. Copy the resulting URL from the address bar
     4. Paste it into that token's `openseaUrl` field below
   Once you do that for a token, its card, image, title and buttons will
   all open that exact page — no code changes needed anywhere else.

   You can also swap `image` for the real per-token artwork URL/IPFS link
   once you have it; until then we display the closest local Chevrette
   Genesis preview art we ship in /assets/nft-preview.
   ========================================================================== */

(function (global) {
  "use strict";

  var COLLECTION_URL = "https://opensea.io/collection/chevrette-genesis";

  // Real collection-level stats, scraped live from OpenSea on Aug 29, 2026.
  var COLLECTION_STATS = {
    name: "Chevrette Genesis",
    chain: "Polygon",
    supply: 200,
    floorPriceUsd: 1.00,
    volume24hUsd: 8.00,
    totalVolumeUsd: 28.00,
    listed: 183,
    listedPct: 91.5,
    owners: 12,
    ownersPct: 6,
    collectionUrl: COLLECTION_URL
  };

  // 24 local preview art files ship with the site (assets/nft-preview/preview-01..24.webp).
  // NOTE: this path must be root-absolute (leading "/"). This file is shared by both
  // /nft.html and /ru/nft.html — a relative "assets/..." path resolves fine from the
  // site root but breaks under /ru/ (it would look for /ru/assets/..., which doesn't
  // exist), which is exactly why images failed to load on the Russian version.
  //
  // CACHE-BUST NOTE: _headers serves /assets/* with "Cache-Control: public,
  // max-age=31536000, immutable" (1 year, never revalidate). Any device that already
  // loaded these exact URLs before this redesign will keep showing the OLD cached
  // image bytes forever, no matter how many times the site gets redeployed. Bumping
  // this query string forces every browser to treat it as a brand-new URL and fetch
  // the real file. Bump it again any time the preview art itself changes.
  var ART_CACHE_BUST = "20260830";
  var LOCAL_ART_COUNT = 24;
  function localArt(index) {
    var n = (index % LOCAL_ART_COUNT) + 1;
    var padded = n < 10 ? "0" + n : "" + n;
    return "/assets/nft-preview/preview-" + padded + ".webp?v=" + ART_CACHE_BUST;
  }

  // Real token numbers + real prices, exactly as listed live on OpenSea (floor = $1.00).
  var LISTED_TOKEN_IDS = [
    129, 149, 57, 135, 39, 77, 35, 164, 150, 128, 43, 46, 16, 144, 85, 175,
    107, 133, 6, 123, 199, 14, 166, 182, 63, 8, 56, 104, 27, 117, 191, 139
  ];

  var NFTS = LISTED_TOKEN_IDS.map(function (id, i) {
    return {
      id: "chevrette-genesis-" + id,
      tokenId: id,
      name: "Chevrette Genesis #" + id,
      collection: "Chevrette Genesis",
      image: localArt(i),
      priceUsd: 1.00,
      priceLabel: "$1.00",
      status: "listed", // real: this token was listed for sale at time of writing
      // See header comment: placeholder until a verified individual URL is added.
      openseaUrl: COLLECTION_URL,
      tags: ["genesis", i < 8 ? "featured" : "listed"]
    };
  });

  global.ChevretteNFT = {
    COLLECTION_URL: COLLECTION_URL,
    STATS: COLLECTION_STATS,
    NFTS: NFTS
  };
})(window);
