interface SkillBadgeProps {
  name: string;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({ name }) => {
  return (
    <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200 shadow-sm hover:shadow transition">
      {name}
    </div>
  );
};

export default SkillBadge;
