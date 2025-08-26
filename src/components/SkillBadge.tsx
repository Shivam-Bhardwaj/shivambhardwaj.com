interface SkillBadgeProps {
  name: string;
}
const emojiBySkill: Record<string, string> = {
  Python: "",
  "C++": "️",
  ROS: "🤖",
  OpenCV: "️",
  PyTorch: "",
  TensorFlow: "🧠",
  Docker: "",
  Git: "",
};
const SkillBadge: React.FC<SkillBadgeProps> = ({ name }) => {
  const emoji = emojiBySkill[name] ?? "";
  return (
    <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200 shadow-sm hover:shadow transition">
      <span className="mr-1" aria-hidden>
        {emoji}
      </span>
      {name}
    </div>
  );
};
export default SkillBadge;
