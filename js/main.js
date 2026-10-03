/* Chevrette — interactions */
(function(){
  "use strict";

  document.addEventListener("DOMContentLoaded", function(){

    /* ---- Nav scroll state ---- */
    var nav = document.querySelector(".nav");
    if(nav){
      var onScroll = function(){
        nav.classList.toggle("is-scrolled", window.scrollY > 10);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, {passive:true});
    }

    /* ---- Mobile menu ---- */
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");
    if(toggle && panel){
      toggle.addEventListener("click", function(){
        var open = panel.classList.toggle("open");
        document.body.style.overflow = open ? "hidden" : "";
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      panel.querySelectorAll("a").forEach(function(a){
        a.addEventListener("click", function(){
          panel.classList.remove("open");
          document.body.style.overflow = "";
        });
      });
    }

    /* ---- Scroll reveal ---- */
    var revealEls = document.querySelectorAll(".reveal, .stage");
    if("IntersectionObserver" in window && revealEls.length){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      }, {threshold:0.15, rootMargin:"0px 0px -60px 0px"});
      revealEls.forEach(function(el){ io.observe(el); });
    } else {
      revealEls.forEach(function(el){ el.classList.add("in-view"); });
    }

    /* ---- FAQ accordion ---- */
    document.querySelectorAll(".faq-item").forEach(function(item){
      var q = item.querySelector(".faq-q");
      var a = item.querySelector(".faq-a");
      if(!q || !a) return;
      q.addEventListener("click", function(){
        var isOpen = item.classList.contains("open");
        document.querySelectorAll(".faq-item.open").forEach(function(openItem){
          if(openItem !== item){
            openItem.classList.remove("open");
            openItem.querySelector(".faq-a").style.maxHeight = null;
            openItem.querySelector(".faq-q").setAttribute("aria-expanded","false");
          }
        });
        if(isOpen){
          item.classList.remove("open");
          a.style.maxHeight = null;
          q.setAttribute("aria-expanded","false");
        } else {
          item.classList.add("open");
          a.style.maxHeight = a.scrollHeight + "px";
          q.setAttribute("aria-expanded","true");
        }
      });
    });

    /* ---- NFT explore filters ---- */
    var filterBtns = document.querySelectorAll(".nft-filter");
    var exploreGrid = document.getElementById("nft-explore-grid");
    if(filterBtns.length && exploreGrid){
      filterBtns.forEach(function(btn){
        btn.addEventListener("click", function(){
          filterBtns.forEach(function(b){ b.classList.remove("active"); });
          btn.classList.add("active");
          var filter = btn.getAttribute("data-filter");
          exploreGrid.querySelectorAll(".nft-piece").forEach(function(piece){
            var tags = (piece.getAttribute("data-tag") || "").split(" ");
            var show = filter === "all" || tags.indexOf(filter) !== -1;
            piece.style.display = show ? "" : "none";
          });
        });
      });
    }

    /* ---- Footer year ---- */
    document.querySelectorAll("[data-year]").forEach(function(el){
      el.textContent = new Date().getFullYear();
    });

    /* ---- Active nav link ---- */
    var current = document.body.getAttribute("data-page");
    document.querySelectorAll(".nav-links a, .mobile-panel a").forEach(function(a){
      if(a.getAttribute("data-nav") === current) a.classList.add("active");
    });

    /* ---- Recalculate open FAQ height on language change (text length changes) ---- */
    document.addEventListener("chevrette:langchange", function(){
      document.querySelectorAll(".faq-item.open .faq-a").forEach(function(a){
        requestAnimationFrame(function(){ a.style.maxHeight = a.scrollHeight + "px"; });
      });
    });
  });
})();
