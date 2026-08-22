import React, { useState, useRef, useMemo } from 'react';

// Canonical rank ladder. Must cover every value present in centurymember.level —
// see selectMember/levelOptions below for the guard that preserves anything not listed here.
const LEVEL_OPTIONS = [
  { value: '5 Dan', label: '5 Dan' },
  { value: '4 Dan', label: '4 Dan' },
  { value: '3 Dan', label: '3 Dan' },
  { value: '2 Dan', label: '2 Dan' },
  { value: '1 Dan', label: '1 Dan (Shodan)' },
  { value: '1 Kyu', label: '1 Kyu' },
  { value: '2 Kyu', label: '2 Kyu' },
  { value: '3 Kyu', label: '3 Kyu' },
  { value: '4 Kyu', label: '4 Kyu' },
  { value: '5 Kyu', label: '5 Kyu' },
  { value: '6 Kyu', label: '6 Kyu' },
  { value: '7 Kyu', label: '7 Kyu' },
  { value: '', label: 'Beginner / No rank' },
];

const emptyForm = {
  member_id: '',
  name: '',
  hangeul: '',
  altname: '',
  level: '',
  status: 'active',
  is_adult: true,
  start_date: '',
};

const ManageMembers = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fileInputRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchMsg('');
    setSearchResults([]);
    try {
      const res = await fetch(`/api/search-member?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      if (data.members.length === 0) {
        setSearchMsg('No members found.');
      } else if (data.members.length === 1) {
        selectMember(data.members[0]);
      } else {
        setSearchResults(data.members);
      }
    } catch (err) {
      setSearchMsg('Error: ' + String(err?.message || err));
    } finally {
      setSearching(false);
    }
  };

  const selectMember = (member) => {
    setForm({
      member_id: member.member_id,
      name: member.name || '',
      hangeul: member.hangeul || '',
      altname: member.altname || '',
      level: member.level || '',
      status: member.status || (member.is_active ? 'active' : 'inactive'),
      is_adult: !!member.is_adult,
      start_date: member.start_date || '',
    });
    setCurrentPhoto(member.img
      ? (member.img.startsWith('http') ? member.img : `/profile/${member.img}`)
      : null);
    setPreviewUrl(null);
    setPhotoFile(null);
    setSearchResults([]);
    setSaveMsg('');
  };

  // A level in the DB that is not on the ladder above stays selectable rather than
  // falling back to the first option and silently overwriting the member's rank.
  const levelOptions = useMemo(() => (
    form.level && !LEVEL_OPTIONS.some((o) => o.value === form.level)
      ? [{ value: form.level, label: `${form.level} (existing)` }, ...LEVEL_OPTIONS]
      : LEVEL_OPTIONS
  ), [form.level]);

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.member_id) return;
    setSaving(true);
    setSaveMsg('');

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (photoFile) fd.append('photo', photoFile);

    try {
      const res = await fetch('/api/update-member', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      if (data.img) setCurrentPhoto(data.img);
      setPreviewUrl(null);
      setPhotoFile(null);
      setSaveMsg('Saved successfully. Members page will reflect the change.');
    } catch (err) {
      setSaveMsg('Error: ' + String(err?.message || err));
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 5000);
    }
  };

  const photoSrc = previewUrl || currentPhoto;

  return (
    <div className='container my-12 mx-auto px-4 md:px-12'>
      <h1 className='text-2xl font-bold mb-8'>Manage Members</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className='flex gap-3 mb-6'>
        <input
          type='text'
          className='input input-bordered flex-1 max-w-sm'
          placeholder='Search by name or Korean name...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className='btn btn-primary btn-sm' type='submit' disabled={searching}>
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searchMsg && <p className='text-sm text-gray-500 mb-4'>{searchMsg}</p>}

      {/* Multiple results list */}
      {searchResults.length > 1 && (
        <ul className='menu bg-base-200 rounded-box mb-6 max-w-sm'>
          {searchResults.map((m) => (
            <li key={m.member_id}>
              <button type='button' onClick={() => selectMember(m)}>
                {m.altname || m.name}
                {m.hangeul ? ` (${m.hangeul})` : ''}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Edit form */}
      {form.member_id && (
        <form onSubmit={handleSave} className='space-y-6 max-w-2xl'>

          {/* Photo */}
          <div className='flex items-start gap-6'>
            <div className='flex-shrink-0'>
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt='Profile'
                  className='w-32 h-32 rounded-lg object-cover border border-gray-200'
                />
              ) : (
                <div className='w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs border border-gray-200'>
                  No photo
                </div>
              )}
            </div>
            <div className='flex flex-col gap-2'>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handlePhotoChange}
              />
              <button
                type='button'
                className='btn btn-outline btn-sm'
                onClick={() => fileInputRef.current?.click()}
              >
                {photoSrc ? 'Change photo' : 'Upload photo'}
              </button>
              <p className='text-xs text-gray-500'>
                Any size/colour — auto-converted to 500×500 B&W JPEG
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1'>
                Name
              </label>
              <input
                className='input input-bordered w-full'
                name='name'
                value={form.name}
                onChange={handleFieldChange}
                required
              />
            </div>
            <div>
              <label className='block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1'>
                Korean Name
              </label>
              <input
                className='input input-bordered w-full'
                name='hangeul'
                value={form.hangeul}
                onChange={handleFieldChange}
              />
            </div>
            <div>
              <label className='block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1'>
                Preferred Name
              </label>
              <input
                className='input input-bordered w-full'
                name='altname'
                value={form.altname}
                onChange={handleFieldChange}
                placeholder='Leave blank to use Name'
              />
            </div>
            <div>
              <label className='block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1'>
                Level
              </label>
              <select
                className='select select-bordered w-full'
                name='level'
                value={form.level}
                onChange={handleFieldChange}
              >
                {levelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1'>
                Start Date
              </label>
              <input
                className='input input-bordered w-full'
                type='date'
                name='start_date'
                value={form.start_date}
                onChange={handleFieldChange}
              />
            </div>
          </div>

          <div className='flex gap-6'>
            <label className='flex items-center gap-2'>
              <span className='text-sm'>Status</span>
              <select
                className='select select-bordered select-sm'
                name='status'
                value={form.status}
                onChange={handleFieldChange}
              >
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
                <option value='pending'>Pending</option>
              </select>
            </label>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                className='checkbox'
                name='is_adult'
                checked={form.is_adult}
                onChange={handleFieldChange}
              />
              <span className='text-sm'>Adult</span>
            </label>
          </div>

          <div className='flex items-center gap-4'>
            <button className='btn btn-primary btn-sm' type='submit' disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            {saveMsg && (
              <span className={`text-sm ${saveMsg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                {saveMsg}
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default ManageMembers;
