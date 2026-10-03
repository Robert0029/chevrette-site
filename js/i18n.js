/* Chevrette — lightweight i18n engine (vanilla JS, local JSON files) */
(function(){
  "use strict";

  var SUPPORTED = ["en","ru"];
  var DEFAULT_LANG = "en";
  var STORAGE_KEY = "chevrette_lang";
  var cache = {};

  function urlLang(){
    // Pages under /ru/ are the static Russian copies — their language is fixed
    // by the URL itself and must never be overridden by a stale stored
    // preference (that was the root cause of the "language keeps resetting
    // to Russian" bug: a visitor who once picked RU had "ru" saved in
    // localStorage, and every English page load silently re-translated
    // itself back to Russian even though the URL/EN link was correct).
    var path = window.location.pathname;
    if(/^\/ru(\/|$)/.test(path)) return "ru";
    return null;
  }

  function pageUsesUrlSwitch(){
    // Most pages implement the language switch as real links to /page.html
    // vs /ru/page.html (a[data-lang]). For those, navigation itself is the
    // source of truth for language — so if we're not under /ru/, it's EN.
    // Only pages without a dedicated /ru/ counterpart (404, referral) use
    // JS-driven <button data-lang> switching and should fall back to the
    // stored preference / browser language instead.
    return document.querySelector(".lang-switch a[data-lang]") !== null;
  }

  function detectInitialLang(){
    var fromUrl = urlLang();
    if(fromUrl) return fromUrl;
    if(pageUsesUrlSwitch()) return DEFAULT_LANG;
    try{
      var stored = localStorage.getItem(STORAGE_KEY);
      if(stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    }catch(e){}
    var nav = (navigator.language || navigator.userLanguage || "").toLowerCase();
    if(nav.indexOf("ru") === 0) return "ru";
    return DEFAULT_LANG;
  }

  function getByPath(obj, path){
    return path.split(".").reduce(function(acc, key){
      return (acc && typeof acc === "object") ? acc[key] : undefined;
    }, obj);
  }

  function localesBase(){
    // Root-relative so it resolves correctly regardless of page nesting depth (e.g. /ru/index.html)
    return "/locales/";
  }

  function loadLang(lang){
    if(cache[lang]) return Promise.resolve(cache[lang]);
    return fetch(localesBase() + lang + ".json", {cache:"no-cache"})
      .then(function(res){
        if(!res.ok) throw new Error("Failed to load locale " + lang);
        return res.json();
      })
      .then(function(data){
        cache[lang] = data;
        return data;
      });
  }

  function applyTranslations(dict){
    document.querySelectorAll("[data-i18n]").forEach(function(el){
      var key = el.getAttribute("data-i18n");
      var val = getByPath(dict, key);
      if(typeof val === "string") el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function(el){
      var key = el.getAttribute("data-i18n-html");
      var val = getByPath(dict, key);
      if(typeof val === "string") el.innerHTML = val;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function(el){
      var key = el.getAttribute("data-i18n-placeholder");
      var val = getByPath(dict, key);
      if(typeof val === "string") el.setAttribute("placeholder", val);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function(el){
      var key = el.getAttribute("data-i18n-aria");
      var val = getByPath(dict, key);
      if(typeof val === "string") el.setAttribute("aria-label", val);
    });

    var page = document.body.getAttribute("data-page") || "home";
    var meta = getByPath(dict, "meta." + page);
    if(meta){
      if(meta.title) document.title = meta.title;
      var desc = document.querySelector('meta[name="description"]');
      if(desc && meta.description) desc.setAttribute("content", meta.description);
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if(ogTitle && meta.title) ogTitle.setAttribute("content", meta.title);
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if(ogDesc && meta.description) ogDesc.setAttribute("content", meta.description);
    }
  }

  function setLangButtons(lang){
    document.querySelectorAll(".lang-switch [data-lang]").forEach(function(btn){
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
  }

  function setLang(lang){
    if(SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
    loadLang(lang).then(function(dict){
      applyTranslations(dict);
      document.documentElement.setAttribute("lang", lang);
      setLangButtons(lang);
      try{ localStorage.setItem(STORAGE_KEY, lang); }catch(e){}
      document.dispatchEvent(new CustomEvent("chevrette:langchange", {detail:{lang:lang, dict:dict}}));
    }).catch(function(err){
      console.error(err);
      if(lang !== DEFAULT_LANG) setLang(DEFAULT_LANG);
    });
  }

  window.ChevretteI18n = {
    setLang: setLang,
    getCurrentLang: function(){ return document.documentElement.getAttribute("lang") || DEFAULT_LANG; }
  };

  document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll(".lang-switch button[data-lang]").forEach(function(btn){
      btn.addEventListener("click", function(){
        setLang(btn.getAttribute("data-lang"));
      });
    });
    setLang(detectInitialLang());
  });
})();
