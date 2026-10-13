"use client";

import Link from "next/link";
import { useState } from "react";
import { createIdea } from "@/app/actions";

export default function NewIdeaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createIdea(formData);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>
          &larr; Back to all ideas
        </Link>
      </div>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "24px" }}>Create an Idea</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="form-group">
          <label>Title *</label>
          <input
            name="title"
            type="text"
            placeholder="Idea Title"
            required
            style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
          />
        </div>

        <div className="form-group">
          <label>Subtitle</label>
          <input
            name="subtitle"
            type="text"
            placeholder="Short subtitle"
            style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            defaultValue="Business"
            style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
          >
            <option value="Business">Business</option>
            <option value="Technology">Technology</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Lifestyle">Lifestyle</option>
          </select>
        </div>

        <div className="form-group">
          <label>Goal</label>
          <textarea
            name="goal"
            placeholder="Define the importance of the idea being created..."
            required
            style={{ minHeight: "80px", width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
          ></textarea>
        </div>

        <div className="form-group">
          <label>Roadmap</label>
          <input
            name="roadmap"
            type="text"
            placeholder="e.g. Design -> Prototyping -> Development"
            defaultValue="Design -> Prototyping -> Development"
            style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
          />
        </div>

        <div className="form-group">
          <label>Idea Summary</label>
          <textarea
            name="description"
            placeholder="Describe your idea in more detail..."
            required
            style={{ minHeight: "120px", width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
          ></textarea>
        </div>

        <div className="form-group">
          <label>Creator</label>
          <input
            name="creator"
            type="text"
            placeholder="Your name"
            defaultValue="Helga Windle"
            style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
          />
        </div>

        <div className="form-group">
          <label>Collaborators</label>
          <input
            name="collaborators"
            type="text"
            placeholder="e.g. John Doe, Jane Smith"
            style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
          />
        </div>

        <div className="form-group">
          <label>Repository Link</label>
          <input
            name="repoUrl"
            type="url"
            placeholder="https://github.com/..."
            style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
          />
        </div>

        <div className="form-group">
          <label>In Progress</label>
          <input
            name="inProgressUrl"
            type="url"
            placeholder="https://..."
            style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
          />
        </div>

        <div className="modal-actions" style={{ marginTop: "32px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <Link href="/">
            <button type="button" className="btn-cancel" style={{ padding: "10px 24px", background: "transparent", border: "1px solid var(--line)", borderRadius: "4px", color: "var(--fg)", cursor: "pointer" }}>
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-submit"
            style={{ padding: "10px 24px", background: "var(--accent)", color: "var(--bg)", border: "none", borderRadius: "4px", cursor: isSubmitting ? "not-allowed" : "pointer", fontWeight: 500 }}
          >
            {isSubmitting ? "Submitting..." : "Submit Idea"}
          </button>
        </div>
      </form>
    </div>
  );
}
