function KpiCard({
  title,
  value,
  color,
}) {
  return (
    <div className={`kpi-card ${color}`}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

export default KpiCard;