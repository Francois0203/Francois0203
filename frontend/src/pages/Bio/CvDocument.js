import { Buffer } from 'buffer/';
import { Document, Page, View, Text, Image, Font, StyleSheet, pdf } from '@react-pdf/renderer';
import onest400 from '@fontsource/onest/files/onest-latin-400-normal.woff?url';
import onest500 from '@fontsource/onest/files/onest-latin-500-normal.woff?url';
import onest600 from '@fontsource/onest/files/onest-latin-600-normal.woff?url';
import onest700 from '@fontsource/onest/files/onest-latin-700-normal.woff?url';
import bricolage600 from '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-600-normal.woff?url';
import { periodOf, isCurrent, startKey } from '../../content/records';
import { platformFor } from '../../components/SocialIcon';
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

const INK = '#16161a';
const INK_2 = '#3d3d45';
const INK_3 = '#6b6b75';
const ACCENT = '#2b33c4';
const RULE = '#d9d9e0';
const TONES = {
  blue: ['#5a63ff', '#2b33c4'],
  green: ['#35d6a3', '#08664b'],
  orange: ['#ff7d5e', '#b03a1e'],
  yellow: ['#ffde4d', '#6a5400'],
  pink: ['#bda8ff', '#5a3cc9'],
};

const s = StyleSheet.create({
  page: { paddingTop: '11mm', paddingHorizontal: '12mm', paddingBottom: '11mm', fontFamily: 'Onest', fontSize: 8.6, lineHeight: 1.36, color: INK },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '3.5mm' },
  who: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  photo: { width: '17mm', height: '17mm', borderRadius: '8.5mm', marginRight: '4mm', objectFit: 'cover', borderWidth: 0.75, borderColor: RULE },
  name: { fontFamily: 'Bricolage', fontWeight: 600, fontSize: 24, lineHeight: 1, letterSpacing: -0.48 },
  title: { marginTop: '1.5mm', fontSize: 11, fontWeight: 500, color: ACCENT },
  contact: { alignItems: 'flex-end', fontSize: 8.5, lineHeight: 1.5, color: INK_2, marginLeft: '8mm' },
  updated: { fontSize: 7.5, color: INK_3 },
  // Spacing is all top margins: react-pdf counts a bottom margin when deciding whether a
  // block fits, and pushes blocks that do fit onto the next page. The body's 0.4mm plus
  // the first section's 3.6mm gives the 4mm gap under the header.
  body: { flexDirection: 'row', marginTop: '0.4mm' },
  main: { flex: 1, marginRight: '6mm' },
  side: { width: '52mm', paddingLeft: '5mm', borderLeftWidth: 0.75, borderLeftColor: RULE },
  section: { marginTop: '3.6mm' },
  heading: { flexDirection: 'row', alignItems: 'center', marginBottom: '2mm', paddingBottom: '1mm', borderBottomWidth: 1.2 },
  mark: { width: '2.2mm', height: '2.2mm', borderRadius: '0.6mm', marginRight: '1.6mm', borderWidth: 0.5, borderColor: INK },
  headingText: { fontSize: 8, fontWeight: 700, lineHeight: 1, textTransform: 'uppercase' },
  muted: { color: INK_2 },
  entryGap: { marginTop: '2.4mm' },
  entryHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  role: { flex: 1, fontSize: 10, fontWeight: 600, lineHeight: 1.3, marginRight: '4mm' },
  when: { fontSize: 8, color: INK_3, marginTop: 1.5 },
  org: { fontSize: 9, fontWeight: 500, color: INK_2 },
  text: { marginTop: '0.6mm', color: INK_2 },
  tags: { marginTop: '1mm', fontSize: 7.5, color: INK_3 },
  itemGap: { marginTop: '1.6mm' },
  itemTitle: { fontSize: 8.5, fontWeight: 600, lineHeight: 1.3 },
  itemText: { fontSize: 8.5, color: INK_2 },
  certText: { fontSize: 8, color: INK_3 },
  link: { fontSize: 7.8, color: INK_2 },
  linkGap: { marginTop: '1mm' },
  linkName: { fontWeight: 600, color: INK },
  // Absolute text needs both edges set, or it gets no width and draws nothing.
  footer: { position: 'absolute', bottom: '5mm', left: '12mm', right: '12mm', fontSize: 7.5, color: INK_3 },
});

// "https://www.github.com/name/" -> "github.com/name". One too long for the sidebar breaks after
// its last fitting slash; react-pdf would otherwise hyphenate the break.
const URL_FITS = 33;
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
    <View style={[s.heading, { borderBottomColor: TONES[tone][0] }]} minPresenceAhead={30}>
      <View style={[s.mark, { backgroundColor: TONES[tone][0] }]} />
      <Text style={[s.headingText, { color: TONES[tone][1] }]}>{title}</Text>
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

  const updated = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <Document title={`${name} CV`} author={name}>
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          <View style={s.who}>
            {portrait && <Image style={s.photo} src={portrait} />}
            <View>
              <Text style={s.name}>{name}</Text>
              {personal.title && <Text style={s.title}>{personal.title}</Text>}
            </View>
          </View>
          <View style={s.contact}>
            {contact.email && <Text>{contact.email}</Text>}
            {contact.phone && <Text>{contact.phone}</Text>}
            {contact.location && <Text>{contact.location}</Text>}
            <Text style={s.updated}>{t.cvUpdated} {updated}</Text>
          </View>
        </View>

        <View style={s.body}>
          <View style={s.main}>
            {summary && (
              <Section title={t.profileHeading} tone="blue">
                <Text style={s.muted}>{summary}</Text>
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
            {groups.length > 0 && (
              <Section title={t.skillsHeading} tone="yellow">
                {groups.map((g, i) => (
                  <View key={g.name} style={i > 0 && s.itemGap} wrap={false}>
                    {g.name && <Text style={s.itemTitle}>{g.name}</Text>}
                    <Text style={s.itemText}>{g.items.join(', ')}</Text>
                  </View>
                ))}
              </Section>
            )}

            {certs.length > 0 && (
              <Section title={t.certificationsHeading} tone="pink">
                {certs.map((c, i) => (
                  <View key={c.id ?? i} style={i > 0 && s.itemGap} wrap={false}>
                    <Text style={s.itemTitle}>{c.name}</Text>
                    <Text style={s.certText}>
                      {c.status === 'earned'
                        ? [c.issuer, shortDates(c.date)].filter(Boolean).join(', ')
                        : [t.cvInProgress, c.status === 'booked' && c.date && `${badges.statusBooked} ${c.date}`].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                ))}
              </Section>
            )}

            {social.length > 0 && (
              <Section title={t.cvProfilesHeading} tone="blue">
                {social.map((x, i) => {
                  const p = platformFor(x.key, x.url);
                  return (
                    <View key={x.key ?? i} style={[s.link, i > 0 && s.linkGap]} wrap={false}>
                      <Text style={s.linkName}>{p.key === 'website' ? (x.platform || x.key) : p.label}</Text>
                      <Text>{shortUrl(x.url)}</Text>
                    </View>
                  );
                })}
              </Section>
            )}

            {languages.length > 0 && (
              <Section title={t.cvLanguagesHeading} tone="green">
                <Text style={s.itemText}>{languages.join(', ')}</Text>
              </Section>
            )}

            {interests.length > 0 && (
              <Section title={t.cvInterestsHeading} tone="orange">
                <Text style={s.itemText}>{interests.join(', ')}</Text>
              </Section>
            )}
          </View>
        </View>

        {/* Pages 2 onwards carry the name and page number, in case the pages get separated. */}
        <Text style={s.footer} fixed render={({ pageNumber }) => (pageNumber > 1 ? name : '')} />
        <Text
          style={[s.footer, { textAlign: 'right' }]}
          fixed
          render={({ pageNumber, totalPages }) => (pageNumber > 1 ? `${t.cvPage} ${pageNumber} ${t.cvOf} ${totalPages}` : '')}
        />
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
