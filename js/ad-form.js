/* Chevrette — advertising request form (posts to Supabase RPC, no third-party form) */
(function(){
  "use strict";
  var URL_ = "https://qfeadxjmkvljzfpenkvy.supabase.co/rest/v1/rpc/submit_ad_request";
  var KEY = "sb_publishable_JQorN6JHun4MwObrCQBd_w_FC4JZs-P";
  var form = document.getElementById("adForm");
  if(!form) return;
  var ru = (document.documentElement.lang || "en").toLowerCase().indexOf("ru") === 0;
  var T = ru ? {
    sending:"Отправляем…", ok:"Спасибо! Заявка отправлена. Мы свяжемся с вами по указанному email.",
    invalid:"Проверьте поля: имя, email и описание (не короче 10 символов).",
    rate:"Слишком много заявок. Попробуйте позже.", fail:"Не удалось отправить. Попробуйте ещё раз или напишите на support@chevrette.shop.",
    consent:"Подтвердите согласие с обработкой данных."
  } : {
    sending:"Sending…", ok:"Thank you! Your request was sent. We will contact you at the email you provided.",
    invalid:"Please check your name, email and description (at least 10 characters).",
    rate:"Too many requests. Please try again later.", fail:"Could not send. Please try again or email support@chevrette.shop.",
    consent:"Please accept the data processing consent."
  };
  var msg = form.querySelector(".ad-msg");
  var btn = form.querySelector("button[type=submit]");
  function show(cls, text){ msg.className = "ad-msg " + cls; msg.textContent = text; }
  function val(n){ var el = form.elements[n]; return el ? String(el.value || "").trim() : ""; }
  var lastSent = 0;

  form.addEventListener("submit", function(e){
    e.preventDefault();
    if(!form.elements.consent.checked){ show("err", T.consent); return; }
    if(Date.now() - lastSent < 15000){ show("err", T.rate); return; }
    var body = {
      p_type: val("type"), p_name: val("name"), p_email: val("email"), p_contact: val("contact"),
      p_company: val("company"), p_website: val("website"), p_placement: val("placement"),
      p_budget: val("budget"), p_message: val("message"), p_lang: ru ? "ru" : "en", p_hp: val("hp")
    };
    btn.disabled = true; show("ok", T.sending);
    fetch(URL_, {
      method: "POST",
      headers: {"Content-Type":"application/json","apikey":KEY,"Authorization":"Bearer " + KEY},
      body: JSON.stringify(body)
    }).then(function(r){ return r.json().then(function(j){ return {s:r.status, j:j}; }); })
      .then(function(res){
        btn.disabled = false;
        var j = res.j || {};
        if(res.s === 200 && j.ok){ lastSent = Date.now(); form.reset(); show("ok", T.ok); }
        else if(j.error === "rate"){ show("err", T.rate); }
        else if(j.error === "invalid"){ show("err", T.invalid); }
        else { show("err", T.fail); }
      }).catch(function(){ btn.disabled = false; show("err", T.fail); });
  });
})();
