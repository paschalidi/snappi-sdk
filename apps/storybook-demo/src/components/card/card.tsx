interface CardProps {
  title: string;
  description: string;
  isLoading?: boolean;
}

export const Card: React.FC<CardProps> = ({
                                            title,
                                            description,
                                            isLoading = false
                                          }) => {
  if (isLoading) {
    return (
      <div className="w-72 rounded-lg shadow-lg p-4 animate-pulse">
        <div className="h-48 bg-gray-300 rounded mb-4"/>
        <div className="h-6 bg-gray-300 rounded mb-2"/>
        <div className="h-4 bg-gray-300 rounded w-2/3"/>
      </div>
    );
  }

  return (
    <div className="w-72 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};