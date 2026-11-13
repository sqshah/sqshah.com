/* The work index.

   Public text says what happened and what it was worth. It does not name the
   client, quote an account number or show a screenshot, because those figures
   belong to the company that paid for them. Everything that would identify
   them sits behind the request.
*/
(function () {
  'use strict';

  const CASES = [
    { t: 'Four years of paid media for an East African motor group',
      m: 'Google, Meta, TikTok',
      p: 'Six accounts across four countries, each run as its own island and none of them '
       + 'reconciled against what actually sold. I consolidated them into one reporting '
       + 'structure, rebuilt the campaign architecture around it, and moved budget to the '
       + 'markets that were converting rather than the ones that were loudest.',
      e: ['Account overview and campaign tables', 'Ten billing invoices, Jan to Oct',
          'Ad-group level export, every month', 'Conversion and attribution reports'] },

    { t: 'An ROI dashboard built from nothing, reconciled to the cent',
      m: '402 months of spend',
      p: 'Spend lived in the ad platforms, sales in a separate system and payments in '
       + 'spreadsheets. Nobody could answer what a sold vehicle had cost to sell. I built '
       + 'one dashboard that pulls all three together and reconciles every payment, '
       + 'including currency conversion on locally invoiced lines.',
      e: ['Live dashboard walkthrough', 'The reconciliation model',
          'Before and after reporting structure'] },

    { t: '$25,968 of advertising that no report had ever counted',
      m: 'Found, allocated, booked',
      p: 'One channel had run for five years and never appeared in a single report. The '
       + 'vehicles it sold were counted as though they had cost nothing. I found the spend '
       + 'in the archive, allocated it across branches by their share of its sales, spread '
       + 'package payments over the months they covered, and reconciled every payment at '
       + 'its implied exchange rate.',
      e: ['The archive trail', 'Allocation model and workings',
          'Corrected cost per vehicle, by branch'] },

    { t: 'Lahore real estate, two channels at once',
      m: 'Zameen, Meta',
      p: 'Premium apartments and retail units priced in crores, listed on a property portal '
       + 'for intent and advertised on Meta for reach across five cities. Strategy and '
       + 'tracking across both, with every property measured separately.',
      e: ['Portal performance reports', 'Meta breakdowns by placement',
          'Creative set and lead forms'] },

    { t: 'Hiring ads for a Japanese exporter',
      m: 'Meta',
      p: 'Recruitment campaigns for an exporter hiring into a market where the audience '
       + 'barely overlaps with the buying audience. Different creative, different proof, '
       + 'different definition of a good lead.',
      e: ['Campaign structure and spend', 'Applicant volume and cost'] },

    { t: 'Organic search, rebuilt',
      m: '113k clicks',
      p: 'Technical fixes, a content system and the keyword work behind the landing pages '
       + 'the ads point at. Paid and organic sharing one set of pages rather than competing '
       + 'for the same queries.',
      e: ['Search Console, before and after', 'Ahrefs movement',
          'Content and page architecture'] },

    { t: 'A 100,000-follower account, taken and recovered',
      m: 'Instagram',
      p: 'The account was compromised and the recovery path a brand is supposed to use did '
       + 'not work. Getting it back took persistence and a paper trail rather than a trick.',
      e: ['Timeline and correspondence', 'Recovery confirmation'] },

    { t: 'A cloned website, traced and taken down',
      m: 'Content theft',
      p: 'A copy of the site, running on another domain, taking traffic on the same brand '
       + 'terms. Traced the host, documented the duplication and had it removed.',
      e: ['Duplication evidence', 'Host correspondence and outcome'] },

    { t: 'An email platform built in-house instead of bought',
      m: '158,933 sends',
      p: 'Four years on a per-contact plan taught us exactly which automations mattered. '
       + 'With a developer I replaced it with a sending platform the company owns, which '
       + 'runs the same flows without a bill that scales with the list, or a card that can '
       + 'decline on a Friday.',
      e: ['Platform screens', 'Deliverability and automation performance',
          'Cost before and after'] },

    { t: 'Twelve Canadian brands, handled end to end',
      m: 'Brand, web',
      p: 'An agency roster covering a daycare, construction, landscaping, a restaurant, a '
       + 'salon, plumbing, pest control, limousine hire, glazing, property maintenance and '
       + 'a realtor. Identity, banners, websites and the ads on top of them.',
      e: ['Brand and banner sets', 'Sites built'] },

    { t: 'Five years of freelance work across ten websites',
      m: 'Search, build, growth',
      p: 'Sites across AI tooling, crypto, legal technology and telecom, built or ranked or '
       + 'both. Search strategy, technical fixes, content systems and the link work behind '
       + 'them.',
      e: ['Per-site reports', 'Ranking movement'] }
  ];

  const rows = document.getElementById('rows');
  if (!rows) return;

  rows.innerHTML = CASES.map((c, i) => {
    const id = 'p' + i;
    return `
      <button class="case-row" type="button" data-panel="${id}" aria-controls="${id}">
        <span class="n">${String(i + 1).padStart(2, '0')}</span>
        <span class="t">${c.t}</span>
        <span class="m">${c.m}</span>
      </button>
      <div class="panel" id="${id}" hidden>
        <div class="pad">
          <div>
            <p>${c.p}</p>
            <button class="shut" type="button">Close</button>
          </div>
          <div class="ev">
            <h3>Behind the request</h3>
            <ul>${c.e.map(x => `<li>${x}</li>`).join('')}</ul>
            <a href="mailto:talk@sqshah.com?subject=${encodeURIComponent('Access — ' + c.t)}">Request access</a>
          </div>
        </div>
      </div>`;
  }).join('');
})();
