import Link from "next/link";

export default function Home() {
  return (
    <div className="ideas-layout">
      <div className="main-content">
        <div className="page-header" style={{justifyContent: 'flex-end'}}>
          <div className="search-box">
            <input type="text" placeholder="Search" />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="tabs">
          <div className="tab active">All Ideas</div>
          <div className="tab">My Ideas</div>
        </div>

        <div className="filters-bar">
          <div className="filter-group">
            <label>Status</label>
            <select>
              <option>Any status</option>
              <option>Proposed</option>
              <option>In Review</option>
              <option>Approved</option>
              <option>In Progress</option>
              <option>Done</option>
              <option>Shelved</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <select>
              <option>All categories</option>
              <option>Business</option>
              <option>Technology</option>
              <option>Education</option>
              <option>Health</option>
              <option>Lifestyle</option>
            </select>
          </div>
          <div className="filter-group sort-by">
            <label>Sort by</label>
            <select>
              <option>Most recent</option>
              <option>Most voted</option>
              <option>Oldest</option>
            </select>
          </div>
        </div>

        <ul className="idea-list">
          <li className="idea-item">
            <div className="vote-box">
              <button className="vote-btn">^</button>
              <span className="vote-count">18</span>
              <button className="vote-btn">v</button>
            </div>
            <div className="idea-details">
              <h3><Link href="/ideas/1" style={{textDecoration: 'none', color: 'inherit'}}>ACME Customer Sales Product</Link></h3>
              <div className="idea-meta">
                by Helga Windle • Created 6mo ago • <span className="status"><span className="status-icon">🚀</span> Submitted</span>
              </div>
              <div className="idea-tags">
                <span className="tag">Increase Innovation</span>
              </div>
            </div>
          </li>

          <li className="idea-item">
            <div className="vote-box">
              <button className="vote-btn">^</button>
              <span className="vote-count">10</span>
              <button className="vote-btn">v</button>
            </div>
            <div className="idea-details">
              <h3><Link href="/ideas/2" style={{textDecoration: 'none', color: 'inherit'}}>Green roof on HQ</Link></h3>
              <div className="idea-meta">
                by Troy Mccoy (Team Member) • Created 9mo ago • <span className="status"><span className="status-icon">ℹ️</span> Need more information</span>
              </div>
              <div className="idea-tags">
                <span className="tag">Increase Innovation</span>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div className="sidebar">
        <div className="share-idea">
          <p>Have an Idea? Share it!</p>
          <Link href="/ideas/new"><button className="create-btn">Create an Idea</button></Link>
        </div>
      </div>
    </div>
  );
}
