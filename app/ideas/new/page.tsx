import Link from "next/link";

export default function NewIdeaPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>&larr; Back to all ideas</Link>
      </div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Create an Idea</h1>
      
      <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group">
          <label>Title</label>
          <input type="text" placeholder="Idea Title" required />
        </div>
        
        <div className="form-group">
          <label>Subtitle</label>
          <input type="text" placeholder="Short subtitle" />
        </div>

        <div className="form-group">
          <label>Goal</label>
          <textarea placeholder="Define the importance of the idea being created..." required style={{ minHeight: '80px', width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--fg)' }}></textarea>
        </div>

        <div style={{display: 'flex', gap: '16px'}}>
          <div className="form-group" style={{flex: 1}}>
            <label>Roadmap</label>
            <input type="text" placeholder="e.g. Design -> Prototyping -> Development" style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--fg)' }} />
          </div>
          <div className="form-group" style={{flex: 1}}>
            <label>Team</label>
            <input type="text" placeholder="e.g. Orange" style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--fg)' }} />
          </div>
        </div>

        <div className="form-group">
          <label>Idea Summary</label>
          <textarea placeholder="Describe your idea in more detail..." required style={{ minHeight: '120px', width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--fg)' }}></textarea>
        </div>

        <div className="form-group">
          <label>Creator</label>
          <input type="text" placeholder="Your name" style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--fg)' }} />
        </div>

        <div className="form-group">
          <label>Collaborators</label>
          <input type="text" placeholder="e.g. John Doe, Jane Smith" style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--fg)' }} />
        </div>

        <div className="form-group">
          <label>Repository Link</label>
          <input type="url" placeholder="https://github.com/..." style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--fg)' }} />
        </div>

        <div className="form-group">
          <label>In Progress</label>
          <input type="url" placeholder="https://..." style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--fg)' }} />
        </div>

        <div className="modal-actions" style={{ marginTop: '32px' }}>
          <Link href="/"><button type="button" className="btn-cancel">Cancel</button></Link>
          <button type="button" className="btn-submit">Submit Idea</button>
        </div>
      </form>
    </div>
  );
}
