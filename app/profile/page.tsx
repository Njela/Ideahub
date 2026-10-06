"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    firstName: "Helga",
    lastName: "Windle",
    email: "helga.windle@example.com",
    role: "Product Manager",
    department: "Sales & Marketing",
    bio: "Passionate about creating tools that help our customers succeed.",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile saved successfully!");
  };

  return (
    <div className="ideas-layout">
      <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div className="page-header">
          <h1>Team Member Profile</h1>
        </div>

        <form onSubmit={handleSave} style={{ background: 'white', padding: '32px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="filter-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>First Name</label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px' }} 
              />
            </div>
            <div className="filter-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>Last Name</label>
              <input 
                type="text" 
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>Email Address</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px' }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="filter-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>Role</label>
              <input 
                type="text" 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px' }} 
              />
            </div>
            <div className="filter-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>Department</label>
              <select 
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', background: 'white' }}
              >
                <option>Sales & Marketing</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>Human Resources</option>
                <option>Operations</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>Bio</label>
            <textarea 
              rows={4}
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', resize: 'vertical' }} 
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <Link href="/" style={{ padding: '10px 24px', border: '1px solid var(--line)', borderRadius: '4px', textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>Cancel</Link>
            <button type="submit" style={{ padding: '10px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>Save Profile</button>
          </div>
        </form>
      </div>
    </div>
  );
}
