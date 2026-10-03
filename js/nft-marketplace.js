/* ==========================================================================
   Chevrette Genesis — NFT marketplace page renderer
   Only runs on nft.html / ru/nft.html. Reads from window.ChevretteNFT
   (js/nft-data.js) and renders: top carousel, collection grid, explore
   grid + filters + load more, popular strip, and live collection stats.
   Keeping this separate from js/main.js so the shared site script stays
   untouched for every other page.
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var data = window.ChevretteNFT;
    if (!data) return;

    var NFTS = data.NFTS;
    var STATS = data.STATS;
    var COLLECTION_URL = data.COLLECTION_URL;

    /* ---------------- Collection stat panel ---------------- */
    var statEls = document.querySelectorAll("[data-stat]");
    statEls.forEach(function (el) {
      var key = el.getAttribute("data-stat");
      switch (key) {
        case "floor": el.textContent = "$" + STATS.floorPriceUsd.toFixed(2); break;
        case "chain": el.textContent = STATS.chain; break;
        case "supply": el.textContent = STATS.supply; break;
        case "listed": el.textContent = STATS.listed + " / " + STATS.supply; break;
        case "owners": el.textContent = STATS.owners; break;
        case "volume": el.textContent = "$" + STATS.totalVolumeUsd.toFixed(2); break;
      }
    });

    /* ---------------- Card factory ---------------- */
    function svgLink() {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M17 7H8M17 7v9"/></svg>';
    }

    // size: "strip" | "grid" | "feature"
    function cardHtml(nft, size) {
      var url = nft.openseaUrl || COLLECTION_URL;
      var sizeClass = size === "feature" ? " mc-card--feature" : size === "strip" ? " mc-card--strip" : "";
      return (
        '<a class="mc-card' + sizeClass + '" href="' + url + '" target="_blank" rel="noopener" aria-label="View ' + nft.name + ' on OpenSea">' +
          '<div class="mc-card-media">' +
            '<img src="' + nft.image + '" alt="' + nft.name + '" loading="lazy">' +
            '<span class="mc-card-price">' + nft.priceLabel + '</span>' +
          '</div>' +
          '<div class="mc-card-info">' +
            '<div class="mc-card-text">' +
              '<span class="mc-card-name">' + nft.name + '</span>' +
              '<span class="mc-card-collection">' + nft.collection + '</span>' +
            '</div>' +
            '<span class="mc-card-cta">' + svgLink() + '</span>' +
          '</div>' +
        '</a>'
      );
    }

    /* ---------------- Top carousel (hero strip) ---------------- */
    var carousel = document.getElementById("nft-top-carousel");
    if (carousel) {
      carousel.innerHTML = NFTS.slice(0, 12).map(function (n) { return cardHtml(n, "strip"); }).join("");
    }

    /* ---------------- Genesis Collection (featured grid) ---------------- */
    var featured = document.getElementById("nft-featured-grid");
    if (featured) {
      featured.innerHTML = NFTS.slice(0, 4).map(function (n) { return cardHtml(n, "feature"); }).join("");
    }

    /* ---------------- Explore grid + filters + load more ---------------- */
    var exploreGrid = document.getElementById("nft-explore-grid");
    if (exploreGrid) {
      var PAGE_SIZE = 8;
      var visibleCount = PAGE_SIZE;
      var activeFilter = "all";

      function currentFiltered() {
        if (activeFilter === "all") return NFTS;
        return NFTS.filter(function (n) { return n.tags.indexOf(activeFilter) !== -1; });
      }

      function render() {
        var list = currentFiltered();
        var shown = list.slice(0, visibleCount);
        exploreGrid.innerHTML = shown.map(function (n) { return cardHtml(n, "grid"); }).join("");
        var loadMoreBtn = document.getElementById("nft-load-more");
        if (loadMoreBtn) {
          loadMoreBtn.style.display = visibleCount >= list.length ? "none" : "";
        }
        var countEl = document.getElementById("nft-explore-count");
        if (countEl) {
          countEl.textContent = shown.length + " of " + list.length;
        }
      }

      document.querySelectorAll(".nft-filter").forEach(function (btn) {
        btn.addEventListener("click", function () {
          document.querySelectorAll(".nft-filter").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          activeFilter = btn.getAttribute("data-filter");
          visibleCount = PAGE_SIZE;
          render();
        });
      });

      var loadMore = document.getElementById("nft-load-more");
      if (loadMore) {
        loadMore.addEventListener("click", function () {
          visibleCount += PAGE_SIZE;
          render();
        });
      }

      render();
    }

    /* ---------------- Popular / More From The Herd strip ---------------- */
    var popular = document.getElementById("nft-popular-strip");
    if (popular) {
      popular.innerHTML = NFTS.slice(8, 20).map(function (nft) {
        var url = nft.openseaUrl || COLLECTION_URL;
        return (
          '<a class="popular-item" href="' + url + '" target="_blank" rel="noopener">' +
            '<img src="' + nft.image + '" alt="' + nft.name + '" loading="lazy">' +
            '<div class="cap">' + nft.name + ' &middot; ' + nft.priceLabel + '</div>' +
          '</a>'
        );
      }).join("");
    }

    /* Hero cascade artwork is now static HTML (Chevrette Premium preview
       images) — no longer swapped in via JS here. */
  });
})();
