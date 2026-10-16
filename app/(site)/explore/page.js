import { getContent } from '../../../lib/store';
import ExploreFeed from '../../../components/ExploreFeed';

export const metadata = { title: 'Explore PROGRESS TECH HOME' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Explore({ searchParams }) {
  let items = [];
  try { items = await getContent(); } catch (e) { items = []; }
  const q = (searchParams && searchParams.q ? String(searchParams.q) : '');

  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Live arsenal</div>
        <h1>Explore PROGRESS TECH HOME</h1>
        <p className="muted">Tools, videos, files and links published from the admin dashboard appear here in real time.</p>
        <form className="searchbar" method="get" action="/explore">
          <input name="q" defaultValue={q} placeholder="Search tools, videos, files..." />
          <button className="btn btn-cyan" type="submit">Search</button>
        </form>
        <ExploreFeed initialItems={items} query={q} />
      </div>
    </section>
  );
}
