// The privacy policy and terms. Plain data so the wording lives in one place.
// A block is a paragraph (string) or a bullet list (array). [text](url) becomes a link.
// Change LEGAL_UPDATED whenever the meaning of either document changes.

export const LEGAL_UPDATED = '29 October 2026';
export const LEGAL_FALLBACK_EMAIL = 'francoismeiring0203@gmail.com';

// How long a contact message is kept. The form writes the matching expiry date.
export const CONTACT_RETENTION_DAYS = 365;

export const privacyPolicy = ({ email }) => ({
  title: 'Privacy policy',
  intro: 'What this site collects about you, why, and what you can do about it. The short version: no tracking, no advertising, no cookies of my own. If you write to me, I keep your letter so I can reply.',
  sections: [
    {
      heading: 'Who is responsible',
      blocks: [
        `This site is run by Francois Meiring, an individual based in Centurion, South Africa. I am the responsible party for your personal information under the Protection of Personal Information Act, 2013 (POPIA), and the controller for the purposes of the EU and UK GDPR. You can reach me at [${email}](mailto:${email}).`,
      ],
    },
    {
      heading: 'What I collect',
      blocks: [
        'When you send a letter through the Connect page: your name, your email address, your message, and the time it was sent. Nothing else is attached to it.',
        'When you visit any page: the site is served by Google Firebase Hosting, which, like every web host, receives your IP address, browser details and the page requested in order to deliver it. I do not run analytics, advertising or tracking scripts, and I do not build a profile of you.',
        'Please do not send special personal information (health, religion, political views and the like) or anything about children through the form. I do not need it.',
      ],
    },
    {
      heading: 'Why I use it',
      blocks: [
        [
          'To read and reply to your message. This is the only use of what you send. The basis is your request to be contacted (POPIA section 11(1)(a) and (d); GDPR article 6(1)(b) and (f)).',
          'To keep the site running and secure, for example to stop the form being abused. The basis is my legitimate interest in a working, safe site.',
        ],
        'I never sell, rent or trade personal information, and I do not use it for marketing lists. I will not add you to a mailing list.',
      ],
    },
    {
      heading: 'Where it goes',
      blocks: [
        [
          'Google (Firebase and Google Cloud) stores contact messages in a database in Belgium (europe-west1) and hosts the site. See [Google\'s privacy policy](https://policies.google.com/privacy).',
          'Google (Gmail) delivers a copy of each message to my inbox so I can reply.',
          'GitHub serves some images on the Projects page, so your browser contacts GitHub when it loads them.',
        ],
        'Some of these providers store or process information outside South Africa. I rely on them because they are bound by data-protection terms that give protection comparable to POPIA (POPIA section 72), including the EU Standard Contractual Clauses where they apply.',
        'I would only share your information with anyone else if the law required me to.',
      ],
    },
    {
      heading: 'How long I keep it',
      blocks: [
        'Contact messages are deleted automatically 12 months after they arrive, and I delete the copy in my inbox on the same schedule. If we end up working together, I keep what is needed for that work only for as long as it, and any legal record-keeping duty, requires.',
      ],
    },
    {
      heading: 'Cookies and local storage',
      blocks: [
        'This site sets no cookies of its own. It saves two preferences in your browser\'s local storage: light or dark theme, and whether you asked for reduced motion. They never leave your device, and clearing your browser data removes them.',
        'The Projects page can show live, scaled-down previews of websites I built for clients. On larger screens those sites load inside the page, and they are run by their owners, so they may set their own cookies under their own policies. Visiting a site through a link likewise takes you to that site\'s own terms and policies.',
      ],
    },
    {
      heading: 'Your rights',
      blocks: [
        'You may ask me to confirm whether I hold information about you, to see it, to correct it, or to delete it. You may object to my use of it and, where the GDPR applies, ask me to restrict it or hand it over in a portable form. Write to the address above. I will answer within 30 days and will not charge you.',
        'If you are unhappy with how I handled your information, you may complain to the [Information Regulator of South Africa](https://inforegulator.org.za). If you are in the EU or UK, you may also complain to your local data-protection authority. I would appreciate the chance to put it right first.',
      ],
    },
    {
      heading: 'Security',
      blocks: [
        'The site is served only over HTTPS. Stored messages can be read only by me, enforced by the database\'s access rules and a signed-in, verified account. No system is perfectly secure, but if a breach ever affected your information I would tell you and the Information Regulator as POPIA requires.',
      ],
    },
    {
      heading: 'Children',
      blocks: [
        'This site is meant for adults looking for a developer. I do not knowingly collect information from anyone under 18. If you believe a child has sent me their details, tell me and I will delete them.',
      ],
    },
    {
      heading: 'Changes',
      blocks: [
        'If this policy changes, the new version will be posted here with a new date at the top. I will not use information you already sent in a way the policy did not allow when you sent it.',
      ],
    },
  ],
});

export const termsOfUse = ({ email }) => ({
  title: 'Terms of use',
  intro: 'The ground rules for using this site. By using it you agree to them. If you do not, please do not use it.',
  sections: [
    {
      heading: 'About this site',
      blocks: [
        `This is the personal portfolio of Francois Meiring, an individual based in Centurion, South Africa. You can reach me at [${email}](mailto:${email}). How I handle personal information is set out in the [privacy policy](/privacy).`,
        'The site describes my work, experience and qualifications. It is not an offer to sell goods or services. Any work we agree on will be covered by a separate written agreement.',
      ],
    },
    {
      heading: 'Ownership',
      blocks: [
        'The text, design, photographs, graphics and code of this site belong to me unless stated otherwise, and all rights are reserved. You may view the site, share links to it, and quote short passages with credit. You may not copy the site, its design or its content for your own use, or present my work as yours, without my written permission.',
        'Source code in my public GitHub repositories is covered by the licence in each repository. Where a repository has no licence, no rights to reuse it are granted.',
      ],
    },
    {
      heading: 'Other people\'s names and marks',
      blocks: [
        'Product names, logos and brands shown on this site, including the logos of the tools I work with, are trademarks of their respective owners. They are used only to identify those products, and their use does not mean that any owner endorses me or this site.',
        'Client websites are shown with their owners\' permission, to illustrate work I did. Each remains the property of its owner, who is responsible for its content.',
        'Employers, universities and certifying bodies are named to describe my own history. This site is personal and does not speak for any of them.',
      ],
    },
    {
      heading: 'Acceptable use',
      blocks: [
        [
          'Do not use the contact form to send spam, advertising, abuse, malware or anything unlawful.',
          'Do not try to break, overload, scrape at scale, or gain unauthorised access to the site, its database or its admin area.',
          'Do not use the site in a way that infringes anyone\'s rights.',
        ],
        'I may block or delete messages and traffic that break these rules.',
      ],
    },
    {
      heading: 'Accuracy and no professional advice',
      blocks: [
        'I keep the information here accurate and current, but I give it in good faith and without guarantee. Nothing on this site is professional, technical, financial or legal advice to you, and you should not rely on it as such.',
      ],
    },
    {
      heading: 'Links to other sites',
      blocks: [
        'Links and live previews take you to sites I do not control, including client sites and profiles on LinkedIn, GitHub and others. I am not responsible for their content, availability or privacy practices.',
      ],
    },
    {
      heading: 'Support and donations',
      blocks: [
        'If a support link is shown, any payment through it is a voluntary gift towards my studies, made through a third-party payment provider under that provider\'s terms. It does not buy any goods, services or rights. I am an individual and not a registered public benefit organisation, so gifts are not tax-deductible and no section 18A certificate can be issued. Gifts cannot be refunded, except where the law requires it.',
      ],
    },
    {
      heading: 'Availability and liability',
      blocks: [
        'The site is provided free of charge, as it is and as available. I may change, suspend or remove any part of it at any time.',
        'To the fullest extent the law allows, I am not liable for any loss or damage arising from your use of the site, from relying on its content, or from sites it links to. Nothing in these terms limits any right you have, or any liability I have, that cannot lawfully be limited, including under the Consumer Protection Act, 2008, where it applies.',
      ],
    },
    {
      heading: 'Law and changes',
      blocks: [
        'These terms are governed by the law of the Republic of South Africa, and its courts have jurisdiction over any dispute, without taking away any protection you have under the law of the place you live. If any part of these terms is found unenforceable, the rest still applies.',
        'I may update these terms. The version and date posted here apply from the time they are posted.',
      ],
    },
  ],
});
