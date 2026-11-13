#!/usr/bin/env python3
"""Every case page, generated from one template.

Eleven pages sharing a layout means one template and a data file, not eleven
copies of the markup - otherwise the twelfth change gets made eleven times and
three of them get missed. Khushi Motors is in here too, so the page that was
approved and the ten built on it cannot drift apart.

Public text names a client only where he already names them himself. The motor
group stays unnamed: he leaves on the 15th, and their spend, account ids and
invoice numbers are theirs. Everything identifying sits behind the request.
"""
import pathlib

ROOT = pathlib.Path(__file__).parent
OUT = ROOT / 'work'

# Monochrome geometric marks. Nobody's logo: a redrawn Google or Meta mark is
# their trademark whatever colour it is in.
ICONS = {
    'plus':  '<circle cx="16" cy="16" r="11"/><path d="M16 5v22M5 16h22"/>',
    'swoosh': '<path d="M5 20c0-7 3.4-11 7-11s5 4 8 8 4.6 5 6 5c2.2 0 3-2 3-5s-1.4-6-4-6"/>',
    'mail':  '<rect x="4" y="8" width="24" height="16"/><path d="M4 9l12 9 12-9"/>',
    'pin':   '<path d="M16 29s9-9.6 9-16A9 9 0 0 0 7 13c0 6.4 9 16 9 16z"/><circle cx="16" cy="13" r="3.4"/>',
    'find':  '<circle cx="14" cy="14" r="8.5"/><path d="M20.4 20.4L28 28"/>',
    'badge': '<circle cx="16" cy="11" r="5.4"/><path d="M6 28c0-5.5 4.5-8.6 10-8.6S26 22.5 26 28"/>',
    'cart':  '<path d="M4 6h4l3.4 13.4h12.2L27 10H9"/><circle cx="13" cy="25" r="2"/><circle cx="23" cy="25" r="2"/>',
    'link':  '<path d="M13 19l6-6"/><path d="M17.5 8.5l2-2a5 5 0 0 1 7 7l-2 2"/><path d="M14.5 23.5l-2 2a5 5 0 0 1-7-7l2-2"/>',
    'coin':  '<circle cx="16" cy="16" r="11"/><path d="M19.5 12.4a4.6 4.6 0 0 0-7.2 1.2c-.9 2 .4 3.4 3.7 3.9s4.6 1.9 3.7 3.9a4.6 4.6 0 0 1-7.2 1.2"/><path d="M16 8.5v15"/>',
    'copy':  '<rect x="4" y="4" width="17" height="17"/><rect x="11" y="11" width="17" height="17"/>',
    'lock':  '<rect x="6" y="14" width="20" height="14"/><path d="M11 14v-4a5 5 0 0 1 10 0v4"/>',
    'build': '<rect x="4" y="4" width="24" height="24"/><path d="M4 11h24M11 11v17"/>',
}


def fig(text, n=None, pre=None, compact=False):
    return dict(text=text, n=n, pre=pre, compact=compact)


# ---------------------------------------------------------------- the cases --
CASES = [
    # ---------------------------------------------------------------------- 1
    dict(
        slug='khushi-motors',
        title='$0.29 a lead',
        desc='Four years of paid media for an East African motor group. Six accounts, '
             'four countries, 145,902 leads at $0.29 each.',
        shot='/assets/work/km/cover.jpg',
        tagline='four years, four countries',
        big='$0.29', bigmk='a lead',
        sub='Six ad accounts for an East African motor group, consolidated into one '
            'structure that could say what a sale had cost.',
        strip=[('Industry', 'Automotive'), ('Market', 'East Africa'),
               ('Duration', 'Four years'), ('Channels', 'Google, Meta, Email'),
               ('Role', 'Performance lead')],
        problem=dict(head='Nobody knew what a <span class="mk">sale</span> cost',
                     chips=['Six accounts', 'Four countries', 'Nothing reconciled']),
        chapters=[
            dict(id='google', label='Google', icon='plus',
                 head='Google carried the', mk='volume',
                 chips=['Search', 'Performance Max', 'Demand Gen', 'Display', 'Video',
                        'Store visits'],
                 img='/assets/work/km/ads.jpg',
                 alt='Google Ads account overview, client name removed',
                 cap=('Google Ads', 'All campaigns'),
                 fig=fig('1,238,753', 1238753), figk='Clicks', note='three cents each'),
            dict(id='meta', label='Meta', icon='swoosh',
                 head='Meta carried the', mk='leads',
                 chips=['Lead forms', 'Traffic', 'Boosted posts', 'Five branches'],
                 panel=dict(
                     left='Leads by branch',
                     right='16.9M reached &nbsp;&middot;&nbsp; 32.2M impressions',
                     rows=[('Dar es Salaam', 11866, '$0.30'), ('Kampala', 11435, '$0.34'),
                           ('Mombasa', 10693, '$0.39'), ('Kisumu', 9188, '$0.19'),
                           ('Commercial', 3565, '$0.17')]),
                 fig=fig('46,747', 46747), figk='Leads at $0.30', note='five branches'),
            dict(id='email', label='Email', icon='mail',
                 head='The list we already', mk='owned',
                 chips=['57 flows', '95.2% delivered', 'Built in-house after'],
                 img='/assets/work/km/email.jpg',
                 alt='Email dashboard, sends and engagement',
                 cap=('Email', 'Six months'),
                 fig=fig('158,933', 158933), figk='Sends', note='95.2% delivered'),
        ],
        aside=('Tested TikTok and Snapchat. The audience wasn’t there yet, so the budget',
               'moved'),
        graph=dict(
            left='Media placed, 2026', mid='July peak',
            right='Google and Meta, from the invoices',
            peak='$11,831',
            label='Monthly media spend through 2026, peaking at $11,831 in July',
            months=['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'],
            pts=[191.1, 155.5, 140.1, 173.9, 88.0, 114.3, 27.3, 136.3, 132.5, 84.5],
            peak_i=6),
        results=[dict(f=fig('145,902', 145902), k='Leads captured', note='all five branches'),
                 dict(f=fig('47.9M', 47859432, compact=True), k='Impressions served',
                      note='Google + Meta'),
                 dict(f=fig('$166,643', 166643, pre='$'), k='Advertising managed',
                      note='four years of it')],
        reveal=dict(left='Drag to see what access opens',
                    right='Google Ads &nbsp;&middot;&nbsp; all campaigns',
                    pub='/assets/work/km/ads-public.jpg', pubalt='The same account, obscured',
                    full='/assets/work/km/ads.jpg', fullalt='Google Ads account overview'),
        gallery=dict(label='Four years of it', items=[
            ('/assets/work/km/ga4.jpg', 'GA4 acquisition report', 'GA4', 'Acquisition'),
            ('/assets/work/km/gsc.jpg', 'Search Console performance', 'Search Console',
             '113k clicks'),
            ('/assets/work/km/ahrefs.jpg', 'Ahrefs overview', 'Ahrefs', 'Organic growth'),
            ('/assets/work/km/email.jpg', 'Email engagement dashboard', 'Email',
             '158,933 sends')]),
        gate=('The screenshots, the invoices and the live', 'dashboard'),
    ),
    # ---------------------------------------------------------------------- 2
    dict(
        slug='arsh-properties',
        title='$0.32 an enquiry',
        desc='Premium property across four Pakistani cities, listed on a portal for intent '
             'and advertised on Meta for reach.',
        shot='/assets/work/cs/arsh.jpg',
        tagline='fifteen properties, four cities',
        big='$0.32', bigmk='an enquiry',
        sub='Apartments, penthouses, houses and land from PKR 3.5 crore upward, listed '
            'for intent and advertised for reach.',
        strip=[('Industry', 'Real estate'), ('Market', 'Pakistan'),
               ('Portfolio', '15 listings'), ('Channels', 'Zameen, Meta'),
               ('Role', 'Strategy and tracking')],
        problem=dict(head='Two channels, neither one <span class="mk">counting</span> the other',
                     chips=['Portal and paid social', 'No shared view', 'Per-property budgets']),
        chapters=[
            dict(id='portal', label='Portal', icon='pin',
                 head='The portal carried the', mk='intent',
                 chips=['Zameen', 'Profolio', 'Six live listings', 'Super Hot credits'],
                 img='/assets/work/cs/arsh.jpg',
                 alt='Property portal dashboard, views, clicks and leads',
                 cap=('Property portal', 'Listings and analytics'),
                 fig=fig('6,985', 6985), figk='Listing views', note='167 clicked through'),
            dict(id='meta', label='Meta', icon='swoosh',
                 head='Meta carried the', mk='reach',
                 chips=['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Sialkot'],
                 panel=dict(left='Meta, five cities',
                            right='$145 spent &nbsp;&middot;&nbsp; $0.32 an enquiry',
                            rows=[('Impressions', 215574, 'served'),
                                  ('Reach', 96450, 'people')]),
                 fig=fig('450', 450), figk='WhatsApp enquiries', note='$145 of media'),
        ],
        aside=('Every property measured on its own, so the budget followed the ones people',
               'walked into'),
        results=[dict(f=fig('1,000', 1000), k='Leads, both channels', note='portal + Meta'),
                 dict(f=fig('215,574', 215574), k='Impressions served', note='five cities'),
                 dict(f=fig('15', 15), k='Properties advertised', note='four cities')],
        gate=('The portal reports, the breakdowns and the creative', 'sets'),
    ),
    # ---------------------------------------------------------------------- 3
    dict(
        slug='ocean-trading',
        title='A company, set up digitally',
        desc='An established Japanese exporter with no digital footing. Search, social, '
             'hiring and the internal plumbing, built from nothing.',
        shot='/assets/work/cs/ocean.jpg',
        tagline='an old name, no digital anything',
        big='A to Z', bigmk='from nothing',
        sub='An established exporter with no site structure, no accounts and no process. '
            'One person, the whole digital setup.',
        strip=[('Industry', 'Export trade'), ('Market', 'Japan'),
               ('Scope', 'Full setup'), ('Channels', 'Search, Meta, job boards'),
               ('Role', 'Digital lead')],
        problem=dict(head='A trading name with no digital <span class="mk">anything</span>',
                     chips=['No site structure', 'No accounts', 'No process']),
        chapters=[
            dict(id='hiring', label='Hiring', icon='badge',
                 head='Hiring ran on the job', mk='boards',
                 chips=['Nine job ads', 'Two sites', 'Performance tracked',
                        'Meta retargeting'],
                 img='/assets/work/cs/ocean.jpg',
                 alt='Job board performance overview across nine hiring ads',
                 cap=('Job board', 'Nine ads, performance'),
                 fig=fig('27', 27), figk='Applications', note='24 CVs received'),
            dict(id='roles', label='Roles', icon='find',
                 head='Nine roles, and the ones that actually', mk='filled',
                 chips=['Ichikawa office', 'Ichihara yard', 'Nine hiring dossiers'],
                 panel=dict(left='CVs received, by role', right='24 of 27 applications',
                            rows=[('Car carrier driver', 8, 'Ichihara'),
                                  ('Dent painter + driver', 6, 'Ichihara'),
                                  ('Salesman + driver', 4, 'Ichikawa'),
                                  ('Fork lift driver', 3, 'Ichihara'),
                                  ('Accountant', 2, 'Ichikawa'),
                                  ('Inventory manager', 1, 'Ichihara')]),
                 fig=fig('24', 24), figk='CVs received', note='nine dossiers written'),
            dict(id='setup', label='Setup', icon='build',
                 head='The rest of it was the', mk='plumbing',
                 chips=['Nothing to inherit', 'Remote', 'One build'],
                 lst=dict(left='What got built', right='none of it existed before',
                          rows=[('Site architecture', 'for search'),
                                ('Social presence', 'four accounts'),
                                ('Staff email', 'and onboarding'),
                                ('Access control', 'per role'),
                                ('Security basics', 'documented')]),
                 fig=fig('5', 5), figk='Systems stood up', note='from zero'),
        ],
        aside=('Recruitment creative and sales creative share nothing but a logo, so they',
               'never shared a brief'),
        results=[dict(f=fig('27', 27), k='Applications', note='24 CVs received'),
                 dict(f=fig('9', 9), k='Roles advertised', note='two sites'),
                 dict(f=fig('5', 5), k='Systems stood up', note='search to security')],
        gate=('The campaign structure, the applicant numbers and the', 'build'),
    ),
    # ---------------------------------------------------------------------- 4
    dict(
        slug='organic-search',
        title='113,000 clicks, no media cost',
        desc='Technical fixes, a content system and the keyword work behind the landing '
             'pages the ads point at.',
        shot='/assets/work/km/gsc.jpg',
        tagline='the same pages the ads point at',
        big='113K', bigmk='clicks',
        sub='Paid and organic were bidding against each other for the same queries. One '
            'set of pages, built to answer both.',
        strip=[('Industry', 'Automotive'), ('Market', 'East Africa'),
               ('Discipline', 'Search'), ('Tools', 'Search Console, GA4, Ahrefs'),
               ('Role', 'Search lead')],
        problem=dict(head='Paid and organic fighting over the same <span class="mk">queries</span>',
                     chips=['Thin pages', 'No content system', 'Nothing measured']),
        chapters=[
            dict(id='fixes', label='Fixes', icon='find',
                 head='Search Console told the', mk='truth',
                 chips=['Technical fixes', 'Content system', 'Keyword mapping'],
                 img='/assets/work/km/gsc.jpg',
                 alt='Search Console performance, clicks and impressions',
                 cap=('Search Console', 'Clicks and impressions'),
                 fig=fig('113,000', 113000), figk='Clicks from search',
                 note='no media behind them'),
            dict(id='climb', label='Climb', icon='link',
                 head='Then it was a long', mk='climb',
                 chips=['Backlinks', 'Keyword positions', 'Competitor gaps'],
                 img='/assets/work/km/ahrefs.jpg',
                 alt='Backlink and keyword growth over time',
                 cap=('Backlink tooling', 'Organic growth'),
                 fig=fig('6.1M', 6100000, compact=True), figk='Impressions',
                 note='organic only'),
            dict(id='traffic', label='Traffic', icon='find',
                 head='And analytics counted what', mk='arrived',
                 chips=['Sessions', 'Active users', 'Engagement time', 'Events'],
                 img='/assets/work/km/ga4.jpg',
                 alt='Analytics reports snapshot, sessions and active users',
                 cap=('Analytics', 'Site-wide, Jan 2025 to Oct 2026'),
                 fig=fig('907K'), figk='Sessions, all channels',
                 note='search is the slice that cost nothing'),
        ],
        aside=('The landing pages the ads paid for were the pages search wanted. Nobody had',
               'noticed'),
        results=[dict(f=fig('113,000', 113000), k='Clicks from search',
                      note='no media behind them'),
                 dict(f=fig('6.1M', 6100000, compact=True), k='Search impressions',
                      note='organic only'),
                 dict(f=fig('907,000', 907000), k='Sessions, site-wide',
                      note='all channels, Jan 2025 to Oct 2026')],
        gallery=dict(label='Before and after', items=[
            ('/assets/work/km/gsc.jpg', 'Search Console performance', 'Search Console',
             '113k clicks'),
            ('/assets/work/km/ahrefs.jpg', 'Backlink growth', 'Backlinks', 'Organic growth'),
            ('/assets/work/km/ga4.jpg', 'Acquisition report', 'Analytics', 'Acquisition')]),
        gate=('The Search Console history, the content map and the', 'rankings'),
    ),
    # ---------------------------------------------------------------------- 5
    dict(
        slug='email-platform',
        title='Built, not rented',
        desc='Four years on a per-contact plan taught us which automations mattered. Then '
             'we built the thing that runs them, inside the company site.',
        shot='/assets/work/km/tool-overview.jpg',
        tagline='four years of rent, then we owned it',
        big='37.4%', bigmk='opened',
        sub='A bill that grew with the list, and a card that could decline on a Friday. '
            'So we built the platform ourselves, inside the company site.',
        strip=[('Industry', 'Automotive'), ('Market', 'East Africa'),
               ('Discipline', 'Lifecycle'), ('Channels', 'Email'),
               ('Role', 'Campaigns and product')],
        problem=dict(head='A bill that grew with the <span class="mk">list</span>',
                     chips=['Per-contact pricing', 'A card that could decline',
                            '57 flows at risk']),
        chapters=[
            dict(id='rented', label='Rented', icon='mail',
                 head='The rented platform did the', mk='learning',
                 chips=['57 flows', 'Black November', 'Eid', 'New Year', 'Branch openings'],
                 panel=dict(left='Six months on the rented plan', right='95.2% delivered',
                            rows=[('Sends', 158933, '—'), ('Delivered', 151333, '95.2%'),
                                  ('Opened', 13182, '8.7%'), ('Clicked', 1396, '0.92%')]),
                 fig=fig('8.7%'), figk='Open rate', note='on a rented list'),
            dict(id='built', label='Built', icon='build',
                 head='So we built our', mk='own',
                 chips=['Built with a developer', 'Inside the company site',
                        'No per-contact bill'],
                 win=dict(url='the company site /admin — email marketing / overview',
                          img='/assets/work/km/tool-overview.jpg',
                          alt='The in-house email platform, overview screen',
                          cap=('In-house platform', 'Overview')),
                 fig=fig('37.4%'), figk='Open rate', note='four times the rented one'),
            dict(id='flows', label='Flows', icon='find',
                 head='Three automations, one of them', mk='always on',
                 chips=['Inquiry follow-up', 'Registration onboarding',
                        'Customer retention', '12 core templates'],
                 win=dict(url='the company site /admin — sequences / inquiry follow-up',
                          img='/assets/work/km/tool-timeline.jpg',
                          alt='The inquiry follow-up automation, eleven emails over 28 days',
                          cap=('Automation timeline', 'Eleven emails, 28 days'), tall=True),
                 fig=fig('5,152', 5152), figk='Leads enrolled', note='49,821 queued'),
        ],
        aside=('Four years of paying rent is also four years of finding out exactly what you',
               'need'),
        results=[dict(f=fig('37.4%'), k='Open rate on the platform we own',
                      note='8.7% on the rented one'),
                 dict(f=fig('158,933', 158933), k='Sends on the rented plan',
                      note='95.2% delivered'),
                 dict(f=fig('11', 11), k='Emails in the live sequence',
                      note='28 days, automated')],
        gallery=dict(label='The platform', items=[
            ('/assets/work/km/tool-sequences.jpg', 'The three automations and their rates',
             'Sequences', 'Three automations'),
            ('/assets/work/km/tool-overview.jpg', 'Overview screen of the in-house platform',
             'Overview', 'Delivery and engagement'),
            ('/assets/work/km/email.jpg', 'The rented platform it replaced',
             'Before', 'The rented plan')]),
        reveal=dict(left='Drag to see what access opens',
                    right='Email &nbsp;&middot;&nbsp; sends and engagement',
                    pub='/assets/work/km/email-public.jpg',
                    pubalt='The same dashboard, obscured',
                    full='/assets/work/km/email.jpg', fullalt='Email engagement dashboard'),
        gate=('The platform screens, the deliverability and the cost', 'before'),
    ),
    # ---------------------------------------------------------------------- 6
    dict(
        slug='twelve-brands',
        title='Twelve brands, one roster',
        desc='A Surrey agency roster covering eleven trades, handled remotely from '
             'Pakistan.',
        shot='/assets/work/cs/togear.jpg',
        tagline='eleven trades, one person',
        big='12', bigmk='brands',
        sub='A daycare, construction, landscaping, a restaurant, a salon, plumbing, pest '
            'control, limousine hire, glazing, property maintenance and a realtor.',
        strip=[('Industry', 'Local services'), ('Market', 'Canada'),
               ('Discipline', 'Search and brand'), ('Channels', 'Search, web'),
               ('Role', 'Remote lead')],
        problem=dict(head='Twelve clients, one <span class="mk">person</span>',
                     chips=['Different trades', 'Different sites', 'One standard']),
        chapters=[
            dict(id='search', label='Search', icon='link',
                 head='Off-page carried the', mk='rankings',
                 chips=['Link building', 'Citations', 'Local listings', 'Content'],
                 img='/assets/work/cs/togear.jpg',
                 alt='Brand and identity work for one of the twelve',
                 cap=('Brand work', 'One of twelve'),
                 fig=fig('12', 12), figk='Brands at once', note='one roster'),
        ],
        aside=('Twelve trades that share nothing except needing to be found on the same',
               'map'),
        results=[dict(f=fig('12', 12), k='Brands handled', note='simultaneously'),
                 dict(f=fig('11', 11), k='Trades covered', note='daycare to realtor')],
        gate=('The brand sets, the sites and the ranking', 'reports'),
    ),
    # ---------------------------------------------------------------------- 7
    dict(
        slug='ecommerce-setup',
        title='A store, end to end',
        desc='Shopify then WordPress. Store build, product listings, order management, '
             'confirmation flows and the paid social on top.',
        tagline='storefront, orders, ads, email',
        big='A to Z', bigmk='the whole stack',
        sub='No store, no order process, no follow-up. Built, migrated and advertised '
            'by one person.',
        strip=[('Industry', 'Ecommerce'), ('Market', 'Pakistan'),
               ('Scope', 'Full stack'), ('Channels', 'Meta, email'),
               ('Role', 'Everything digital')],
        problem=dict(head='No store, no orders, no <span class="mk">system</span>',
                     chips=['Platform migration', 'Manual orders', 'No follow-up']),
        chapters=[
            dict(id='store', label='Store', icon='cart',
                 head='The storefront came', mk='first',
                 chips=['Migrated once', 'One catalogue', 'No downtime'],
                 lst=dict(left='What the store needed', right='two platforms, one catalogue',
                          rows=[('Store build', 'Shopify, then WordPress'),
                                ('Product listings', 'full catalogue'),
                                ('Order management', 'manual to automated'),
                                ('Confirmation flows', 'email and phone')]),
                 fig=fig('2', 2), figk='Platforms built', note='Shopify, then WordPress'),
            dict(id='ads', label='Demand', icon='swoosh',
                 head='Then the ads and the', mk='follow-up',
                 chips=['Meta ads', 'Order confirmation', 'Phone confirmation',
                        'Email automation'],
                 fig=fig('100%'), figk='Of the digital side', note='one person'),
        ],
        aside=('A confirmed order is worth more than a placed one, so the follow-up got built',
               'first'),
        results=[dict(f=fig('2', 2), k='Platforms built', note='migrated once'),
                 dict(f=fig('A to Z'), k='Digital ownership', note='store to confirmation')],
        gate=('The store, the order flows and the campaign', 'structure'),
    ),
    # ---------------------------------------------------------------------- 8
    dict(
        slug='freelance-seo',
        title='Four AI products, ranked',
        desc='Ringless Voicemail, CallTrack, CallConfident and Spam Checker. Search '
             'strategy, technical fixes, content and link work.',
        shot='/assets/work/cs/seo.jpg',
        tagline='five years of freelance search',
        big='4', bigmk='products',
        sub='New domains in competitive telecom and AI categories, with no authority to '
            'start from. Ranked on off-page work and a content system.',
        strip=[('Industry', 'SaaS and AI'), ('Market', 'United States'),
               ('Discipline', 'Search'), ('Channels', 'Organic'),
               ('Role', 'Freelance lead')],
        problem=dict(head='Four new domains, no <span class="mk">authority</span>',
                     chips=['Competitive terms', 'No backlink profile', 'Thin content']),
        chapters=[
            dict(id='links', label='Links', icon='link',
                 head='Off-page did the heavy', mk='lifting',
                 chips=['RinglessVoicemail.ai', 'CallTrack.ai', 'CallConfident.com',
                        'SpamChecker.co'],
                 img='/assets/work/cs/seo.jpg',
                 alt='Monthly backlink report for one of the products',
                 cap=('Backlink reporting', 'Monthly, per site'),
                 fig=fig('4', 4), figk='Products ranked', note='five years of it'),
        ],
        aside=('Four products in the same category, which means four sites that must never',
               'compete'),
        results=[dict(f=fig('4', 4), k='Products ranked', note='AI and telecom'),
                 dict(f=fig('5', 5), k='Years freelancing', note='alongside the day job')],
        gate=('The per-site reports and the ranking', 'movement'),
    ),
    # ---------------------------------------------------------------------- 9
    dict(
        slug='refund-recovery',
        title='$2,343 charged in 48 hours, disputed',
        desc='Fifty-nine automated charges against one company card in two days, '
             'documented line by line and taken to the bank.',
        shot='/assets/work/cs/refund.jpg',
        tagline='a bill nobody had read',
        big='59', bigmk='charges, two days',
        sub='Automated billing on a company card ran up $2,343.29 in forty-eight hours. '
            'The vendor closed the case; the file is what moved it on.',
        strip=[('Scope', 'Internal'), ('Market', 'East Africa'),
               ('Discipline', 'Spend control'), ('Channel', 'Vendor billing'),
               ('Role', 'Expense owner')],
        problem=dict(head='$2,343 gone in forty-eight <span class="mk">hours</span>',
                     chips=['59 separate charges', 'One company card',
                            'Nobody watching the console']),
        chapters=[
            dict(id='ledger', label='Ledger', icon='coin',
                 head='Every charge, reconciled by', mk='hand',
                 chips=['22 to 23 July 2026', '59 transactions', 'One vendor'],
                 panel=dict(left='The disputed period', right='48 hours',
                            rows=[('Charges', 59, 'in two days'),
                                  ('Days', 2, 'elapsed')]),
                 fig=fig('$2,343.29'), figk='Disputed', note='59 charges'),
            dict(id='file', label='The file', icon='copy',
                 head='The vendor said no, so the file went', mk='further',
                 chips=['Support correspondence', 'Transaction log',
                        'Billing-interface evidence', 'Bank dispute filed'],
                 win=dict(url='claude-refund-decline-report.pdf \u2014 9 pages',
                          img='/assets/work/cs/refund.jpg',
                          alt='The refund decline report, account details masked',
                          cap=('Dispute file', 'Nine pages, with evidence')),
                 fig=fig('9', 9), figk='Page report', note='built to be read by a bank'),
        ],
        aside=('A vendor saying no is not the end of it. A file a bank can read is what',
               'moves it'),
        results=[dict(f=fig('$2,343.29'), k='Charged in error', note='22 to 23 July'),
                 dict(f=fig('59', 59), k='Charges documented', note='line by line'),
                 dict(f=fig('5', 5), k='Reports filed', note='vendor, then the bank')],
        gate=('The transaction log, the support chats and the dispute', 'file'),
    ),
    # --------------------------------------------------------------------- 10
    dict(
        slug='brand-protection',
        title='Brand protection, start to finish',
        desc='A copy of the site on another domain, ranking on the same brand terms. '
             'Traced, documented and taken down.',
        tagline='our pages, somebody else\u2019s domain',
        big='Taken', bigmk='down',
        sub='A copy of the site, on a domain we did not own, competing for our own brand '
            'terms. Traced, documented and removed.',
        strip=[('Industry', 'Automotive'), ('Market', 'East Africa'),
               ('Discipline', 'Brand protection'), ('Channels', 'Search, hosting'),
               ('Role', 'Investigator')],
        problem=dict(head='Our pages, on somebody else’s <span class="mk">domain</span>',
                     chips=['Duplicate content', 'Brand terms taken', 'Traffic leaking']),
        chapters=[
            dict(id='trail', label='Trail', icon='copy',
                 head='The trail led to the', mk='host',
                 chips=['Same pages', 'Another domain', 'Our brand terms'],
                 lst=dict(left='How it closed', right='no legal spend',
                          rows=[('Duplication', 'evidenced'),
                                ('Registration', 'traced'),
                                ('Host notified', 'complaint filed'),
                                ('Content removed', 'confirmed')]),
                 fig=fig('$0'), figk='Legal cost', note='a complaint, filed properly'),
        ],
        aside=('A paper trail closes a copied site faster than a lawyer, if you build it',
               'first'),
        results=[dict(f=fig('1', 1), k='Copied site removed', note='with a paper trail'),
                 dict(f=fig('$0'), k='Legal cost', note='a complaint, filed properly')],
        gate=('The duplication evidence and the host', 'correspondence'),
    ),
    # --------------------------------------------------------------------- 11
    dict(
        slug='account-recovery',
        title='112,000 followers, taken and recovered',
        desc='A branch account was compromised and the recovery path a brand is supposed '
             'to use did not work.',
        tagline='the official route did not work',
        big='112K', bigmk='followers back',
        sub='A branch account with a hundred and twelve thousand followers, compromised, '
            'with the route a brand is supposed to use going nowhere.',
        strip=[('Industry', 'Automotive'), ('Market', 'Mombasa'),
               ('Discipline', 'Brand protection'), ('Channel', 'Social'),
               ('Role', 'Recovery lead')],
        problem=dict(head='Locked out of our own <span class="mk">audience</span>',
                     chips=['Account compromised', 'Standard recovery failed',
                            '100K reach gone']),
        chapters=[
            dict(id='trail', label='Escalation', icon='lock',
                 head='Persistence and a paper', mk='trail',
                 chips=['Compromised', 'Official route failed', 'Mombasa branch'],
                 lst=dict(left='What it took', right='fully restored',
                          rows=[('Standard recovery', 'failed'),
                                ('Identity verification', 'filed'),
                                ('Escalation', 'answered'),
                                ('Account restored', 'intact')]),
                 fig=fig('112,000', 112000), figk='Followers', note='all of them, back'),
            dict(id='back', label='Back', icon='badge',
                 head='Back up, with every follower', mk='intact',
                 chips=['1,034 posts', 'Highlights intact', 'Every follower'],
                 win=dict(url='the branch account, restored \u2014 handle hidden',
                          img='/assets/work/cs/insta.jpg',
                          alt='The restored account profile, identifying details masked',
                          cap=('The account', 'Restored')),
                 fig=fig('1,034', 1034), figk='Posts', note='nothing lost'),
        ],
        aside=('An audience you did not pay for is still an asset, and it can still be',
               'stolen'),
        results=[dict(f=fig('112,000', 112000), k='Followers recovered',
                      note='the branch account'),
                 dict(f=fig('0', 0), k='Followers lost', note='nothing lost')],
        gate=('The timeline, the correspondence and the recovery', 'confirmation'),
    ),
]


# ------------------------------------------------------------------ render --
def chips(items):
    return ''.join(f'<span>{c}</span>' for c in items)


def mark(icon):
    return ('<span class="mark" aria-hidden="true"><svg viewBox="0 0 32 32">'
            f'{ICONS[icon]}</svg></span>')


def num_attrs(f):
    at = ''
    if f.get('n') is not None:
        at += f' data-n="{f["n"]}"'
    if f.get('pre'):
        at += f' data-pre="{f["pre"]}"'
    if f.get('compact'):
        at += ' data-compact'
    return at


def figure_markup(f, k, note):
    n = f'\n      <p class="note" style="margin-top:14px">{note}</p>' if note else ''
    return (f'    <div class="fig" data-rise>\n'
            f'      <span class="v"{num_attrs(f)}>{f["text"]}</span>\n'
            f'      <span class="lbl k">{k}</span>{n}\n    </div>')


def panel_markup(p):
    top = max(abs(v) for _, v, _ in p['rows']) or 1
    out = (f'    <div class="panel" data-panel>\n'
           f'      <div class="pt"><span class="lbl">{p["left"]}</span>\n'
           f'        <span class="lbl">{p["right"]}</span></div>\n')
    for name, val, right in p['rows']:
        w = abs(val) / top * 100
        shown = f'{p.get("pre", "")}{val:,}'
        out += (f'      <div class="br"><span class="bn">{name}</span>\n'
                f'        <span class="tk" style="--w:{w:.1f}%"><i></i></span>\n'
                f'        <span class="bv">{shown}</span>'
                f'<span class="bc">{right}</span></div>\n')
    return out + '    </div>'


def win_markup(w):
    """A screen he built, shown inside window chrome with its real path."""
    tall = ' tall' if w.get('tall') else ''
    return (f'    <figure class="win{tall}" data-win>\n'
            f'      <div class="top"><span class="dots"><i></i><i></i><i></i></span>\n'
            f'        <span class="url">{w["url"]}</span></div>\n'
            f'      <div class="pane"><img src="{w["img"]}" alt="{w["alt"]}"></div>\n'
            f'      <figcaption><span class="lbl">{w["cap"][0]}</span>'
            f'<span class="lbl">{w["cap"][1]}</span></figcaption>\n    </figure>')


def list_markup(p):
    """Work that was built, not measured. A name, a rule, a status word."""
    out = (f'    <div class="lst" data-rise>\n'
           f'      <div class="pt"><span class="lbl">{p["left"]}</span>\n'
           f'        <span class="lbl">{p["right"]}</span></div>\n')
    for name, status in p['rows']:
        out += (f'      <div class="lr"><span class="ln2">{name}</span>'
                f'<i></i><span class="ls">{status}</span></div>\n')
    return out + '    </div>'


def chapter(no, c):
    head = (f'      <div style="display:flex;align-items:center;gap:14px">\n'
            f'        {mark(c["icon"])}\n'
            f'        <h2 class="h">{c["head"]} <span class="mk">{c["mk"]}</span></h2>\n'
            f'      </div>')
    parts = []
    if c.get('img'):
        a, b = c['cap']
        parts.append(f'    <figure class="plate">\n'
                     f'      <img src="{c["img"]}" alt="{c["alt"]}">\n'
                     f'      <figcaption><span class="lbl">{a}</span>'
                     f'<span class="lbl">{b}</span></figcaption>\n    </figure>')
    elif c.get('win'):
        parts.append(win_markup(c['win']))
    elif c.get('panel'):
        parts.append(panel_markup(c['panel']))
    elif c.get('lst'):
        parts.append(list_markup(c['lst']))
    if c.get('fig'):
        parts.append(figure_markup(c['fig'], c['figk'], c.get('note')))
    body = ''
    if parts:
        if len(parts) == 1:
            parts.append('    <div></div>')
        body = '\n  <div class="body">\n' + '\n'.join(parts) + '\n  </div>'
    return (f'\n<section class="ch wrap" id="{c["id"]}" data-ch>\n'
            f'  <div class="card" data-rise>\n    <span class="no">{no:02d}</span>\n'
            f'    <div>\n{head}\n'
            f'      <div class="meta">{chips(c["chips"])}</div>\n    </div>\n  </div>{body}\n'
            f'</section>\n')


def graph_markup(g):
    n = len(g['months'])
    xs = [26.0 + i * (948.0 / (n - 1)) for i in range(n)]
    pts = g['pts']
    line = 'M ' + ' L '.join(f'{x:.1f} {y:.1f}' for x, y in zip(xs, pts))
    area = line + f' L {xs[-1]:.1f} 260 L {xs[0]:.1f} 260 Z'
    dots = ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3"/>' for x, y in zip(xs, pts))
    mos = ''.join(f'<text x="{x:.1f}" y="286" text-anchor="middle">{m}</text>'
                  for x, m in zip(xs, g['months']))
    px, py = xs[g['peak_i']], pts[g['peak_i']] - 11
    return f'''
<section class="graph wrap" id="graph">
  <div class="top">
    <p class="lbl" data-rise>{g["left"]}</p>
    <p class="note" data-rise style="position:absolute;left:50%;top:-6px">{g["mid"]}</p>
    <p class="lbl" data-rise>{g["right"]}</p>
  </div>
  <svg viewBox="0 0 1000 300" role="img" aria-label="{g["label"]}">
    <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".13"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    <g class="gl"><line x1="26" y1="260" x2="974" y2="260"/>
      <line x1="26" y1="177" x2="974" y2="177"/>
      <line x1="26" y1="94" x2="974" y2="94"/></g>
    <path class="ar" d="{area}"/>
    <path class="ln" d="{line}"/>
    <g class="dt">{dots}</g>
    <text class="pk" x="{px:.0f}" y="{py:.0f}" text-anchor="middle">{g["peak"]}</text>
    <g class="mo">{mos}</g>
  </svg>
</section>
'''


def results_markup(rows):
    out = ''
    for r in rows:
        f = r['f']
        out += (f'    <div class="res" data-res>'
                f'<span class="v"{num_attrs(f)}>{f["text"]}</span>\n'
                f'      <div class="meta"><span class="lbl">{r["k"]}</span>\n'
                f'        <span class="note">{r["note"]}</span></div>\n'
                f'      <div class="fill"><i></i></div></div>\n')
    return out


def reveal_markup(r):
    return f'''
<section class="reveal wrap">
  <div class="head">
    <p class="lbl">{r["left"]}</p>
    <p class="lbl">{r["right"]}</p>
  </div>
  <figure class="cmp" id="cmp" role="group" aria-label="Public view against the full screenshot">
    <img src="{r["pub"]}" alt="{r["pubalt"]}">
    <img class="top2" src="{r["full"]}" alt="{r["fullalt"]}">
    <span class="bar2"></span><span class="grab">DRAG</span>
    <figcaption class="l">Public</figcaption>
    <figcaption class="r">With access</figcaption>
  </figure>
</section>
'''


def gallery_markup(g):
    figs = ''
    for src, alt, a, b in g['items']:
        figs += (f'      <figure><img src="{src}" alt="{alt}">\n'
                 f'        <figcaption><span class="lbl">{a}</span>'
                 f'<span class="lbl">{b}</span></figcaption></figure>\n')
    return f'''
<section class="gal">
  <div class="wrap"><p class="lbl" data-rise>{g["label"]}</p></div>
  <div class="wrap">
    <div class="strip2">
{figs}    </div>
  </div>
</section>
'''


def page(c):
    rail = ['<a href="#problem" data-r="problem"><i></i>01 <span>Problem</span></a>']
    chs = ''
    for i, ch in enumerate(c['chapters'], start=2):
        rail.append(f'<a href="#{ch["id"]}" data-r="{ch["id"]}"><i></i>{i:02d} '
                    f'<span>{ch["label"]}</span></a>')
        chs += chapter(i, ch)
    last = len(c['chapters']) + 2
    rail.append(f'<a href="#results" data-r="results"><i></i>{last:02d} <span>Results</span></a>')

    strip = ''.join(f'\n    <div><span class="lbl">{a}</span><b>{b}</b></div>'
                    for a, b in c['strip'])
    shot = (f'\n  <div class="shot"><img src="{c["shot"]}" alt="" aria-hidden="true"></div>'
            if c.get('shot') else '')
    og = f'\n<meta property="og:image" content="{c["shot"]}">' if c.get('shot') else ''
    aside = ''
    if c.get('aside'):
        t, m = c['aside']
        aside = (f'\n<section class="aside wrap">\n  <p data-rise>{t}\n'
                 f'    <span class="mk">{m}</span></p>\n</section>\n')
    graph = graph_markup(c['graph']) if c.get('graph') else ''
    reveal = reveal_markup(c['reveal']) if c.get('reveal') else ''
    gal = gallery_markup(c['gallery']) if c.get('gallery') else ''
    gh, gm = c['gate']
    subj = c['slug'].replace('-', '%20').title()

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>{c["title"]} — SQ Shah</title>
<meta name="description" content="{c["desc"]}">
<link rel="icon" href="/assets/favicon.ico" sizes="any">
<meta name="theme-color" content="#000000">
<meta property="og:title" content="{c["title"]}">
<meta property="og:description" content="{c["desc"]}">{og}
<link rel="preload" href="/assets/fonts/anton.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/instrument.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/case.css">
</head>
<body>

<header class="bar">
  <div class="wrap"><a href="/#work">All work</a><a href="/">SQ Shah</a></div>
</header>

<nav class="rail" aria-label="Chapters">
  {(chr(10) + '  ').join(rail)}
</nav>

<section class="cover">{shot}
  <div class="wrap">
    <p class="tagline">{c["tagline"]}</p>
    <h1 class="h">{c["big"]} <span class="mk">{c["bigmk"]}</span></h1>
    <p class="sub">{c["sub"]}</p>
  </div>
</section>

<section class="strip">
  <div class="wrap"><div class="in">{strip}
  </div></div>
</section>

<main>

<section class="ch wrap" id="problem">
  <div class="card" data-rise>
    <span class="no">01</span>
    <div>
      <h2 class="h">{c["problem"]["head"]}</h2>
      <div class="meta">{chips(c["problem"]["chips"])}</div>
    </div>
  </div>
</section>
{chs}{aside}{graph}
<section class="figs wrap" id="results">
  <div class="card" data-rise>
    <span class="no">{last:02d}</span>
    <div><h2 class="h">What <span class="mk">changed</span></h2></div>
  </div>
  <div class="stack">
{results_markup(c["results"])}  </div>
</section>
{reveal}{gal}
<section class="gate wrap">
  <h2 class="h" data-rise>{gh} <span class="mk">{gm}</span></h2>
  <div class="act" data-rise>
    <a class="btn" href="mailto:talk@sqshah.com?subject=Access%20%E2%80%94%20{subj}">Request access</a>
    <a class="ghost" href="/#work">All work</a>
  </div>
</section>

<footer class="wrap">
  <span class="lbl">Syed Qasim Ali</span>
  <span class="lbl">Figures to October 2026</span>
</footer>

</main>
<script src="/assets/case.js"></script>
</body>
</html>
'''


if __name__ == '__main__':
    for c in CASES:
        d = OUT / c['slug']
        d.mkdir(parents=True, exist_ok=True)
        (d / 'index.html').write_text(page(c), encoding='utf-8')
        print(f'  /work/{c["slug"]}/')
    print(f'{len(CASES)} pages')
