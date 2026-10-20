import { Buffer } from 'buffer/';
import { Document, Page, View, Text, Image, Link, Font, StyleSheet, pdf } from '@react-pdf/renderer';
import onest400 from '@fontsource/onest/files/onest-latin-400-normal.woff?url';
import onest500 from '@fontsource/onest/files/onest-latin-500-normal.woff?url';
import onest600 from '@fontsource/onest/files/onest-latin-600-normal.woff?url';
import onest700 from '@fontsource/onest/files/onest-latin-700-normal.woff?url';
import bricolage600 from '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-600-normal.woff?url';
import { periodOf, isCurrent, startKey } from '../../content/records';
import { toCredential } from '../../components/Credentials';

// The CV as a real PDF, built in the browser from the data the Bio page already loaded.
// This module is loaded on demand, so the PDF engine never weighs on the page itself.

// react-pdf checks Buffer.isBuffer when loading images, which browsers do not have.
globalThis.Buffer ??= Buffer;

Font.register({
  family: 'Onest',
  fonts: [
    { src: onest400, fontWeight: 400 },
    { src: onest500, fontWeight: 500 },
    { src: onest600, fontWeight: 600 },
    { src: onest700, fontWeight: 700 },
  ],
});
Font.register({ family: 'Bricolage', fonts: [{ src: bricolage600, fontWeight: 600 }] });
// Whole words only; a hyphenated name or URL reads badly on a CV.
Font.registerHyphenationCallback(word => [word]);

// The site's tokens (styles/tokens.css), restated because a PDF cannot read CSS variables.
const INK = '#16161a';
const INK_2 = '#3d3d45';
const INK_3 = '#6b6b75';
const ACCENT = '#2b33c4';
const RULE = '#e2e2ea';
const PANEL = '#191b33';
const PANEL_INK = '#f5f5fa';
const PANEL_INK_2 = '#c6c8de';
const PANEL_INK_3 = '#8d90b0';
const PANEL_RULE = '#33365a';
const PANEL_CHIP = '#262950';
const TONES = {
  blue: { fill: '#5a63ff', deep: '#2b33c4', soft: '#8f95ff' },
  green: { fill: '#35d6a3', deep: '#08664b', soft: '#35d6a3' },
  orange: { fill: '#ff7d5e', deep: '#b03a1e', soft: '#ff7d5e' },
  yellow: { fill: '#ffde4d', deep: '#6a5400', soft: '#ffde4d' },
  pink: { fill: '#bda8ff', deep: '#5a3cc9', soft: '#bda8ff' },
};
const STRIPE = ['blue', 'green', 'yellow', 'orange', 'pink'];

const SIDE_W = 62;
const SIDE_PAD = 7;
const MAIN_PAD_L = 9;
const MAIN_PAD_R = 11;
const mm = (n) => `${n}mm`;

const s = StyleSheet.create({
  page: { paddingVertical: '11mm', fontFamily: 'Onest', fontSize: 8.6, lineHeight: 1.36, color: INK },
  // Spacing is all top margins: react-pdf counts a bottom margin when deciding whether a
  // block fits, and pushes blocks that do fit onto the next page.
  // Absolute positions are measured from the page edge, not the padded content area.
  panel: { position: 'absolute', top: 0, bottom: 0, left: 0, width: mm(SIDE_W), backgroundColor: PANEL },
  // The main column comes first in the file so text extraction reads name and experience
  // before the sidebar; row-reverse still draws the sidebar on the left.
  body: { flexDirection: 'row-reverse' },

  main: { flex: 1, paddingLeft: mm(MAIN_PAD_L), paddingRight: mm(MAIN_PAD_R) },
  name: { fontFamily: 'Bricolage', fontWeight: 600, fontSize: 26, lineHeight: 1, letterSpacing: -0.6, color: INK },
  title: { marginTop: '2mm', fontSize: 11.5, fontWeight: 500, color: ACCENT },
  stripe: { flexDirection: 'row', marginTop: '2.8mm' },
  stripeBit: { width: '7mm', height: '1.4mm', marginRight: '1mm', borderRadius: '0.7mm' },
  section: { marginTop: '4mm' },
  heading: { flexDirection: 'row', alignItems: 'center', paddingBottom: '1mm', marginBottom: '2mm', borderBottomWidth: 0.75, borderBottomColor: RULE },
  mark: { width: '2.4mm', height: '2.4mm', borderRadius: '0.6mm', marginRight: '2mm' },
  headingText: { fontSize: 8.5, fontWeight: 700, lineHeight: 1, textTransform: 'uppercase' },
  summary: { color: INK_2, fontSize: 8.7, lineHeight: 1.4 },
  entryGap: { marginTop: '2.2mm' },
  entryHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  role: { flex: 1, fontSize: 10.2, fontWeight: 600, lineHeight: 1.25, marginRight: '4mm' },
  when: { fontSize: 7.8, fontWeight: 500, color: INK_3, marginTop: 1.8 },
  org: { fontSize: 8.8, fontWeight: 500, color: ACCENT },
  text: { marginTop: '0.8mm', color: INK_2 },
  tags: { marginTop: '1mm', fontSize: 7.5, color: INK_3 },

  side: { width: mm(SIDE_W), paddingHorizontal: mm(SIDE_PAD), color: PANEL_INK },
  photo: { width: '26mm', height: '26mm', borderRadius: '13mm', objectFit: 'cover', borderWidth: 2, borderColor: TONES.green.fill, marginBottom: '1mm' },
  sideSection: { marginTop: '4.6mm' },
  sideHeading: { paddingBottom: '1.2mm', marginBottom: '2mm', borderBottomWidth: 0.75, borderBottomColor: PANEL_RULE },
  sideHeadingText: { fontSize: 8, fontWeight: 700, lineHeight: 1, textTransform: 'uppercase' },
  label: { fontSize: 6.8, fontWeight: 600, textTransform: 'uppercase', color: PANEL_INK_3 },
  value: { fontSize: 8.2, color: PANEL_INK, textDecoration: 'none' },
  url: { fontSize: 7.6, color: PANEL_INK_2, textDecoration: 'none' },
  pairGap: { marginTop: '1.6mm' },
  linkGap: { marginTop: '0.9mm' },
  groupName: { fontSize: 7.8, fontWeight: 600, color: PANEL_INK, marginBottom: '1mm' },
  groupGap: { marginTop: '1.6mm' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginRight: '-1mm' },
  chip: { fontSize: 7, lineHeight: 1, color: PANEL_INK_2, backgroundColor: PANEL_CHIP, borderRadius: '0.8mm', paddingVertical: '0.75mm', paddingHorizontal: '1.5mm', marginRight: '1mm', marginBottom: '1mm' },
  itemTitle: { fontSize: 8.2, fontWeight: 600, lineHeight: 1.3, color: PANEL_INK },
  itemText: { fontSize: 7.8, color: PANEL_INK_2 },
  plain: { fontSize: 8.2, color: PANEL_INK_2 },
  updated: { marginTop: '4.6mm', fontSize: 7, color: PANEL_INK_3 },

  // react-pdf misplaces absolute text whose content changes per page, so a static absolute
  // row holds the page-number text in normal flow, each part with a real width.
  footer: { position: 'absolute', top: '288mm', flexDirection: 'row', left: mm(SIDE_W + MAIN_PAD_L), right: mm(MAIN_PAD_R), fontSize: 7.5, color: INK_3 },
});

// "https://www.github.com/name/" -> "github.com/name". One too long for the sidebar breaks after
// its last fitting slash; react-pdf would otherwise hyphenate the break.
const URL_FITS = 34;
const shortUrl = (url = '') => {
  const short = url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '');
  const cut = short.length > URL_FITS ? short.lastIndexOf('/', URL_FITS) : -1;
  return cut > 0 ? `${short.slice(0, cut + 1)}\n${short.slice(cut + 1)}` : short;
};

// "January 2025 - April 2026" -> "Jan 2025 - Apr 2026"
const shortDates = (text = '') => String(text ?? '').replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/g, '$1');

// Drops street addresses: "39 Main Road, Melrose Arch, Johannesburg" -> "Melrose Arch, Johannesburg"
const area = (location = '') => String(location ?? '').split(',').map(x => x.trim()).filter(x => x && !/\d/.test(x)).slice(-2).join(', ');

// Newest first: current roles on top, then by end date, then by start date.
const newestFirst = (list) => [...list].sort((a, b) => {
  const end = (r) => (isCurrent(r) ? Infinity : startKey({ start: r.end }) ?? startKey(r) ?? -Infinity);
  return end(b) - end(a) || (startKey(b) ?? 0) - (startKey(a) ?? 0);
});

// Anything marked showOnCv: false in Firebase stays on the website but off the CV.
const onCv = (r) => r?.showOnCv !== false;

const Section = ({ title, tone, children }) => (
  <View style={s.section}>
    <View style={s.heading} minPresenceAhead={30}>
      <View style={[s.mark, { backgroundColor: TONES[tone].fill }]} />
      <Text style={[s.headingText, { color: TONES[tone].deep }]}>{title}</Text>
    </View>
    {children}
  </View>
);

const SideSection = ({ title, tone, first, children }) => (
  <View style={first ? null : s.sideSection}>
    <View style={s.sideHeading} minPresenceAhead={24}>
      <Text style={[s.sideHeadingText, { color: TONES[tone].soft }]}>{title}</Text>
    </View>
    {children}
  </View>
);

const CvDocument = ({ name, photo, personal, contact, social: allSocial, experience: allExperience, education: allEducation, certifications: allCerts, skills: allSkills, skillGroups, interests: allInterests, languages: allLanguages, summary, t, badges }) => {
  const experience = newestFirst(allExperience.filter(onCv));
  const education = newestFirst(allEducation.filter(onCv));
  const social = allSocial.filter(onCv);
  const hiddenGroups = new Set(skillGroups.filter(g => !onCv(g)).map(g => g.name));
  const interests = personal.cvInterests === false ? [] : allInterests;
  const languages = personal.cvLanguages === false ? [] : allLanguages;
  const portrait = personal.cvPhoto === false ? null : photo;

  const groups = [];
  allSkills.filter(x => !hiddenGroups.has(x.group)).forEach(({ label, group }) => {
    const key = group || '';
    let g = groups.find(x => x.name === key);
    if (!g) groups.push(g = { name: key, items: [] });
    if (!g.items.includes(label)) g.items.push(label);
  });

  const certs = allCerts.filter(onCv).map(toCredential)
    .filter(c => c.status !== 'planned' && c.name)
    .sort((a, b) => (a.status === 'earned' ? 0 : 1) - (b.status === 'earned' ? 0 : 1) || a.order - b.order);

  const reach = [
    contact.email && [t.cvEmailLabel, contact.email, `mailto:${contact.email}`],
    contact.phone && [t.cvPhoneLabel, contact.phone, `tel:${String(contact.phone).replace(/[^\d+]/g, '')}`],
    contact.location && [t.cvLocationLabel, contact.location],
  ].filter(Boolean);

  const updated = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <Document title={`${name} CV`} author={name}>
      <Page size="A4" style={s.page}>
        <View style={s.panel} fixed />

        <View style={s.body}>
          <View style={s.main}>
            <Text style={s.name}>{name}</Text>
            {personal.title && <Text style={s.title}>{personal.title}</Text>}
            <View style={s.stripe}>
              {STRIPE.map(tone => <View key={tone} style={[s.stripeBit, { backgroundColor: TONES[tone].fill }]} />)}
            </View>

            {summary && (
              <Section title={t.profileHeading} tone="blue">
                <Text style={s.summary}>{summary}</Text>
              </Section>
            )}

            {experience.length > 0 && (
              <Section title={t.experienceHeading} tone="green">
                {experience.map((e, i) => (
                  <View key={e.id ?? i} style={i > 0 && s.entryGap} wrap={false}>
                    <View style={s.entryHead}>
                      <Text style={s.role}>{e.role}</Text>
                      <Text style={s.when}>{shortDates(periodOf(e))}</Text>
                    </View>
                    <Text style={s.org}>{[e.company, area(e.location)].filter(Boolean).join(', ')}</Text>
                    {e.description && <Text style={s.text}>{e.description}</Text>}
                    {e.tags?.length > 0 && <Text style={s.tags}>{e.tags.join(' · ')}</Text>}
                  </View>
                ))}
              </Section>
            )}

            {education.length > 0 && (
              <Section title={t.educationHeading} tone="orange">
                {education.map((e, i) => (
                  <View key={e.id ?? i} style={i > 0 && s.entryGap} wrap={false}>
                    <View style={s.entryHead}>
                      <Text style={s.role}>{[e.degree, e.field].filter(Boolean).join(', ') || e.institution}</Text>
                      <Text style={s.when}>{shortDates(periodOf(e))}</Text>
                    </View>
                    {e.institution && <Text style={s.org}>{e.institution}</Text>}
                    {e.description && <Text style={s.text}>{e.description}</Text>}
                  </View>
                ))}
              </Section>
            )}
          </View>

          <View style={s.side}>
            {portrait && <Image style={s.photo} src={portrait} />}

            {reach.length > 0 && (
              <SideSection title={t.cvContactHeading} tone="blue" first={!portrait}>
                {reach.map(([label, value, href], i) => (
                  <View key={label} style={i > 0 && s.pairGap} wrap={false}>
                    <Text style={s.label}>{label}</Text>
                    {href ? <Link src={href} style={s.value}>{value}</Link> : <Text style={s.value}>{value}</Text>}
                  </View>
                ))}
              </SideSection>
            )}

            {groups.length > 0 && (
              <SideSection title={t.skillsHeading} tone="yellow">
                {groups.map((g, i) => (
                  <View key={g.name} style={i > 0 && s.groupGap} wrap={false}>
                    {g.name && <Text style={s.groupName}>{g.name}</Text>}
                    <View style={s.chips}>
                      {g.items.map(item => <Text key={item} style={s.chip}>{item}</Text>)}
                    </View>
                  </View>
                ))}
              </SideSection>
            )}

            {certs.length > 0 && (
              <SideSection title={t.certificationsHeading} tone="pink">
                {certs.map((c, i) => (
                  <View key={c.id ?? i} style={i > 0 && s.pairGap} wrap={false}>
                    <Text style={s.itemTitle}>{c.name}</Text>
                    <Text style={s.itemText}>
                      {c.status === 'earned'
                        ? [c.issuer, shortDates(c.date)].filter(Boolean).join(', ')
                        : [t.cvInProgress, c.status === 'booked' && c.date && `${badges.statusBooked} ${c.date}`].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                ))}
              </SideSection>
            )}

            {social.length > 0 && (
              <SideSection title={t.cvProfilesHeading} tone="green">
                {/* Each address names its own platform, so it needs no label; every one is a live link. */}
                {social.map((x, i) => (
                  <View key={x.key ?? i} style={i > 0 && s.linkGap} wrap={false}>
                    <Link src={x.url} style={s.url}>{shortUrl(x.url)}</Link>
                  </View>
                ))}
              </SideSection>
            )}

            {languages.length > 0 && (
              <SideSection title={t.cvLanguagesHeading} tone="orange">
                <Text style={s.plain}>{languages.join(', ')}</Text>
              </SideSection>
            )}

            {interests.length > 0 && (
              <SideSection title={t.cvInterestsHeading} tone="blue">
                <Text style={s.plain}>{interests.join(', ')}</Text>
              </SideSection>
            )}

            <Text style={s.updated}>{t.cvUpdated} {updated}</Text>
          </View>
        </View>

        {/* Pages 2 onwards carry the name and page number, in case the pages get separated. */}
        <View style={s.footer} fixed>
          <Text style={{ flex: 1 }} render={({ pageNumber }) => (pageNumber > 1 ? name : '')} />
          <Text style={{ flex: 1, textAlign: 'right' }} render={({ pageNumber, totalPages }) => (pageNumber > 1 ? `${t.cvPage} ${pageNumber} ${t.cvOf} ${totalPages}` : '')} />
        </View>
      </Page>
    </Document>
  );
};

// GitHub's /<user>.png redirect carries no CORS header, so fetch the avatar host directly.
const fetchable = (url) => url.replace(/^https:\/\/github\.com\/([^/]+)\.png$/i, 'https://avatars.githubusercontent.com/$1');

// The photo is inlined first, so a blocked or missing image drops it instead of failing the CV.
const inline = async (url) => {
  if (!url || url.startsWith('data:')) return url;
  try {
    const res = await fetch(fetchable(url));
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const renderCv = async (props) => {
  const photo = await inline(props.photo);
  return pdf(<CvDocument {...props} photo={photo} />).toBlob();
};
