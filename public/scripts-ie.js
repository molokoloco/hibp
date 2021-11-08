"use strict";

$(function () {
  var dateUk2Fr = function dateUk2Fr(date) {
    if (!date || date.length < 10) return '-';
    if (date.length > 10) date = date.substring(0, 10);
    var fragment = date.split('-');
    return fragment[2] + '/' + fragment[1] + '/' + fragment[0];
  };

  var objSortByDate = function objSortByDate(a, b) {
    var sort = a.BreachDate ? 'BreachDate' : 'Date';
    var x = a[sort];
    var y = b[sort];
    return x > y ? -1 : x < y ? 1 : 0;
  };

  var input2html = function input2html(value) {
    return $('<div/>').text('' + value).html();
  };

  var $mainSection = $('#mainSection');
  var $printSection = $('#printSection');
  var $userEmail = $('#userEmail');
  var currentEmail = '';

  var printPwned = function printPwned(data) {
    var table = '';
    var tr = [];

    if (data.breaches) {
      tr.push("<thead>\n                <tr>\n                    <th style=\"width:70px\" class=\"has-text-centered\">\n                        <!--// <span class=\"icon is-medium is-marginless\"><i class=\"tri-exclamation-triangle has-text-danger\" aria-hidden=\"true\"></i></span> //-->\n                    </th>\n                    <th scope=\"col\" style=\"width:130px\">Nom</th>\n                    <th scope=\"col\" style=\"width:120px\">Domaine</th>\n                    <th scope=\"col\" style=\"width:100px\">Date</th>\n                    <th scope=\"col\">Donn\xE9es</th>\n                </tr>\n            </thead>");
      data.breaches.sort(objSortByDate).forEach(function (breach) {
        if (!breach.LogoPath || breach.LogoPath && /(List\.png)/.test(breach.LogoPath)) {
          breach.LogoPath = '<h4 class="is-size-4 title has-text-centered">?</h4>';
        } else {
          breach.LogoPath = '<img src="' + breach.LogoPath + '"/>';
        }

        tr.push("<tr class=\"showTr\">\n                        <th data-label=\"\" class=\"is-paddingless has-text-centered\">".concat(breach.LogoPath, "</th>\n                        <td data-label=\"\" scope=\"row\"><strong>").concat(breach.Name, "</strong></td>\n                        <td data-label=\" : \">").concat(breach.Domain ? '<a href="https://' + breach.Domain + '" target="_blank" rel="noopener" title="Le lien vers ' + breach.Domain + ' peut ne plus fonctionner">' + breach.Domain + '</a>' : '-', "</td>\n                        <td data-label=\" le \">").concat(dateUk2Fr(breach.BreachDate), "</td>\n                        <td data-label=\"\"><div class=\"tags\"><span class=\"tag\">").concat(breach.DataClasses.join('</span> <span class="tag">'), "</span></div></td>\n                    </tr>\n                    <tr class=\"hiddenTr\">\n                        <th></th>\n                        <td colspan=\"4\">\n                            <p style=\"display:none\">").concat(breach.DescriptionFr ? breach.DescriptionFr : breach.Description, "<br />\n                            <i>Nombre de comptes compromis : ").concat(breach.PwnCount, ", Fuite v\xE9rifi\xE9e : ").concat(breach.IsVerified ? 'Oui' : 'Non', ", Date de mise \xE0 jour : ").concat(dateUk2Fr(breach.ModifiedDate), "</i></p>\n                        </td>\n                    </tr>"));
      });
      table = "<h3 class=\"is-size-3 title has-text-centered\"><strong>".concat(data.breaches.length, "</strong> fuite").concat(data.breaches.length > 1 ? 's' : '', " de donn\xE9es (\xAB&nbsp;Breach").concat(data.breaches.length > 1 ? 'es' : '', "&nbsp;\xBB)</h3>\n            <table class=\"table is-fullwidth\" style=\"width:100%\">\n                ").concat(tr.join(''), "\n            </table>");
      tr = [];
    }

    if (data.pastes) {
      tr.push("<thead>\n                <tr>\n                    <th scope=\"col\" style=\"width:130px\">Nom</th>\n                    <th scope=\"col\" style=\"width:120px\">Domaine</th>\n                    <th scope=\"col\" style=\"width:100px\">Date</th>\n                    <th scope=\"col\">Nombre de mails</th>\n                </tr>\n            </thead>");
      data.pastes.sort(objSortByDate).forEach(function (paste) {
        tr.push("<tr>\n                        <td data-label=\"\" scope=\"row\"><strong>".concat(paste.Source, "</td>\n                        <td data-label=\" : \">").concat(paste.Title && paste.Title.length > 150 ? paste.Title.substring(0, 150) + '...' : paste.Title ? paste.Title : '-', "</td>\n                        <td data-label=\" (le \">").concat(dateUk2Fr(paste.Date), "</td>\n                        <td data-label=\") Nombre de mails : \">").concat(paste.EmailCount, "</td>\n                    </tr>"));
      });
      table += "<h3 class=\"is-size-3 title has-text-centered\"><strong>".concat(data.pastes.length, "</strong> donn\xE9e").concat(data.pastes.length > 1 ? 's' : '', " affich\xE9e").concat(data.pastes.length > 1 ? 's' : '', " (\xAB&nbsp;Paste").concat(data.pastes.length > 1 ? 's' : '', "&nbsp;\xBB)</h3>\n            <table class=\"table is-fullwidt\" width=\"100%\">\n                ").concat(tr.join(''), "\n            </table>");
    }

    $printSection.hide().html("<div class=\"box has-hat\">\n                <div class=\"is-hat is-danger sticker\">Oups&nbsp;! \"<strong>".concat(currentEmail, "</strong>\" a \xE9t\xE9 compromis&nbsp;!&nbsp;:(</div>\n                <div class=\"box-content\">\n                    ").concat(table, "\n                </div>\n            </div>")).slideDown();
    setTimeout(function () {
      $('tr.showTr > th, tr.showTr > td').click(function () {
        var $this = $(this).parent('tr');

        if ($this.hasClass('openned')) {
          $this.next('tr').find('p').slideUp();
        } else {
          $('tr.openned').removeClass('openned').next('tr').find('p').slideUp();
          $this.next('tr').find('p').slideDown();
        }

        $this.toggleClass('openned');
      });
      setTimeout(function () {
        $('tr.showTr:first > th:first').click();
      }, 3000);
    }, 100);
  };

  var printNotPwned = function printNotPwned(data) {
    $printSection.hide().html("<div class=\"box has-hat\">\n                <div class=\"is-hat is-success sticker\">Hourra&nbsp;! \"<strong>".concat(currentEmail, "</strong>\" ne semble avoir \xE9t\xE9 compromis&nbsp;!&nbsp;:)</div>\n                <div class=\"box-content has-text-centered\">").concat(data, "</div>\n            </div>")).slideDown();
  };

  var wait = false;
  var $notif = null;
  $("#checkMail").submit(function (event) {
    event.preventDefault();
    if (wait) return false;
    wait = true;
    setTimeout(function () {
      wait = false;
    }, 3000);
    var userEmail = $userEmail.val();
    if (!userEmail) return false;

    if (/\s/.test(userEmail)) {
      $userEmail.focus();
      $notif = $('<p class="is-3 text has-text-centered" style="display: none;">Il ne peut pas y avoir d\'espace, ni dans les mails, ni dans les noms d\'utilisateur</p>').insertAfter('#formInput').fadeIn(600);
      setTimeout(function () {
        $notif.fadeOut(600);
      }, 5000);
      wait = false;
      return false;
    }

    $printSection.html('<div class="dual-ring"></div>');
    $mainSection.slideDown();
    if (/^0[0-9]{9}$/.test(userEmail)) userEmail = '+33' + userEmail.substring(1);
    currentEmail = input2html(userEmail);
    $userEmail.val('').blur();
    grecaptcha.ready(function () {
      grecaptcha.execute('6LdeClYcAAAAAIjVD9Yo3c8jUeVMeIlQw2vK3Ui7', {
        action: 'submitHibp'
      }).then(function (token) {
        $.ajax({
          url: '/form',
          method: 'POST',
          data: {
            userEmail: userEmail,
            token: token
          },
          dataType: 'json',
          success: function success(data, textStatus, xhr) {
            if (data.response && (data.response.breaches || data.response.pastes)) {
              return printPwned(data.response);
            }

            return printNotPwned(data.response && typeof data.response == 'string' ? data.response : 'Hourra&nbsp;! Nous n\'avons pas trouvé votre email dans les données compromises');
          },
          error: function error(XMLHttpRequest, textStatus, errorThrown) {
            console.log('Error :( ', XMLHttpRequest, textStatus, errorThrown);
            printNotPwned('Oups&nbsp;! Erreur réseau ou serveur...');
          }
        });
      });
    });
    return false;
  });
});

//# sourceMappingURL=scripts-ie.js.map