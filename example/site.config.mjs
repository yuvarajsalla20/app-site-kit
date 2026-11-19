/** A small sample site: Features, Privacy, Support and About. Build: npm run example (writes example/public). */
const links = [
  { label: 'Features', href: '/features', page: 'features' },
  { label: 'Privacy', href: '/privacy', page: 'privacy' },
  { label: 'Support', href: '/support', page: 'support' },
  { label: 'About', href: '/about', page: 'about' },
];
export default {
  brand: { name: 'Sample App', icon: '/icon.png' },
  theme: { accent: '#2f5bd3', accentBright: '#6b8cff', accentSoft: '#e3eaff', night: '#070b18', heroMid: '#1d3a8a', heroDeep: '#0d1a44' },
  header: { logo: { src: '/logo.png', alt: 'Sample App', href: '/features' }, links },
  footer: { links, text: '© 2026 Sample App', note: 'v1.0' },
  pages: {
    features: {
      title: 'Sample App',
      sections: [
        { type: 'hero', eyebrow: 'Sample App', title: 'Do One Thing.<br><em>Beautifully.</em>', text: 'A line about the app.', cta: { label: 'Explore', href: '#more' }, image: '/icon.png',
          chips: [{ icon: 'bell', tint: ['#e3eaff', '#2f5bd3'], title: 'A chip', text: 'Small line' }] },
        { type: 'welcome', icon: 'heart', title: 'Welcome.', text: 'A warm line.' },
        { type: 'grid', id: 'more', eyebrow: 'Free', title: 'What It Does.', items: [{ icon: 'zap', title: 'Fast', text: 'One tap.' }, { icon: 'lock', title: 'Private', text: 'Only you.' }, { icon: 'phone', title: 'Sync', text: 'Every phone.' }] },
        { type: 'grid', premium: true, title: 'A Few <em>Extras.</em>', items: [{ icon: 'grid', title: 'Widgets', text: 'On the Home Screen.' }] },
        { type: 'compare', eyebrow: 'Compare', title: 'Free and Premium.', columns: { tagline: 'THE FULL EXPERIENCE' },
          groups: [{ title: 'Essentials', rows: [['Reminders', true, true]] }, { title: 'Extras', rows: [['Sounds', '4', '11'], ['Widgets', false, true]] }], footer: 'Cancel Any Time' },
        { type: 'faq', title: 'Good to Know.', items: [{ q: 'Is it free?', a: 'Yes.' }] },
        { type: 'final', image: '/icon.png', title: 'Try It Today.' },
      ],
    },
    privacy: {
      title: 'Sample App Privacy Policy',
      sections: [
        { type: 'hero', eyebrow: 'Privacy Policy', title: 'Your Data<br><em>Is Yours.</em>', image: '/icon.png', promises: [{ icon: 'ban', title: 'No Ads', text: 'None.' }], meta: 'Effective January 1, 2026' },
        { type: 'policy', sections: [
          { title: 'What We Collect', blocks: [{ h: 'Your Account', p: 'Your email.' }] },
          { title: 'Why We Collect It', callout: true, points: ['Only to run the app.', 'No ads.'] },
          { title: 'Who Else Handles It', list: ['<b>Firebase</b> stores it.'] },
        ] },
      ],
    },
    support: {
      title: 'Sample App Support',
      sections: [
        { type: 'hero', eyebrow: 'Support', title: 'We’re Here<br><em>to Help.</em>', image: '/icon.png' },
        { type: 'support', title: 'Get in Touch.', items: [{ icon: 'mail', title: 'Email', text: 'help@example.com', action: 'Write to Us', href: 'mailto:help@example.com' }, { icon: 'shield', title: 'Privacy', action: 'Read It', href: '/privacy' }] },
      ],
    },
    about: {
      title: 'About Sample App',
      description: 'Who makes Sample App, and why.',
      sections: [
        { type: 'hero', eyebrow: 'About', title: 'Made With<br><em>Care.</em>', text: 'Why we built it, and who we are.', image: '/icon.png' },
        { type: 'story', eyebrow: 'Our Story', title: 'It Started With One Problem.', image: '/icon.png', paragraphs: ['A first paragraph.', 'A second paragraph.'], signature: '— The Sample App team' },
        { type: 'facts', title: 'In Numbers.', items: [{ value: '2026', label: 'Started' }, { value: '4', label: 'Languages' }, { value: '0', label: 'Ads' }] },
        { type: 'grid', eyebrow: 'What We Believe', title: 'Our Promises.', items: [{ icon: 'lock', title: 'Private', text: 'Only you.' }, { icon: 'ban', title: 'No Ads', text: 'Ever.' }, { icon: 'heart', title: 'Simple', text: 'One tap.' }] },
        { type: 'people', title: 'Who Makes It.', items: [{ name: 'Sample Maker', role: 'Founder', text: 'Builds the app.' }] },
        { type: 'support', title: 'Say Hello.', items: [{ icon: 'mail', title: 'Email', text: 'help@example.com', action: 'Write to Us', href: 'mailto:help@example.com' }, { icon: 'shield', title: 'Privacy', action: 'Read It', href: '/privacy' }] },
      ],
    },
  },
};
