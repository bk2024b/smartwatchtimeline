import { canonicalFor } from '@/lib/seo';
import { Footer } from '@/components/UI';

export async function generateMetadata() {
  return { title: 'Privacy Policy | SmartwatchTimeline', ...canonicalFor('/privacy') };
}

// Placeholder structure only — the actual policy text needs to reflect
// whatever analytics/affiliate partners end up wired in (see README:
// "Not included in this scaffold"). Written with no AdSense-specific
// language since that's off the table for this project.
export default function PrivacyPage() {
  return (
    <>
      <article className="max-w-2xl mx-auto prose">
        <h1>Privacy Policy</h1>
        <p>Last updated: [date]</p>
        <h2>Affiliate links</h2>
        <p>
          Some links on this site are affiliate links. If you make a purchase through one of these
          links, we may earn a commission at no additional cost to you.
        </p>
        <h2>Analytics</h2>
        <p>[To fill in once an analytics provider is wired in.]</p>
        <h2>Contact</h2>
        <p>[Contact email.]</p>
      </article>
      <Footer />
    </>
  );
}
