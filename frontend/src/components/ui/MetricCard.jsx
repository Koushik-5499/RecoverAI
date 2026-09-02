const MetricCard = ({ title, value, icon: Icon, description, trend, trendUp }) => {
  return (
    <div className="card card-hover flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted">{title}</h3>
        {Icon && (
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-text">{value}</div>
        {(description || trend) && (
          <div className="mt-2 flex items-center text-sm">
            {trend && (
              <span className={`font-medium mr-2 ${trendUp ? 'text-success' : 'text-danger'}`}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
            )}
            <span className="text-muted">{description}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
