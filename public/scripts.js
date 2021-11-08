"use strict";

/*
    // Src : https://hibp.labinno.fr/scripts.js // Made it compatible for IE 11 & < with https://babeljs.io
*/

$(function() {
    
    var dateUk2Fr = function(date) { // "2018-07-05" ou "2013-03-30T16:03:00Z" -> 05-07-2018
        if (!date || date.length < 10) return '-';
        if (date.length > 10) date = date.substring(0, 10);
        var fragment = date.split('-');
        return fragment[2]+'/'+fragment[1]+'/'+fragment[0];
    };

    var objSortByDate = function(a, b) { 
        var sort = a.BreachDate ? 'BreachDate' : 'Date';
        var x = a[sort];
        var y = b[sort];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    };

    var input2html = function(value) { // Safe string
        return $('<div/>').text(''+value).html();
        // return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    var $mainSection = $('#mainSection');
    var $printSection = $('#printSection');
    var $userEmail = $('#userEmail');
    var currentEmail = '';

    var printPwned = function(data) {
        var table = '';
        var tr = [];

        if (data.breaches) {
            /*
                Name: 'VK',
                Title: 'VK',
                Domain: 'vk.com',
                BreachDate: '2012-01-01',
                AddedDate: '2016-06-09T09:16:36Z',
                ModifiedDate: '2016-06-09T09:16:36Z',
                PwnCount: 93338602,
                Description: 'In approximately 2012, the Russian social media site known as <a href="http://motherboard.vice.com/read/another-day-another-hack-100-million-accounts-for-vk-russias-facebook" target="_blank" rel="noopener">VK was hacked</a> and almost 100 million accounts were exposed. The data emerged in June 2016 where it was being sold via a dark market website and included names, phone numbers email addresses and plain text passwords.',
                LogoPath: 'https://haveibeenpwned.com/Content/Images/PwnedLogos/VK.png',
                DataClasses: [ 'Email addresses', 'Names', 'Passwords', 'Phone numbers' ],
                IsVerified: true,
                IsFabricated: false,
                IsSensitive: false,
                IsRetired: false,
                IsSpamList: false 
            */
            tr.push(`<thead>
                <tr>
                    <th style="width:70px" class="has-text-centered">
                        <!--// <span class="icon is-medium is-marginless"><i class="tri-exclamation-triangle has-text-danger" aria-hidden="true"></i></span> //-->
                    </th>
                    <th scope="col" style="width:130px">Nom</th>
                    <th scope="col" style="width:120px">Domaine</th>
                    <th scope="col" style="width:100px">Date</th>
                    <th scope="col">Données</th>
                </tr>
            </thead>`);

            data.breaches
                .sort(objSortByDate)
                .forEach(breach => {
                    if (!breach.LogoPath || (breach.LogoPath && /(List\.png)/.test(breach.LogoPath))) {
                        breach.LogoPath = '<h4 class="is-size-4 title has-text-centered">?</h4>';
                    }
                    else {
                        breach.LogoPath = '<img src="'+breach.LogoPath+'"/>';
                    }
                    tr.push(`<tr class="showTr">
                        <th data-label="" class="is-paddingless has-text-centered">${breach.LogoPath}</th>
                        <td data-label="" scope="row"><strong>${breach.Name}</strong></td>
                        <td data-label=" : ">${breach.Domain ? '<a href="https://'+breach.Domain+'" target="_blank" rel="noopener" title="Le lien vers '+breach.Domain+' peut ne plus fonctionner">'+breach.Domain+'</a>' : '-'}</td>
                        <td data-label=" le ">${dateUk2Fr(breach.BreachDate)}</td>
                        <td data-label=""><div class="tags"><span class="tag">${breach.DataClasses.join('</span> <span class="tag">')}</span></div></td>
                    </tr>
                    <tr class="hiddenTr">
                        <th></th>
                        <td colspan="4">
                            <p style="display:none">${(breach.DescriptionFr ? breach.DescriptionFr : breach.Description)}<br />
                            <i>Nombre de comptes compromis : ${breach.PwnCount}, Fuite vérifiée : ${breach.IsVerified ? 'Oui' : 'Non'}, Date de mise à jour : ${dateUk2Fr(breach.ModifiedDate)}</i></p>
                        </td>
                    </tr>`);
                });

            table = `<h3 class="is-size-3 title has-text-centered"><strong>${data.breaches.length}</strong> fuite${(data.breaches.length > 1 ? 's' : '')} de données («&nbsp;Breach${(data.breaches.length > 1 ? 'es' : '')}&nbsp;»)</h3>
            <table class="table is-fullwidth" style="width:100%">
                ${tr.join('')}
            </table>`;
            tr = [];
        }

        if (data.pastes) {
            /*
                Id: 'http://pxahb.xyz/emailpass/m.mahasbtc.com.txt',
                Source: 'AdHocUrl',
                Title: 'pxahb.xyz',
                Date: "2013-03-30T16:03:00Z",
                EmailCount: 1421
            */
            tr.push(`<thead>
                <tr>
                    <th scope="col" style="width:130px">Nom</th>
                    <th scope="col" style="width:120px">Domaine</th>
                    <th scope="col" style="width:100px">Date</th>
                    <th scope="col">Nombre de mails</th>
                </tr>
            </thead>`);

            data.pastes
                .sort(objSortByDate)
                .forEach(paste => {
                    tr.push(`<tr>
                        <td data-label="" scope="row"><strong>${paste.Source}</td>
                        <td data-label=" : ">${(paste.Title && paste.Title.length > 150 ? paste.Title.substring(0, 150)+'...' : (paste.Title ? paste.Title : '-'))}</td>
                        <td data-label=" (le ">${dateUk2Fr(paste.Date)}</td>
                        <td data-label=") Nombre de mails : ">${paste.EmailCount}</td>
                    </tr>`);
                });

            table += `<h3 class="is-size-3 title has-text-centered"><strong>${data.pastes.length}</strong> donnée${(data.pastes.length > 1 ? 's' : '')} affichée${(data.pastes.length > 1 ? 's' : '')} («&nbsp;Paste${(data.pastes.length > 1 ? 's' : '')}&nbsp;»)</h3>
            <table class="table is-fullwidt" width="100%">
                ${tr.join('')}
            </table>`;
        }

        $printSection
            .hide()
            .html(`<div class="box has-hat">
                <div class="is-hat is-danger sticker">Oups&nbsp;! "<strong>${currentEmail}</strong>" a été compromis&nbsp;!&nbsp;:(</div>
                <div class="box-content">
                    ${table}
                </div>
            </div>`)
            .slideDown();

        setTimeout(() => {

            $('tr.showTr > th, tr.showTr > td').click(function() { // Show/Hide some TR rows in table
                var $this = $(this).parent('tr');
                if ($this.hasClass('openned') ) { // Close it
                    $this.next('tr').find('p').slideUp();
                }
                else { // Open it
                    $('tr.openned').removeClass('openned').next('tr').find('p').slideUp(); // Close others
                    $this.next('tr').find('p').slideDown();
                }
                $this.toggleClass('openned');
            });

            setTimeout(function() {
                $('tr.showTr:first > th:first').click();
            }, 3000);
            
        }, 100);
    };

    var printNotPwned = function(data) {
        $printSection
            .hide()
            .html(`<div class="box has-hat">
                <div class="is-hat is-success sticker">Hourra&nbsp;! "<strong>${currentEmail}</strong>" ne semble avoir été compromis&nbsp;!&nbsp;:)</div>
                <div class="box-content has-text-centered">${data}</div>
            </div>`)
            .slideDown();
    };

    var wait = false;
    var $notif = null;

    $("#checkMail").submit(function(event) {
        event.preventDefault(); // Stop form from submitting

        // 3s minimun
        if (wait) return false;
        wait = true;
        setTimeout(function() { wait = false; }, 3000);

        var userEmail = $userEmail.val();
        if (!userEmail) return false;

        if (/\s/.test(userEmail)) {
            $userEmail.focus();
            $notif = $('<p class="is-3 text has-text-centered" style="display: none;">Il ne peut pas y avoir d\'espace, ni dans les mails, ni dans les noms d\'utilisateur</p>').insertAfter('#formInput').fadeIn(600);
            setTimeout(function() { $notif.fadeOut(600); }, 5000);
            wait = false;
            return false;
        }

        // Loading
        $printSection.html('<div class="dual-ring"></div>'); // <p class="text is-size-7"><i>&lt;input value="'+currentEmail+'" type="text" action="search"/&gt;</i></p>
        $mainSection.slideDown();

        if (/^0[0-9]{9}$/.test(userEmail)) userEmail = '+33'+userEmail.substring(1); // International phone 0661756498
        currentEmail = input2html(userEmail); // Sanitize for print
        $userEmail.val('').blur(); // Empty user input

        grecaptcha.ready(function() { // recaptcha
            grecaptcha
                .execute('6Lde********************vK3Ui7', {action: 'submitHibp'})
                .then(function(token) { // Ok ! Go !
                    $.ajax({ 
                        url: '/form',
                        method: 'POST',
                        data: {
                            userEmail: userEmail,
                            token: token
                        },
                        dataType: 'json',
                        success: function(data, textStatus, xhr) {
                            // console.log('Success :) ', data);
                            if (data.response && (data.response.breaches || data.response.pastes)) {
                                return printPwned(data.response);
                            }
                            return printNotPwned( // Error message eg. "rate limit" or good !
                                data.response && typeof data.response == 'string' ? 
                                    data.response : 'Hourra&nbsp;! Nous n\'avons pas trouvé votre email dans les données compromises'
                            );
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) { 
                            console.log('Error :( ', XMLHttpRequest, textStatus, errorThrown);
                            printNotPwned('Oups&nbsp;! Erreur réseau ou serveur...'); // Network/server error
                        }
                    });
                });
        });

        return false; // Stop form from submitting
    });
    
});