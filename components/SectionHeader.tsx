type Props = {
  icon: string;
  title: string;
  count?: string;
  action?: string;
};

export default function SectionHeader({ icon, title, count, action }: Props) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      
      <div>
        <span>{icon}</span> <strong>{title}</strong>
        {count && <span style={{ marginLeft: 8, color: "gray" }}>{count}</span>}
      </div>

      {action && (
        <button style={{ cursor: "pointer" }}>
          {action}
        </button>
      )}

    </div>
  );
}