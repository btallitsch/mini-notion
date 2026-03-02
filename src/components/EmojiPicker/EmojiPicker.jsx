const EMOJIS = ['📄','📝','📋','📊','🚀','💡','🎯','📌','🔖','⭐','✅','🎨','🔧','📚','🗒️','💼','🌟','🔍','🧩','💻'];

export default function EmojiPicker({ onSelect }) {
  return (
    <div className="animate-fade-in" style={{
      position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100,
      background: '#1e1e2e', border: '1px solid #45475a', borderRadius: 12,
      padding: 10, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)',
      gap: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', width: 180 }}>
      {EMOJIS.map((e) => (
        <button key={e} onClick={() => onSelect(e)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 4, borderRadius: 6, lineHeight: 1 }}
          onMouseEnter={(ev) => ev.target.style.background = '#313244'}
          onMouseLeave={(ev) => ev.target.style.background = 'none'}>
          {e}
        </button>
      ))}
    </div>
  );
}
