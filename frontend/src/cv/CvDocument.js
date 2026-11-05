import { Buffer } from 'buffer/';
import { Document, Page, View, Text, Image, Link, Font, StyleSheet, pdf } from '@react-pdf/renderer';
import onest400 from '@fontsource/onest/files/onest-latin-400-normal.woff?url';
import onest500 from '@fontsource/onest/files/onest-latin-500-normal.woff?url';
import onest600 from '@fontsource/onest/files/onest-latin-600-normal.woff?url';
import onest700 from '@fontsource/onest/files/onest-latin-700-normal.woff?url';
import bricolage600 from '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-600-normal.woff?url';
import { periodOf, isCurrent, startKey } from '../content/records';
import { SITE_URL } from '../content/seo';
import { toCredential } from '../components/Credentials';

// The CV as a real A4 PDF, built in the browser. Loaded only when someone asks for it.

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
// Whole words only, a hyphenated name or link reads badly on a CV.
Font.registerHyphenationCallback(word => [word]);

// A PDF cannot read CSS variables, so the site's colours are restated here.
const INK = '#12131c';
const INK_2 = '#3d4152';
const INK_3 = '#6f7488';
const NIGHT = '#151834';
const NIGHT_TEXT = '#c8cce6';
const RULE = '#e2e4ee';
const SIDE = '#f5f6fb';

// The five site tones: base for marks, ink for text on white, soft for fills, edge for outlines.
const TONE = {
  blue: { base: '#5b6cff', ink: '#2f3bd1', soft: '#eceefe', edge: '#c3c9ff' },
  green: { base: '#20c58b', ink: '#067a52', soft: '#e3f7ef', edge: '#a7e8d0' },
  orange: { base: '#ff7a4d', ink: '#b9401b', soft: '#fff0ea', edge: '#ffc8b5' },
  pink: { base: '#a87bff', ink: '#6236d8', soft: '#f2ecff', edge: '#d8c6ff' },
  yellow: { base: '#ffc63a', ink: '#7a5600', soft: '#fff6dc', edge: '#ffe08f' },
};
const TONES = ['blue', 'green', 'orange', 'pink', 'yellow'];

const SIDE_W = 60;
const PAD = 12;
const mm = (n) => `${n}mm`;

const s = StyleSheet.create({
  page: { paddingBottom: '12mm', fontFamily: 'Onest', fontSize: 8.1, lineHeight: 1.33, color: INK },
  sideFill: { position: 'absolute', top: 0, bottom: 0, right: 0, width: mm(SIDE_W), backgroundColor: SIDE },

  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: NIGHT, paddingTop: '8mm', paddingBottom: '6.5mm', paddingLeft: mm(PAD), paddingRight: mm(PAD) },
  headerText: { flex: 1, paddingRight: '6mm' },
  name: { fontFamily: 'Bricolage', fontWeight: 600, fontSize: 27, lineHeight: 1, color: '#ffffff' },
  title: { marginTop: '2mm', fontSize: 11.5, fontWeight: 500, color: '#a9b2ff' },
  reach: { flexDirection: 'row', flexWrap: 'wrap', marginTop: '3.4mm' },
  reachItem: { flexDirection: 'row', alignItems: 'center', marginRight: '4.5mm', marginTop: '1mm' },
  reachDot: { width: '1.5mm', height: '1.5mm', borderRadius: '0.75mm', marginRight: '1.5mm' },
  reachText: { fontSize: 8, color: NIGHT_TEXT, textDecoration: 'none' },
  photoRing: { padding: '0.9mm', borderRadius: '14mm', backgroundColor: TONE.blue.base },
  photoGap: { padding: '0.7mm', borderRadius: '13.1mm', backgroundColor: NIGHT },
  photo: { width: '24.8mm', height: '24.8mm', borderRadius: '12.4mm', objectFit: 'cover' },

  stripe: { flexDirection: 'row', height: '1.5mm' },
  stripeCell: { flex: 1 },

  body: { flexDirection: 'row' },
  main: { flex: 1, paddingLeft: mm(PAD), paddingRight: mm(6) },
  side: { width: mm(SIDE_W), paddingLeft: mm(5.5), paddingRight: mm(PAD - 3) },

  section: { marginTop: '3.8mm' },
  heading: { flexDirection: 'row', alignItems: 'center', marginBottom: '2mm' },
  headingMark: { width: '2.3mm', height: '2.3mm', borderRadius: '0.6mm', marginRight: '2mm' },
  headingText: { fontSize: 10, fontWeight: 700, color: INK, marginRight: '2.5mm' },
  headingRule: { flex: 1, height: 0.75, backgroundColor: RULE },

  summary: { fontSize: 8.4, lineHeight: 1.42, color: INK_2 },

  entry: { flexDirection: 'row' },
  rail: { width: '5mm', alignItems: 'center' },
  railLine: { width: 1, backgroundColor: RULE },
  railTop: { height: '1.2mm' },
  railGap: { height: '3.7mm' },
  railRest: { flexGrow: 1 },
  node: { width: '2.6mm', height: '2.6mm', borderRadius: '1.3mm', backgroundColor: '#ffffff', borderWidth: 1.5 },
  entryBody: { flex: 1, paddingLeft: '1.6mm' },
  entryGap: { paddingTop: '2.5mm' },
  entryHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  role: { flex: 1, fontSize: 9.6, fontWeight: 600, lineHeight: 1.25, marginRight: '3mm', color: INK },
  when: { fontSize: 7.2, fontWeight: 600, lineHeight: 1, borderRadius: '1.2mm', paddingVertical: '0.9mm', paddingHorizontal: '1.8mm' },
  org: { marginTop: '0.3mm', fontSize: 8.3, fontWeight: 500 },
  text: { marginTop: '0.8mm', color: INK_2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: '1.4mm' },
  tag: { fontSize: 6.8, lineHeight: 1, borderRadius: '1mm', paddingVertical: '0.8mm', paddingHorizontal: '1.5mm', marginRight: '1.1mm', marginBottom: '1mm' },

  sideSection: { marginTop: '4.2mm' },
  groupHead: { flexDirection: 'row', alignItems: 'center', marginBottom: '1.2mm' },
  groupDot: { width: '1.7mm', height: '1.7mm', borderRadius: '0.85mm', marginRight: '1.5mm' },
  groupName: { fontSize: 7.9, fontWeight: 600, color: INK },
  groupGap: { marginTop: '2.2mm' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginRight: '-1mm' },
  chip: { fontSize: 6.9, lineHeight: 1, color: INK_2, backgroundColor: '#ffffff', borderWidth: 0.7, borderRadius: '1mm', paddingVertical: '0.8mm', paddingHorizontal: '1.5mm', marginRight: '1mm', marginBottom: '1mm' },
  cert: { borderLeftWidth: 2, paddingLeft: '2.2mm', paddingVertical: '0.6mm' },
  itemTitle: { fontSize: 8.2, fontWeight: 600, lineHeight: 1.3, color: INK },
  itemText: { fontSize: 7.4, color: INK_3, marginTop: '0.3mm' },
  pairGap: { marginTop: '2mm' },
  linkRow: { flexDirection: 'row', alignItems: 'flex-start' },
  linkDot: { width: '1.3mm', height: '1.3mm', borderRadius: '0.65mm', marginRight: '1.6mm', marginTop: '1.3mm' },
  url: { fontSize: 7.6, color: INK_2, textDecoration: 'none' },
  linkGap: { marginTop: '0.9mm' },
  plain: { fontSize: 8, color: INK_2 },

  footer: { position: 'absolute', top: '288.5mm', left: mm(PAD), right: mm(PAD), flexDirection: 'row', fontSize: 6.8, color: INK_3 },
});

// "https://www.github.com/name/" -> "github.com/name", broken after a slash when too long.
const URL_FITS = 34;
const shortUrl = (url = '') => {
  const short = url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '');
  const cut = short.length > URL_FITS ? short.lastIndexOf('/', URL_FITS) : -1;
  return cut > 0 ? `${short.slice(0, cut + 1)}\n${short.slice(cut + 1)}` : short;
};

// "January 2025 - April 2026" -> "Jan 2025 - Apr 2026"
const shortDates = (text = '') => String(text ?? '').replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/g, '$1');

// Drops street numbers: "39 Main Road, Melrose Arch, Johannesburg" -> "Melrose Arch, Johannesburg"
const area = (location = '') => String(location ?? '').split(',').map(x => x.trim()).filter(x => x && !/\d/.test(x)).slice(-2).join(', ');

// Newest first: current roles on top, then by end date, then by start date.
const newestFirst = (list) => [...list].sort((a, b) => {
  const end = (r) => (isCurrent(r) ? Infinity : startKey({ start: r.end }) ?? startKey(r) ?? -Infinity);
  return end(b) - end(a) || (startKey(b) ?? 0) - (startKey(a) ?? 0);
});

// Anything marked showOnCv: false stays on the website but off the CV.
const onCv = (r) => r?.showOnCv !== false;

const Heading = ({ title, tone = 'blue' }) => (
  <View style={s.heading} minPresenceAhead={30}>
    <View style={[s.headingMark, { backgroundColor: TONE[tone].base }]} />
    <Text style={s.headingText}>{title}</Text>
    <View style={s.headingRule} />
  </View>
);

// One stop on the timeline: a dot and its line on the left, the details on the right.
const Entry = ({ first, last, current, title, when, org, text, tags, tone = 'blue' }) => {
  const c = TONE[tone];
  return (
    <View style={s.entry} wrap={false}>
      <View style={s.rail}>
        <View style={[s.railLine, first ? s.railTop : s.railGap, first && { backgroundColor: 'transparent' }]} />
        <View style={[s.node, { borderColor: c.base }, current && { backgroundColor: c.base }]} />
        <View style={[s.railLine, s.railRest, last && { backgroundColor: 'transparent' }]} />
      </View>
      <View style={[s.entryBody, !first && s.entryGap]}>
        <View style={s.entryHead}>
          <Text style={s.role}>{title}</Text>
          {when && <Text style={[s.when, { color: c.ink, backgroundColor: c.soft }]}>{when}</Text>}
        </View>
        {org && <Text style={[s.org, { color: c.ink }]}>{org}</Text>}
        {text && <Text style={s.text}>{text}</Text>}
        {tags?.length > 0 && (
          <View style={s.tags}>
            {tags.map(tag => <Text key={tag} style={[s.tag, { color: c.ink, backgroundColor: c.soft }]}>{tag}</Text>)}
          </View>
        )}
      </View>
    </View>
  );
};

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
    contact.email && [contact.email, `mailto:${contact.email}`],
    contact.phone && [contact.phone, `tel:${String(contact.phone).replace(/[^\d+]/g, '')}`],
    [shortUrl(SITE_URL), SITE_URL],
    contact.location && [area(contact.location) || contact.location],
  ].filter(Boolean);

  const updated = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <Document title={`${name} CV`} author={name} subject={personal.title ?? 'CV'}>
      <Page size="A4" style={s.page}>
        <View style={s.sideFill} fixed />

        <View style={s.header}>
          <View style={s.headerText}>
            <Text style={s.name}>{name}</Text>
            {personal.title && <Text style={s.title}>{personal.title}</Text>}
            <View style={s.reach}>
              {reach.map(([value, href], i) => (
                <View key={value} style={s.reachItem}>
                  <View style={[s.reachDot, { backgroundColor: TONE[TONES[i % TONES.length]].base }]} />
                  {href ? <Link src={href} style={s.reachText}>{value}</Link> : <Text style={s.reachText}>{value}</Text>}
                </View>
              ))}
            </View>
          </View>
          {portrait && (
            <View style={s.photoRing}>
              <View style={s.photoGap}>
                <Image style={s.photo} src={portrait} />
              </View>
            </View>
          )}
        </View>

        <View style={s.stripe}>
          {TONES.map(tone => <View key={tone} style={[s.stripeCell, { backgroundColor: TONE[tone].base }]} />)}
        </View>

        <View style={s.body}>
          <View style={s.main}>
            {summary && (
              <View style={s.section}>
                <Heading title={t.profileHeading} tone="blue" />
                <Text style={s.summary}>{summary}</Text>
              </View>
            )}

            {experience.length > 0 && (
              <View style={s.section}>
                <Heading title={t.experienceHeading} tone="green" />
                <View>
                  {experience.map((e, i) => (
                    <Entry
                      key={e.id ?? i}
                      tone="green"
                      first={i === 0}
                      last={i === experience.length - 1}
                      current={isCurrent(e)}
                      title={e.role}
                      when={shortDates(periodOf(e))}
                      org={[e.company, area(e.location)].filter(Boolean).join(', ')}
                      text={e.description}
                      tags={e.tags}
                    />
                  ))}
                </View>
              </View>
            )}

            {education.length > 0 && (
              <View style={s.section}>
                <Heading title={t.educationHeading} tone="orange" />
                <View>
                  {education.map((e, i) => (
                    <Entry
                      key={e.id ?? i}
                      tone="orange"
                      first={i === 0}
                      last={i === education.length - 1}
                      current={isCurrent(e)}
                      title={[e.degree, e.field].filter(Boolean).join(', ') || e.institution}
                      when={shortDates(periodOf(e))}
                      org={e.institution}
                      text={e.description}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={s.side}>
            {groups.length > 0 && (
              <View style={s.sideSection}>
                <Heading title={t.skillsHeading} tone="pink" />
                {groups.map((g, i) => {
                  const c = TONE[TONES[i % TONES.length]];
                  return (
                    <View key={g.name} style={i > 0 && s.groupGap} wrap={false}>
                      {g.name && (
                        <View style={s.groupHead}>
                          <View style={[s.groupDot, { backgroundColor: c.base }]} />
                          <Text style={s.groupName}>{g.name}</Text>
                        </View>
                      )}
                      <View style={s.chips}>
                        {g.items.map(item => <Text key={item} style={[s.chip, { borderColor: c.edge }]}>{item}</Text>)}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {certs.length > 0 && (
              <View style={s.sideSection}>
                <Heading title={t.certificationsHeading} tone="yellow" />
                {certs.map((c, i) => (
                  <View key={c.id ?? i} style={[s.cert, { borderColor: TONE.yellow.base }, i > 0 && s.pairGap]} wrap={false}>
                    <Text style={s.itemTitle}>{c.name}</Text>
                    <Text style={s.itemText}>
                      {c.status === 'earned'
                        ? [c.issuer, shortDates(c.date)].filter(Boolean).join(', ')
                        : [t.cvInProgress, c.status === 'booked' && c.date && `${badges.statusBooked} ${c.date}`].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {social.length > 0 && (
              <View style={s.sideSection}>
                <Heading title={t.cvProfilesHeading} tone="blue" />
                {social.map((x, i) => (
                  <View key={x.key ?? i} style={[s.linkRow, i > 0 && s.linkGap]} wrap={false}>
                    <View style={[s.linkDot, { backgroundColor: TONE[TONES[i % TONES.length]].base }]} />
                    <Link src={x.url} style={s.url}>{shortUrl(x.url)}</Link>
                  </View>
                ))}
              </View>
            )}

            {languages.length > 0 && (
              <View style={s.sideSection}>
                <Heading title={t.cvLanguagesHeading} tone="green" />
                <Text style={s.plain}>{languages.join(', ')}</Text>
              </View>
            )}

            {interests.length > 0 && (
              <View style={s.sideSection}>
                <Heading title={t.cvInterestsHeading} tone="orange" />
                <Text style={s.plain}>{interests.join(', ')}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={{ flex: 1 }}>{name}, {t.cvUpdated.toLowerCase()} {updated}</Text>
          <Text style={{ flex: 1, textAlign: 'right' }} render={({ pageNumber, totalPages }) => (totalPages > 1 ? `${t.cvPage} ${pageNumber} ${t.cvOf} ${totalPages}` : '')} />
        </View>
      </Page>
    </Document>
  );
};

// The photo is inlined first, so a blocked image drops it instead of failing the CV.
const inline = async (url) => {
  if (!url || url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
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
