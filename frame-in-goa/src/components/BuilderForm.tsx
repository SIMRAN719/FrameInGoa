import { useState, type FormEvent, type KeyboardEvent } from 'react';
import type { BuilderProfile, Member } from '../lib/types';
import { MAX_MEMBERS } from '../lib/shareLink';
import './BuilderForm.css';

interface BuilderFormProps {
  onSubmit: (profile: BuilderProfile) => void;
}

const STACK_SUGGESTIONS = ['React', 'Node.js', 'Python', 'AI/ML', 'Flutter', 'Design', 'Go', 'Web3'];

interface MemberDraft {
  id: string;
  name: string;
  stack: string[];
  stackInput: string;
  photo: string | null;
}

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `m-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emptyMember(): MemberDraft {
  return { id: makeId(), name: '', stack: [], stackInput: '', photo: null };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const BuilderForm = ({ onSubmit }: BuilderFormProps) => {
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<MemberDraft[]>([emptyMember()]);
  const [error, setError] = useState<string | null>(null);

  const updateMember = (id: string, patch: Partial<MemberDraft>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const addStackTag = (id: string, raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, stack: m.stack.includes(tag) ? m.stack : [...m.stack, tag], stackInput: '' } : m)),
    );
  };

  const removeStackTag = (id: string, tag: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, stack: m.stack.filter((t) => t !== tag) } : m)));
  };

  const handleStackKeyDown = (id: string, stackInput: string, stack: string[]) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addStackTag(id, stackInput);
    } else if (e.key === 'Backspace' && stackInput === '' && stack.length > 0) {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, stack: m.stack.slice(0, -1) } : m)));
    }
  };

  const handlePhotoChange = (id: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    updateMember(id, { photo: dataUrl });
  };

  const addMember = () => {
    if (members.length >= MAX_MEMBERS) return;
    setMembers((prev) => [...prev, emptyMember()]);
  };

  const removeMember = (id: string) => {
    setMembers((prev) => (prev.length > 1 ? prev.filter((m) => m.id !== id) : prev));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const finalMembers: Member[] = members.map((m) => ({
      name: m.name.trim(),
      stack: m.stackInput.trim() ? [...m.stack, m.stackInput.trim()] : m.stack,
      photo: m.photo,
    }));

    if (!teamName.trim()) {
      setError('Give your crew a team name.');
      return;
    }
    if (finalMembers.some((m) => !m.name)) {
      setError('Every teammate needs a name.');
      return;
    }
    if (finalMembers.every((m) => m.stack.length === 0)) {
      setError('Add at least one tech tag somewhere in the squad.');
      return;
    }
    setError(null);
    onSubmit({ teamName: teamName.trim(), members: finalMembers });
  };

  return (
    <form className="builder-form" onSubmit={handleSubmit}>
      <div className="builder-form__field">
        <label htmlFor="team-name" className="builder-form__label">
          Team name
        </label>
        <input
          id="team-name"
          type="text"
          className="builder-form__input"
          placeholder="e.g. Byte Me Goa"
          maxLength={40}
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
      </div>

      <div className="builder-form__members">
        {members.map((member, index) => (
          <div className="builder-form__member" key={member.id}>
            <div className="builder-form__member-header">
              <span className="builder-form__member-index">Builder {index + 1}</span>
              {members.length > 1 && (
                <button type="button" className="builder-form__btn-text" onClick={() => removeMember(member.id)}>
                  Remove
                </button>
              )}
            </div>

            <div className="builder-form__photo-row">
              <label className="builder-form__photo-preview">
                {member.photo ? <img src={member.photo} alt="" /> : <span>📷</span>}
                <input type="file" accept="image/*" capture="user" onChange={handlePhotoChange(member.id)} hidden />
              </label>
              <input
                type="text"
                className="builder-form__input builder-form__input--name"
                placeholder="Name"
                maxLength={30}
                value={member.name}
                onChange={(e) => updateMember(member.id, { name: e.target.value })}
              />
            </div>

            <div className="builder-form__tag-input">
              {member.stack.map((tag) => (
                <span key={tag} className="builder-form__tag">
                  {tag}
                  <button type="button" onClick={() => removeStackTag(member.id, tag)} aria-label={`Remove ${tag}`}>
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={member.stack.length === 0 ? 'React, Node.js, AI/ML…' : 'Add more'}
                value={member.stackInput}
                onChange={(e) => updateMember(member.id, { stackInput: e.target.value })}
                onKeyDown={handleStackKeyDown(member.id, member.stackInput, member.stack)}
                onBlur={() => addStackTag(member.id, member.stackInput)}
              />
            </div>
            <div className="builder-form__suggestions">
              {STACK_SUGGESTIONS.filter((s) => !member.stack.includes(s)).map((s) => (
                <button type="button" key={s} className="builder-form__suggestion" onClick={() => addStackTag(member.id, s)}>
                  + {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {members.length < MAX_MEMBERS && (
        <button type="button" className="builder-form__btn-secondary builder-form__add-member" onClick={addMember}>
          + Add teammate
        </button>
      )}
      <p className="builder-form__hint">
        Photos stay on this device — only names &amp; stacks travel in the shareable QR/link, so it stays small.
      </p>

      {error && <p className="builder-form__error">{error}</p>}

      <button type="submit" className="builder-form__submit">
        Build my Goa QR 🌴
      </button>
    </form>
  );
};

export default BuilderForm;
