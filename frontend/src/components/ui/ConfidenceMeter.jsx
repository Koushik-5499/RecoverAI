const ConfidenceMeter = ({ score }) => {
  const normalizedScore = Math.max(0, Math.min(100, score || 0));
  
  let color = "bg-primary";
  if (normalizedScore >= 80) color = "bg-success";
  else if (normalizedScore >= 50) color = "bg-warning";
  else color = "bg-danger";

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-muted">Confidence Score</span>
        <span className="text-xs font-bold text-text">{normalizedScore}%</span>
      </div>
      <div className="w-full bg-background rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  );
};

export default ConfidenceMeter;
